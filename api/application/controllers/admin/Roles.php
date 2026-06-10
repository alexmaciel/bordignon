<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Roles extends AdminController
{
    public function __construct()
    {
        parent::__construct();
    }

    /* List all staff members */
    public function getAll()
    {
		$data = $this->roles_model->get();
    }

    public function getItemById($id = '')
    {
		$data = $this->roles_model->get($id);

        $response = array();
        if ($data) {
            $response = $data;
        }

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));          
    }    
}