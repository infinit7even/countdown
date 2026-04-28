<?php
declare(strict_types=1);

namespace OCA\Countdown\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCA\Countdown\Dashboard\CountdownWidget;
use OCA\Countdown\Notification\Notifier;
use OCA\Countdown\BackgroundJob\TimerJob;
use OCA\Countdown\Command\CheckTimers;

class Application extends App implements IBootstrap {
    public const APP_ID = 'countdown';

    public function __construct(array $urlParams = []) {
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerDashboardWidget(CountdownWidget::class);
        $context->registerNotifierService(Notifier::class);
    }

    public function boot(IBootContext $context): void {
    }
}
