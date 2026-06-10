<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Social extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('social_model');
    }

    public function getAll()
    {
		$services = $this->social_model->getAll();
		
		$data = array();
		if(!empty($services)){
			foreach($services as $row){ 

				$staff = $this->staff_model->get($row->staffid);	
                $admin = array(
					'staffid' => $staff->staffid,
					'firstname' => $staff->firstname,
					'lastname' => $staff->lastname,               
					'fullname' => $staff->fullname                  
                );

				$data[] = array(
					'id' => $row->id, 
					'name' => $row->name, 
					'link' => $row->link, 
                    'active' => $row->active, 
					'date' => $row->dateadded, 
					'order' => $row->order, 
					'staff' => $admin, 
				);
			}
		}

		$response = $data;
		
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }

    public function getItemById($id)
    {
		$row = $this->social_model->get($id);

        $data = array(
            'id' => $row->id, 
            'name' => $row->name, 
            'link' => $row->link, 
            'active' => $row->active, 
            'date' => $row->dateadded, 
            'order' => $row->order, 
        );

		$response = $data;
		
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }   
    
    
	public function create()
	{
		$formdata = json_decode(file_get_contents('php://input'), true);
		
        if(!empty($formdata)) {
            $name                   = $formdata['name'];
            $link                   = $formdata['link'];  
            $active                 = $formdata['active'];  
            $staffid                = $formdata['staffid'];

            $data = array(
                'name' => $name,
                'link' => $link,
                'active' => $active,
                'staffid' => $staffid,
            );  

            $success = $this->social_model->add($data);   
            $response = set_alert(
                $success, 'added_successfully', ''
            );	
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));                          
        }
    }   
    
	public function update($id) 
	{
		$formdata = json_decode(file_get_contents('php://input'), true);
		
		if(!empty($formdata)) {
            $name                   = $formdata['name'];
            $active                 = $formdata['active'];  
            $link                   = $formdata['link'];  
            $staffid                = $formdata['staffid'];  

			$data = array(
				'name' => $name,
                'active' => $active,
				'link' => $link,
				'staffid' => $staffid,
            );  

            $success = $this->social_model->update($data, $id);
            $response = set_alert(
                $success, 'updated_successfully', ''
            );	
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));         
        }
    }  
    
	public function sortable() 
	{
		$formdata = json_decode(file_get_contents('php://input'), true);
		if(!empty($formdata)) {
			$data = $formdata['data'];
            if (is_array($data)) {
                foreach ($data as $pos => $social_id) {
                    $this->db->where('id', $social_id['id']);
                    $this->db->update(db_prefix() . 'social', array(
                        'order' => $pos
                    ));                                   				                                  
                }              
            }
        }       
    }  
    
    public function updateStatus()
    {
		$formdata = json_decode(file_get_contents('php://input'), true);
        if(!empty($formdata)) {
            $ids 	    = $formdata['ids'];
            $active 	= $formdata['active'];
            if (is_array($ids)) {
                foreach ($ids as $social_id) {
                    $this->db->where('id', $social_id);
                    $this->db->update(db_prefix() . 'social', array(
                        'active' => $active
                    ));                                   
                }                 
            }
        }    
		  
        $response = array(
            'type' => 'success',
            'message' => _l('updated_successfully')
        );  

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));         
    } 

    public function delete($id)
    {
        $social = $this->social_model->get($id);
        $success = $this->social_model->delete($id);   
        
        if ($success) {
            $response = array(
                'type' => 'success',
                'message' => _l('deleted', 'project'),
            );         
        } else {
            $response = array(
                'type' => 'error',
                'message' => _l('problem_deleting'),
            );   
        }

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }      
}