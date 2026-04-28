<?php
declare(strict_types=1);

namespace OCA\Countdown\Command;

use OCA\Countdown\Service\CountdownNotificationService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use OCP\IUserManager;

class AddCountdown extends Command {
    protected static $defaultName = 'countdown:add';
    private CountdownNotificationService $notificationService;
    private IUserManager $userManager;

    public function __construct(CountdownNotificationService $notificationService, IUserManager $userManager) {
        parent::__construct();
        $this->notificationService = $notificationService;
        $this->userManager = $userManager;
    }

    protected function configure(): void {
        $this->setName(self::$defaultName)
             ->setDescription('Add a new countdown for a user')
             ->addArgument('user_id', InputArgument::REQUIRED, 'The ID of the user')
             ->addArgument('name', InputArgument::REQUIRED, 'The name of the countdown')
             ->addArgument('date', InputArgument::REQUIRED, 'The target date (e.g., "2024-12-25 10:00")')
             ->addArgument('repeat', InputArgument::OPTIONAL, 'Repeat type: none, daily, weekly, monthly, yearly', 'none');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $userId = $input->getArgument('user_id');
        $name = $input->getArgument('name');
        $dateStr = $input->getArgument('date');
        $repeat = $input->getArgument('repeat');

        if (!$this->userManager->userExists($userId)) {
            $output->writeln("<error>User '{$userId}' does not exist.</error>");
            return Command::FAILURE;
        }

        $timestamp = strtotime($dateStr);
        if ($timestamp === false) {
            $output->writeln("<error>Invalid date format: '{$dateStr}'. Use YYYY-MM-DD HH:MM.</error>");
            return Command::FAILURE;
        }

        $targetDateMs = $timestamp * 1000;
        
        $newCd = $this->notificationService->addCountdown($userId, $name, $targetDateMs, $repeat);

        $output->writeln("<info>Successfully added countdown '{$name}' (ID: {$newCd['id']}) for user '{$userId}'.</info>");
        return Command::SUCCESS;
    }
}
