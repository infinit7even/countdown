<?php
declare(strict_types=1);

namespace OCA\Countdown\Command;

use OCA\Countdown\Service\CountdownNotificationService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use OCP\IUserManager;

class DeleteCountdown extends Command {
    protected static $defaultName = 'countdown:delete';
    private CountdownNotificationService $notificationService;
    private IUserManager $userManager;

    public function __construct(CountdownNotificationService $notificationService, IUserManager $userManager) {
        parent::__construct();
        $this->notificationService = $notificationService;
        $this->userManager = $userManager;
    }

    protected function configure(): void {
        $this->setName(self::$defaultName)
             ->setDescription('Delete a specific countdown for a user')
             ->addArgument('user_id', InputArgument::REQUIRED, 'The ID of the user')
             ->addArgument('id', InputArgument::REQUIRED, 'The ID of the countdown to delete');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $userId = $input->getArgument('user_id');
        $id = $input->getArgument('id');

        if (!$this->userManager->userExists($userId)) {
            $output->writeln("<error>User '{$userId}' does not exist.</error>");
            return Command::FAILURE;
        }

        $deleted = $this->notificationService->deleteCountdown($userId, $id);

        if ($deleted) {
            $output->writeln("<info>Successfully deleted countdown '{$id}' for user '{$userId}'.</info>");
        } else {
            $output->writeln("<error>Countdown ID '{$id}' not found for user '{$userId}'.</error>");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
