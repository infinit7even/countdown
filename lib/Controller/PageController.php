<?php
namespace OCA\Countdown\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Controller;

class PageController extends Controller {

    public function __construct($AppName, IRequest $request){
        parent::__construct($AppName, $request);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index() {
        // Correct way to add assets in Nextcloud controllers
        \OCP\Util::addScript('countdown', 'script');
        \OCP\Util::addStyle('countdown', 'style');
        
        return new TemplateResponse('countdown', 'main');
    }
}
