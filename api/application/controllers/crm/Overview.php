<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Overview extends CRMController
{
	public function __construct()
	{
		parent::__construct();
        $this->load->model('overview_model');
    }    

    /* This is admin dashboard view */
    public function index()
    {
        $data['leads_status_stats']         = $this->overview_model->leads_status_stats();
        $data['clients_status_stats']       = $this->overview_model->clients_status_stats();

        $data = hooks()->apply_filters('before_overview_render', $data);

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($data));          
    }    
}