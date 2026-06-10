<?php
/**
 * Facebook SDK Class
 * This class enables you to use the Whatsapp Protocol
 *
 * @subpackage Libraries
 * @category   Facebook
 */

defined('BASEPATH') || exit('No direct script access allowed');

// Load the Facebokk SDK PHP Client Library.
include_once(APPPATH . 'vendor/autoload.php');

use Facebook\Facebook;

class Api_Facebook
{

    /**
     * @var
     */
    public $app_id;
    /**
     * @var
     */
    public $app_secret;    
    /**
     * @var
     */
    private $access_token;
    /**
     * @var
     */
    private $fb;
    /**
     * @var
     */
    private $helper;    

    /**
     * @param string $appId
     * @param string $appSecret
     * @param string $accessToken
     * @param string $version
     * @throws Exception
     */    
    public function __construct(string $appId = "971372567560168", string $appSecret = "85f4347659a3dd63d6e0150a5f64ef45", string $accessToken = null, string $version = "v15.0")
    {

        $this->app_id = $appId;
        $this->app_secret = $appSecret;
        $this->access_token = $accessToken;

        $this->fb = new \Facebook\Facebook([
            'app_id' => $this->app_id,
            'app_secret' => $this->app_secret,
            'default_graph_version' => $version,
            //'default_access_token' => '{access-token}', // optional
        ]);

        $this->helper = $this->fb->getRedirectLoginHelper();

        //$this->createClient();
    }    

    /**
     * @return void
     */
    public function createClient()
    {
        try {
            $accessToken = $this->helper->getAccessToken();
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            // When Graph returns an error
            echo 'Graph returned an error: ' . $e->getMessage();
            exit;
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            // When validation fails or other local issues
            echo 'Facebook SDK returned an error: ' . $e->getMessage();
            exit;
        }
            
        if (!isset($accessToken)) {
            echo 'No OAuth data could be obtained from the signed request. User has not authorized your app yet.';
            exit;
        }
          
        // Logged in
        echo '<h3>Signed Request</h3>';
        var_dump($this->helper->getSignedRequest());
        
        echo '<h3>Access Token</h3>';
        var_dump($accessToken->getValue());    
    }    

    /**
     * @return
     */    
    public function getRedirectLoginHelper()
    {
        return $this->fb->getRedirectLoginHelper();
    }    

    /**
     * @return
     */       
    public function getOAuth2Client()
    {
        return $this->fb->getOAuth2Client();
    }

}