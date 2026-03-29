<?php
namespace OCA\Countdown\Notification;

use OCP\Notification\INotifier;
use OCP\Notification\INotification;
use OCP\IL10N;

class Notifier implements INotifier {
    private IL10N $l10n;

    public function __construct(IL10N $l10n) {
        $this->l10n = $l10n;
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
            $notification->setParsedSubject(
                (string)$this->l10n->t('Un countdown è terminato!')
            );
            
            $params = $notification->getSubjectParameters();
            if (isset($params['name'])) {
                $notification->setParsedSubject(
                    (string)$this->l10n->t('Countdown "%s" è terminato!', [$params['name']])
                );
            }
        }

        return $notification;
    }
}
