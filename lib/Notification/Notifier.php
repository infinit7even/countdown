<?php
namespace OCA\Countdown\Notification;

use OCP\Notification\INotifier;
use OCP\Notification\INotification;
use OCP\IL10N;
use OCP\IURLGenerator;

class Notifier implements INotifier {
    private IL10N $l10n;
    private IURLGenerator $urlGenerator;

    public function __construct(IL10N $l10n, IURLGenerator $urlGenerator) {
        $this->l10n = $l10n;
        $this->urlGenerator = $urlGenerator;
    }

    public function getID(): string {
        return 'countdown';
    }

    public function getName(): string {
        return $this->l10n->t('Countdown');
    }

    public function prepare(INotification $notification, string $languageCode): INotification {
        if ($notification->getApp() !== 'countdown') {
            throw new \InvalidArgumentException();
        }

        // Set icon and link for maximum visibility in the browser
        $notification->setIcon($this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('countdown', 'app-dark.svg')));
        $notification->setLink($this->urlGenerator->linkToRouteAbsolute('countdown.page.index'));

        if ($notification->getSubject() === 'timer_finished') {
            $params = $notification->getSubjectParameters();
            $name = $params['name'] ?? 'Countdown';

            $notification->setParsedSubject((string)$this->l10n->t('Countdown finished! 🎉'));
            $notification->setParsedMessage((string)$this->l10n->t('The timer "%s" has completed.', [$name]));
            
            return $notification;
        }

        return $notification;
    }
}
