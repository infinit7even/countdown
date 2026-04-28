<?php
declare(strict_types=1);

namespace OCA\Countdown\Command;

use OCA\Countdown\Service\CountdownNotificationService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\Table;
use OCP\IUserManager;

class ListCountdowns extends Command {
    protected static $defaultName = 'countdown:list';
    private CountdownNotificationService $notificationService;
    private IUserManager $userManager;

    public function __construct(CountdownNotificationService $notificationService, IUserManager $userManager) {
        parent::__construct();
        $this->notificationService = $notificationService;
        $this->userManager = $userManager;
    }

    protected function configure(): void {
        $this->setName(self::$defaultName)
             ->setDescription('List all countdowns for a specific user')
             ->addArgument('user_id', InputArgument::REQUIRED, 'The ID of the user');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $userId = $input->getArgument('user_id');
        
        if (!$this->userManager->userExists($userId)) {
            $output->writeln("<error>User '{$userId}' does not exist.</error>");
            return Command::FAILURE;
        }

        $countdowns = $this->notificationService->getCountdowns($userId);

        if (empty($countdowns)) {
            $output->writeln("<info>No countdowns found for user '{$userId}'.</info>");
            return Command::SUCCESS;
        }

        $table = new Table($output);
        $table->setHeaders(['ID', 'Name', 'Target Date', 'Repeat', 'Notified']);

        foreach ($countdowns as $cd) {
            $targetDate = isset($cd['targetDate']) ? date('Y-m-d H:i:s', (int)($cd['targetDate'] / 1000)) : 'N/A';
            $table->addRow([
                $cd['id'] ?? 'N/A',
                $cd['name'] ?? 'N/A',
                $targetDate,
                $cd['repeat'] ?? 'none',
                (isset($cd['notified']) && $cd['notified']) ? 'Yes' : 'No'
            ]);
        }

        $table->render();
        return Command::SUCCESS;
    }
}
