<?php
declare(strict_types=1);

namespace OCA\Countdown\Command;

use OCA\Countdown\Service\CountdownNotificationService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * OCC command: occ countdown:check-timers
 *
 * Immediately scans all users' countdowns and sends notifications
 * for any expired timers. Useful for admins who want to trigger
 * the check manually or debug notification delivery.
 */
class CheckTimers extends Command {
    private CountdownNotificationService $notificationService;

    public function __construct(CountdownNotificationService $notificationService) {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    protected function configure(): void {
        $this->setName('countdown:check-timers')
             ->setDescription('Check all users\' countdowns and send notifications for expired timers immediately.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $output->writeln('<info>Countdown: checking expired timers for all users...</info>');

        $log = function (string $message) use ($output): void {
            $output->writeln($message);
        };

        $sent = $this->notificationService->checkAllUsers($log);

        if ($sent === 0) {
            $output->writeln('<comment>No expired timers found.</comment>');
        } else {
            $output->writeln("<info>Done. {$sent} notification(s) sent.</info>");
        }

        return Command::SUCCESS;
    }
}
