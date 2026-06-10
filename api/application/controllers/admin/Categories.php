<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Categories extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('categories_model');
    }

    public function getAll()
    {
		$categories = $this->categories_model->getAll();
		
		$data = array();
		if(!empty($categories)){
			foreach($categories as $row){ 

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
					'description' => $row->description, 
					'folder' => base_url('api/uploads/'.$row->folder . '/icons/'), 
					'file_name' => $row->file_name, 
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
		$row = $this->categories_model->get($id);

        $data = array(
            'id' => $row->id, 
            'name' => $row->name, 
            'description' => $row->description, 
            'folder' => base_url('api/uploads/' . $row->folder. '/icons/'), 
            'file_name' => $row->file_name, 
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
            $description            = $formdata['description'];  
            $staffid                = $formdata['staffid'];

            $data = array(
                'name' => $name,
                'description' => $description,
                'staffid' => $staffid,
            );  

            $id = $this->categories_model->add($data);  
            if($id) {
                $response = array(
                    'type' => 'success',
                    'message' => _l('added_successfully', _l('project')),
                    'id' => $id
                );                  
            }
            
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
            $description            = $formdata['description'];  
            $staffid                = $formdata['staffid'];
            
			$data = array(
				'name' => $name,
				'description' => $description,
                'staffid' => $staffid,
            );  

            $result = $this->categories_model->update($data, $id);

            if(isset($result)) {
                $response = set_alert(
                    $result, 'updated_successfully', 'project'
                );	
            }
            
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
                foreach ($data as $pos => $category_id) {
                    $this->db->where('id', $category_id['id']);
                    $this->db->update(db_prefix() . 'categories', array(
                        'order' => $pos
                    ));                                   				                                  
                }              
            }
        }       
    }  
    
    public function delete($id)
    {

        $success = $this->categories_model->delete($id);   
        
        if (isset($success)) {
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
    
    /**
     * Handles upload for category files
     * @param  mixed $categoryid post id
     * @return boolean
     */
	public function uploadPicture() 
	{
		$id = $this->input->post('id');

        $success = handle_category_file_uploads($id);

        if (is_array($success) && isset($success['message'])) {
            $response = array(
                'type' => 'error',
                'message' => $success['message']
            );
        } elseif ($success == true) {
            $response = array(
                'type' => 'success',
                'message' => _l('file_uploaded_success')
            );                
        } else {
            $response = array(
                'type' => 'error',
                'message' => $success['message']
            );                
        }

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));          
    }  
    
	public function deletePicture($id)
	{
        $success = $this->categories_model->delete_picture($id);
        
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
            ->set_status_header(200)
            ->set_content_type('application/json')
            ->set_output(json_encode($response));         
    }     
}