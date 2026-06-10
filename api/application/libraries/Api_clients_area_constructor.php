<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Api_clients_area_constructor
{
    private $ci;

    public function __construct()
    {
        $this->ci = &get_instance();

        // Clients
        $this->ci->load->model('staff_model');   
        $this->ci->load->model('slides_model');   
        $this->ci->load->model('categories_model');   
        $this->ci->load->model('company_model');   
        $this->ci->load->model('services_model');   
        $this->ci->load->model('teams_model'); 
        $this->ci->load->model('leads_model');   
        $this->ci->load->model('social_model');    
        $this->ci->load->model('settings_model');
        
        $vars = [];
        //hooks()->do_action('clients_init');

        $vars = hooks()->apply_filters('api_area_autoloaded_vars', $vars);

        $this->ci->load->vars($vars);        
    }
    
}