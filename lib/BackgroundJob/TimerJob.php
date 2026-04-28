<?php
declare(strict_types=1);

namespace OCA\Countdown\BackgroundJob;

use OCP\AppFramework\Utility\ITimeFactory;
use OCP\BackgroundJob\TimedJob;
use OCP\IConfig;
use OCP\IUserManager;
use OCP\Notification\IManager as INotificationManager;

/**
 * Background job that checks all users' countdowns and sends
 * server-side notifications when a timer expires, regardless
 * of whether the user has the app page open.
 */
class TimerJob extends TimedJob {
    private IConfig $config;
    private IUserManager $userManager;
    private INotificationManager $notificationManager;

    public function __construct(
        ITimeFactory $time,
        IConfig $config,
        IUserManager $userManager,
        INotificationManager $notificationManager
    ) {
        parent::__construct($time);
        // Run every 5 minutes
        $this->setInterval(5 * 60);
        $this->config = $config;
        $this->userManager = $userManager;
        $this->notificationManager = $notificationManager;
    }

    protected function run($argument): void {
        $this->userManager->callForAllUsers(function (\OCP\IUser $user) {
            $this->checkUserCountdowns($user->getUID());
        });
    }

    private function checkUserCountdowns(string $userId): void {
        $data = $this->config->getUserValue($userId, 'countdown', 'countdowns_data', '[]');
        $countdowns = json_decode($data, true);

        if (!is_array($countdowns) || empty($countdowns)) {
            return;
        }

        $nowMs = (int)(microtime(true) * 1000);
        $changed = false;

        foreach ($countdowns as &$cd) {
            $targetDate = isset($cd['targetDate']) ? (int)$cd['targetDate'] : 0;
            $notified   = isset($cd['notified']) ? (bool)$cd['notified'] : false;

            if ($targetDate <= 0 || $notified) {
                continue;
            }

            if ($nowMs >= $targetDate) {
                // Send the Nextcloud notification
                $this->sendNotification($userId, $cd['name'] ?? 'Countdown');

                // Mark as notified and handle recurrence
                $repeat      = $cd['repeat'] ?? 'none';
                $repeatValue = isset($cd['repeatValue']) ? (float)$cd['repeatValue'] : 1.0;

                if ($repeat !== 'none') {
                    $nextDate = $this->calculateNextDate($targetDate, $repeat, $repeatValue, $nowMs);
                    $cd['targetDate'] = $nextDate;
                    $cd['notified']   = false;
                } else {
                    $cd['notified'] = true;
                }

                $changed = true;
            }
        }
        unset($cd);

        if ($changed) {
            $this->config->setUserValue($userId, 'countdown', 'countdowns_data', json_encode($countdowns));
        }
    }

    private function sendNotification(string $userId, string $name): void {
        // Avoid duplicate notifications: mark any previous ones as processed first
        $existing = $this->notificationManager->createNotification();
        $existing->setApp('countdown')
                 ->setUser($userId)
                 ->setObject('timer', $name);
        $this->notificationManager->markProcessed($existing);

        $notification = $this->notificationManager->createNotification();
        $notification->setApp('countdown')
                     ->setUser($userId)
                     ->setDateTime(new \DateTime())
                     ->setObject('timer', $name)
                     ->setSubject('timer_finished', ['name' => $name]);

        $this->notificationManager->notify($notification);
    }

    private function calculateNextDate(int $currentDateMs, string $type, float $value, int $nowMs): int {
        $date = new \DateTime('@' . (int)($currentDateMs / 1000));
        $now  = (int)($nowMs / 1000);

        while ($date->getTimestamp() <= $now) {
            switch ($type) {
                case 'daily':
                    $date->modify('+1 day');
                    break;
                case 'weekly':
                    $date->modify('+7 days');
                    break;
                case 'monthly':
                    $date->modify('+1 month');
                    break;
                case 'yearly':
                    $date->modify('+1 year');
                    break;
                case 'custom':
                    $seconds = (int)round($value * 86400);
                    $date->modify("+{$seconds} seconds");
                    break;
                default:
                    break 2; // exit both while and switch
            }
        }

        return $date->getTimestamp() * 1000;
    }
}
