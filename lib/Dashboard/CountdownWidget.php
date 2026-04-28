<?php
namespace OCA\Countdown\Dashboard;

use OCP\Dashboard\IAPIWidget;
// Evitiamo interfacce V2 troppo nuove per compatibilità NC 25-26
use OCP\DashboardModel\WidgetItem;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IURLGenerator;

class CountdownWidget implements IAPIWidget {
    
    private IL10N $l10n;
    private IURLGenerator $urlGenerator;
    private IConfig $config;

    public function __construct(IL10N $l10n, IURLGenerator $urlGenerator, IConfig $config) {
        $this->l10n = $l10n;
        $this->urlGenerator = $urlGenerator;
        $this->config = $config;
    }

    public function getId(): string {
        return 'countdown_widget';
    }

    public function getTitle(): string {
        return $this->l10n->t('Countdown!');
    }

    public function getOrder(): int {
        return 10;
    }

    public function getIconClass(): string {
        return 'icon-countdown';
    }

    public function getUrl(): ?string {
        return $this->urlGenerator->linkToRouteAbsolute('countdown.page.index');
    }

    public function load(): void {
        \OCP\Util::addScript('countdown', 'dashboard');
        \OCP\Util::addStyle('countdown', 'dashboard');
    }

    /**
     * Metodo per la compatibilità con le API della Dashboard
     */
    public function getItems(string $userId, ?string $since = null, int $limit = 7): array {
        $data = $this->config->getUserValue($userId, 'countdown', 'countdowns_data', '[]');
        $countdowns = json_decode($data, true);
        
        if (!is_array($countdowns)) {
            $countdowns = [];
        }

        $items = [];
        $now = time() * 1000;

        usort($countdowns, function($a, $b) {
            return ($a['targetDate'] ?? 0) <=> ($b['targetDate'] ?? 0);
        });

        $count = 0;
        foreach ($countdowns as $cd) {
            if ($count >= $limit) {
                break;
            }

            $targetDate = $cd['targetDate'] ?? 0;
            $distance = $targetDate - $now;
            if ($distance < 0) {
                $subtitle = $this->l10n->t('Already expired!');
            } else {
                $days = floor($distance / (1000 * 60 * 60 * 24));
                $subtitle = ($days > 0) ? $this->l10n->t('Expires in %n days', [$days]) : $this->l10n->t('Expires today!');
            }

            $items[] = new WidgetItem(
                (string)($cd['name'] ?? 'Unknown'), 
                $subtitle,   
                $this->getUrl() ?? '',
                '', 
                (string)($cd['id'] ?? '')
            );
            $count++;
        }

        return $items;
    }


}
