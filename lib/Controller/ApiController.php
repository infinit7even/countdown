<?php
namespace OCA\Countdown\Controller;

use OCP\IRequest;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IConfig;
use OCP\IUserSession;
use OCP\Notification\IManager as INotificationManager;

class ApiController extends Controller {
    private IConfig $config;
    private INotificationManager $notificationManager;
    private IUserSession $userSession;

    public function __construct(string $AppName, IRequest $request, IConfig $config, INotificationManager $notificationManager, IUserSession $userSession) {
        parent::__construct($AppName, $request);
        $this->config = $config;
        $this->notificationManager = $notificationManager;
        $this->userSession = $userSession;
    }

    private function getUserId(): ?string {
        $user = $this->userSession->getUser();
        return $user ? $user->getUID() : null;
    }

    /**
     * @NoAdminRequired
     */
    public function notify(string $name): DataResponse {
        $userId = $this->getUserId();
        if ($userId === null) {
            return new DataResponse([], 403);
        }

        $notification = $this->notificationManager->createNotification();
        $notification->setApp($this->appName)
            ->setUser($userId)
            ->setDateTime(new \DateTime())
            ->setObject('timer', $name)
            ->setSubject('timer_finished', ['name' => $name]);

        $this->notificationManager->markProcessed($notification);
        $this->notificationManager->notify($notification);

        return new DataResponse(['status' => 'success']);
    }

    /**
     * @NoAdminRequired
     */
    public function getCountdowns(): DataResponse {
        $userId = $this->getUserId();
        if ($userId === null) {
            return new DataResponse([], 403);
        }
        $data = $this->config->getUserValue($userId, $this->appName, 'countdowns_data', '[]');
        return new DataResponse(json_decode($data, true));
    }

    /**
     * @NoAdminRequired
     */
    public function saveCountdowns(array $countdowns = []): DataResponse {
        $userId = $this->getUserId();
        if ($userId === null) {
            return new DataResponse(['status' => 'error'], 403);
        }
        $jsonString = json_encode($countdowns);
        $this->config->setUserValue($userId, $this->appName, 'countdowns_data', $jsonString);
        return new DataResponse(['status' => 'success']);
    }
}
