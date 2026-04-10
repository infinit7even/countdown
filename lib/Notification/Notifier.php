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

        if ($notification->getSubject() === 'timer_finished') {
            $notification->setIcon($this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('countdown', 'app.svg')));
            $notification->setParsedSubject(
                (string)$this->l10n->t('A countdown has finished!')
            );
            
            $params = $notification->getSubjectParameters();
            if (isset($params['name'])) {
                $notification->setParsedSubject(
                    (string)$this->l10n->t('Countdown "%s" has finished!', [$params['name']])
                );
            }
        }

        return $notification;
    }
}
