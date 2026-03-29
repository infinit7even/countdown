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
        // Carica il file templates/main.php
        return new TemplateResponse('countdown', 'main');
    }
}
