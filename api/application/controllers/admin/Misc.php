<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Misc extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('misc_model');
    }
}