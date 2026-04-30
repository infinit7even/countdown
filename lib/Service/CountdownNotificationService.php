<?php
declare(strict_types=1);

namespace OCA\Countdown\Service;

use OCP\IConfig;
use OCP\IUserManager;
use OCP\Notification\IManager as INotificationManager;

/**
 * Shared service that scans all users' countdowns and sends
 * server-side Nextcloud notifications for expired timers.
 * Used by both the background job (TimerJob) and the OCC command.
 */
class CountdownNotificationService {
    private IConfig $config;
    private IUserManager $userManager;
    private INotificationManager $notificationManager;

    public function __construct(
        IConfig $config,
        IUserManager $userManager,
        INotificationManager $notificationManager
    ) {
        $this->config = $config;
        $this->userManager = $userManager;
        $this->notificationManager = $notificationManager;
    }

    /**
     * Check all users and send notifications for expired countdowns.
     *
     * @param callable|null $log  Optional logger callback: fn(string $message): void
     * @return int Number of notifications sent
     */
    public function checkAllUsers(?callable $log = null): int {
        $total = 0;
        $this->userManager->callForAllUsers(function (\OCP\IUser $user) use ($log, &$total) {
            $sent = $this->checkUserCountdowns($user->getUID(), $log);
            $total += $sent;
        });
        return $total;
    }

    /**
     * Check a single user's countdowns and send notifications.
     *
     * @param callable|null $log  Optional logger callback
     * @return int Number of notifications sent for this user
     */
    public function checkUserCountdowns(string $userId, ?callable $log = null): int {
        $data = $this->config->getUserValue($userId, 'countdown', 'countdowns_data', '[]');
        $countdowns = json_decode($data, true);

        if (!is_array($countdowns) || empty($countdowns)) {
            return 0;
        }

        $nowMs   = (int)(microtime(true) * 1000);
        $changed = false;
        $sent    = 0;

        foreach ($countdowns as &$cd) {
            $targetDate = isset($cd['targetDate']) ? (int)$cd['targetDate'] : 0;
            $notified   = isset($cd['notified']) ? (bool)$cd['notified'] : false;

            if ($targetDate <= 0 || $notified) {
                continue;
            }

            if ($nowMs >= $targetDate) {
                $name = $cd['name'] ?? 'Countdown';
                $this->sendNotification($userId, $name);
                $sent++;

                if ($log !== null) {
                    $log("  → Notified [{$userId}]: {$name}");
                }

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

        return $sent;
    }

    /**
     * Get all countdowns for a specific user.
     */
    public function getCountdowns(string $userId): array {
        $data = $this->config->getUserValue($userId, 'countdown', 'countdowns_data', '[]');
        return json_decode($data, true) ?: [];
    }

    /**
     * Add a new countdown for a user.
     *
     * @return array The newly created countdown
     */
    public function addCountdown(string $userId, string $name, int $targetDateMs, string $repeat = 'none', float $repeatValue = 1.0): array {
        $countdowns = $this->getCountdowns($userId);
        
        $newCd = [
            'id' => uniqid('cd_', true),
            'name' => $name,
            'targetDate' => $targetDateMs,
            'repeat' => $repeat,
            'repeatValue' => $repeatValue,
            'notified' => false,
            'createdAt' => (int)(microtime(true) * 1000)
        ];

        $countdowns[] = $newCd;
        $this->config->setUserValue($userId, 'countdown', 'countdowns_data', json_encode($countdowns));
        
        return $newCd;
    }

    /**
     * Delete a specific countdown for a user.
     *
     * @return bool True if deleted, false if not found
     */
    public function deleteCountdown(string $userId, string $id): bool {
        $countdowns = $this->getCountdowns($userId);
        $initialCount = count($countdowns);
        
        $countdowns = array_filter($countdowns, function($cd) use ($id) {
            return ($cd['id'] ?? '') !== $id;
        });

        if (count($countdowns) === $initialCount) {
            return false;
        }

        $this->config->setUserValue($userId, 'countdown', 'countdowns_data', json_encode(array_values($countdowns)));
        return true;
    }

    private function sendNotification(string $userId, string $name): void {
        $notification = $this->notificationManager->createNotification();
        $notification->setApp('countdown')
                     ->setUser($userId)
                     ->setDateTime(new \DateTime())
                     // Unique object ID with microtime ensures instant delivery without deduplication
                     ->setObject('timer', $name . '_' . microtime(true))
                     ->setSubject('timer_finished', ['name' => $name]);

        // Trigger high priority for immediate browser popup delivery
        if (method_exists($notification, 'setPriority')) {
            $notification->setPriority(1); // PRIORITY_HIGH
        }

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
                    break 2;
            }
        }

        return $date->getTimestamp() * 1000;
    }
}
