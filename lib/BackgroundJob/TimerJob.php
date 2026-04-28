<?php
declare(strict_types=1);

namespace OCA\Countdown\BackgroundJob;

use OCP\AppFramework\Utility\ITimeFactory;
use OCP\BackgroundJob\TimedJob;
use OCA\Countdown\Service\CountdownNotificationService;

/**
 * Background job that checks all users' countdowns every 5 minutes
 * and sends server-side notifications when a timer expires.
 */
class TimerJob extends TimedJob {
    private CountdownNotificationService $notificationService;

    public function __construct(
        ITimeFactory $time,
        CountdownNotificationService $notificationService
    ) {
        parent::__construct($time);
        // Run every 5 minutes
        $this->setInterval(5 * 60);
        $this->notificationService = $notificationService;
    }

    protected function run($argument): void {
        $this->notificationService->checkAllUsers();
    }
}
