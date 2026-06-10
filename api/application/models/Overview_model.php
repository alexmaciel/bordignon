<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Overview_model extends Api_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('overview_model');

    }

    public function clients_status_stats()
    {
        $chart = [
            'labels'   => [],
            'datasets' => [],
        ];

        $_data                         = [];
        $_data['data']                 = [];
        $_data['backgroundColor']      = [];
        $_data['hoverBackgroundColor'] = [];
        $_data['statusLink']           = [];

        $total_clients = $this->overview_model->db->count_all_results(db_prefix() . 'clients');

        $chart['datasets'][0]['name'] = _l('leads');
        $chart['total'] = $total_clients;  
        
        return $chart; 
    }

    public function leads_status_stats()
    {
        $chart = [
            'labels'   => [],
            'datasets' => [],
        ];

        $_data                         = [];
        $_data['data']                 = [];
        $_data['backgroundColor']      = [];
        $_data['hoverBackgroundColor'] = [];
        $_data['statusLink']           = [];

        $result = get_leads_summary();

        foreach ($result as $status) {
            if ($status['color'] == '') {
                $status['color'] = '#737373';
            }
            array_push($chart['labels'], $status['name']);
            array_push($_data['backgroundColor'], $status['color']);
            if (!isset($status['junk']) && !isset($status['lost'])) {
                array_push($_data['statusLink'], admin_url('leads?status=' . $status['id']));
            }
            array_push($_data['hoverBackgroundColor'], adjust_color_brightness($status['color'], -20));
            array_push($_data['data'], $status['total']);

            //array_push($_data['total'], $status['percent']);
        }

        $this->load->model('overview_model');
        $total_leads = $this->overview_model->db->count_all_results(db_prefix() . 'leads');

        $chart['datasets'][0]['name'] = _l('clients');
        $chart['datasets'][] = $_data;

        $chart['total'] = $total_leads;

        return $chart;        
    }    
}