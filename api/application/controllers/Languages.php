<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Languages extends Api_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        $this->languages();
    }

	public function languages()
	{
        $this->safe(function () {
            $data = $this->languages_model->get(null, ['active' => 1]);

            return $this->respond($data, 200);
        }); 
	}  
    
    public function change_language()
    {
        $this->safe(function () {
            if (is_language_disabled()) {
                return $this->unprocessable('Language change is disabled.');
            }
            
            // Load payload (expects JSON body)
            $formdata = $this->readJson();  
            
            // array
            $data = [];
            if (array_key_exists('lang', $formdata)) {
                $data['lang'] = trim((string) $formdata['lang']);
            }

            if (empty($data['lang'])) {
                return $this->unprocessable('Missing or invalid language.', [
                    'lang' => 'Required.'
                ]);
            }

            $availableLanguages = $this->api->get_all_languages();

            if (!in_array($data['lang'], $availableLanguages)) {
                return $this->unprocessable('Invalid language.', [
                    'lang' => 'Language is not available.'
                ]);
            }

            set_contact_language($data['lang']);

            $response = [
                'default_language' => $data['lang']
            ];

            return $this->ok($response, 'update', 'language');
        });
    }     
}