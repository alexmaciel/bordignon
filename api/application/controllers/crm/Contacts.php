<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Contacts extends CRMController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('contacts_model');
    }

    /**
     * Get all products with optional filters.
     *
     * Returns:
     * 200 OK with an array (possibly empty).
     * 500 on unexpected errors (handled by $this->safe()).
     */   
    public function getAll()
    {
        $this->safe(function () {
            $contacts = $this->contacts_model->getAll();

            // array|object|null
            if (empty($contacts)) {
                return $this->respond([], 200);
            }

            // Helper: convert date to ISO format
            $toIso = function ($dateStr) {
                $timestamp = strtotime((string) $dateStr);
                return $timestamp ? date('c', $timestamp) : (string) $dateStr;
            };

            $data = [];

			foreach($contacts as $row){              
				$data[] = [
                    'id'            => isset($row->id) ? (int) $row->id : null,
                    'firstname'     => (string) ($row->firstname ?? ''),
                    'lastname'      => (string) ($row->lastname ?? ''),
                    'fullname'      => (string) ($row->fullname ?? ''),
                    'company'       => (string) ($row->company ?? ''),
					'phonenumber'   => isset($row->phonenumber) ? (string) $row->phonenumber : null,
                    'profile_image' => contact_profile_image_url($row->id, 'small'),
                    'email'         => isset($row->email) ? (string) $row->email : null,
					'date'          => $toIso($row->datecreated ?? null),
					'active'        => isset($row->active) ? (int) $row->active : 0,
                    'last_login'    => $toIso($row->last_login ?? null),
                    'is_primary'    => isset($row->is_primary) ? (int) $row->is_primary : 0,                 
                ];                 
            }
  
            return $this->respond($data, 200);
        });       
    }    

    /**
     * Get a single client by id.
     *
     * Validates the id, resolves the current language, fetches the client
     *
     * Responses:
     * - 200 OK with the item payload
     * - 404 Not Found when the client does not exist
     * - 422 Unprocessable when id is missing/invalid
     * - 500 on unexpected errors (handled by $this->safe())
     *
     * @param mixed $id
     * @return void (echo JSON)
     */  
    public function getContactByClientId($id)
    {
        $this->safe(function () use ($id) {
            $pid = (int) $id;

            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }     

            $row = $this->contacts_model->get_contacts($pid);
            if (empty($row)) {
                return $this->notFound('Contact not found.');
            }

            // Helper: convert date to ISO format
            $toIso = function($dateStr) {
                $ts = strtotime((string)$dateStr);
                return $ts ? date('c', $ts) : (string)$dateStr;
            };    

            $data = [];
			foreach($contacts as $row){              
				$data[] = [
					'id'            => isset($row->id) ? (int) $row->id : null,
					'userid'        => isset($row->userid) ? (int) $row->userid : null,
                    'firstname'     => (string) ($row->firstname ?? ''),
                    'lastname'      => (string) ($row->lastname ?? ''),
                    'fullname'      => (string) ($row->fullname ?? ''),
					'phonenumber'   => isset($row->phonenumber) ? (string) $row->phonenumber : null,
                    'profile_image' => contact_profile_image_url($row->id, 'small'),
                    'email'         => isset($row->email) ? (string) $row->email : null,
					'date'          => $toIso($row->datecreated ?? null),
					'active'        => isset($row->active) ? (int) $row->active : 0,
                    'last_login'    => $toIso($row->last_login ?? null),
                    'is_primary'    => isset($row->is_primary) ? (int) $row->is_primary : 0,                  
                ]; 

                return $this->respond($data, 200);                
            }
        });       
    } 

    /* List Contacts */
    public function getClientTable()
    {
        $contacts = $this->contacts_model->getTable();

        $contact = array();
		if(!empty($contacts)){
			foreach($contacts as $row){              
				$contact[] = array(
					'id' => $row->id,
					'userid' => $row->userid,
                    'firstname' => $row->firstname,
                    'lastname' => $row->lastname,
                    'fullname' => $row->fullname,
					'phonenumber' => $row->phonenumber,
                    'profile_image' => contact_profile_image_url($row->id, 'small'),
                    'email' => $row->email,
					'date' => $row->datecreated,
					'active' => $row->active,
                    'last_login' => $row->last_login,
                    'is_primary' => $row->is_primary,                    
                );                 
            }
        }        
		$response = $contact;
		
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    } 

    /* Get contact id */
    public function getItemById($id)
    {
		$contact = $this->contacts_model->get($id);

        if(!empty($id)) {
            $response = array(
                'id' => $contact->id,
                'userid' => $contact->userid,
                'firstname' => $contact->firstname,
                'lastname' => $contact->lastname,
                'fullname' => $contact->fullname,
                'profile_image' => contact_profile_image_url($contact->id, 'small'),
                'phonenumber' => $contact->phonenumber,
                'email' => $contact->email,
                'active' => $contact->active,
                'is_primary' => $contact->is_primary,  
            );
        } else {
            $response = array(
                'type' => 'info',
                'message' => 'Could not find contact for specified ID',
            );     
        }
        
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));       
    }    

    /* Add new contact*/
    public function create()
    {
        $formdata = json_decode(file_get_contents('php://input'), true);  

        if(!empty($formdata)) {

            $firstname 	    = $formdata['firstname']; 
            $lastname 	    = $formdata['lastname']; 
            $phonenumber 	= $formdata['phonenumber']; 
            $email 	        = $formdata['email']; 
            $password 	    = $formdata['password']; 
            $active 	    = $formdata['active'];  
            $userid 	    = $formdata['userid'];
            $is_primary 	= $formdata['is_primary'];

            $send_set_password_email 	= $formdata['send_set_password_email'];

            if (is_automatic_calling_codes_enabled()) {
                $clientCountryId = $this->db->select('country')
                    ->where('userid', $userid)
                    ->get(db_prefix() . 'clients')->row()->country ?? null;
    
                $clientCountry = get_country($clientCountryId);
                $callingCode   = $clientCountry ? '+' . ltrim($clientCountry->calling_code, '+') : null;
            } else {
                $callingCode = null;
            }
                        
            if ($callingCode && !empty($phonenumber) && $phonenumber == $callingCode) {
                $phonenumber = '';
            }  

            $data = array(
                "firstname" => $firstname,
                "lastname" => $lastname,
                "password" => $password,
                "phonenumber" => $phonenumber,
                "email" => $email,
                'active' => $active,			
                'userid' => $userid,			
                'is_primary' => $is_primary		
            );
            

            $id = $this->contacts_model->add($data, $send_set_password_email);
            if ($id) {
                $success = true;
                $response = set_alert(
                    $success, 'added_successfully', 'contact'
                ); 
            }

            $this->output
				->set_content_type('application/json')
				->set_output(json_encode($response)); 
        }
    }

    /* Edit contact*/
    public function update($id)
    {
		$formdata = json_decode(file_get_contents('php://input'), true);

        if(!empty($formdata)) {
            $firstname 	    = $formdata['firstname']; 
            $lastname 	    = $formdata['lastname']; 
            $phonenumber 	= $formdata['phonenumber']; 
            $email 	        = $formdata['email']; 
            $password 	    = $formdata['password']; 
            $active 	    = $formdata['active'];  
            $userid 	    = $formdata['userid'];
            $is_primary 	= $formdata['is_primary'];

            $send_set_password_email 	= $formdata['send_set_password_email'];
            
            if (is_automatic_calling_codes_enabled()) {
                $clientCountryId = $this->db->select('country')
                    ->where('userid', $userid)
                    ->get(db_prefix() . 'clients')->row()->country ?? null;
    
                $clientCountry = get_country($clientCountryId);
                $callingCode   = $clientCountry ? '+' . ltrim($clientCountry->calling_code, '+') : null;
            } else {
                $callingCode = null;
            }
                        
            if ($callingCode && !empty($phonenumber) && $phonenumber == $callingCode) {
                $phonenumber = '';
            }            

			$data = array(
                "firstname" => $firstname,
                "lastname" => $lastname,
                "password" => $password,
                "phonenumber" => $phonenumber,
                "email" => $email,
                'active' => $active,			
                'userid' => $userid,			
                'is_primary' => $is_primary			
            );            
            
            $original_contact   = $this->contacts_model->get($id);
            $success            = $this->contacts_model->update($data, $id, $send_set_password_email);
            $message            = '';
            $proposal_warning   = false;
            $original_email     = '';
            $updated            = false; 
            if (is_array($success)) {
                if (isset($success['set_password_email_sent'])) {
                    $response = array(
                        'type' => 'success',
                        'message' => _l('set_password_email_sent_to_client'),
                    );   
                } elseif (isset($success['set_password_email_sent_and_profile_updated'])) {
                    $updated = true;
                    $response = array(
                        'type' => 'success',
                        'message' => _l('set_password_email_sent_to_client_and_profile_updated'),
                    );                  
                }            
            } else {
                if ($success) {
                    $updated = true;
                    $response = array(
                        'type' => 'success',
                        'message' => _l('updated_successfully', _l('contact')),
                    );                       
                } elseif ($success == 0) {
                    $response = array(
                        'type' => 'info',
                        'message' => _l('updated_successfully', _l('contact')),
                    );  
                }
            }   

            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));         
        }
    }

    /* Delete contact */
	public function delete($id)
	{
		$contact = $this->contacts_model->get($id);
        $success = $this->contacts_model->delete($id);

        if($success) {
            $response = array(
                'type' => 'success',
                'message' => _l('deleted', _l('contact')),
            );         
        } else {
            $response = array(
                'type' => 'error',
                'message' => _l('problem_deleting', _l('contact')),
            );                
        }   
        
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));          
    }   
    
    public function deleteItems()
    {
		$formdata = json_decode(file_get_contents('php://input'), true);
		
        if(!empty($formdata)) {
            $ids = $formdata['ids'];
            if (is_array($ids)) {
                foreach ($ids as $contact_id) {
                    $project = $this->contacts_model->get($contact_id);
                    $success = $this->contacts_model->delete($contact_id);                                
                }                 
            }
        }          
    }     

    public function updateStatus()
    {
		$formdata = json_decode(file_get_contents('php://input'), true);
		
        if(!empty($formdata)) {
            $ids 	        = $formdata['ids'];
            $is_primary 	= $formdata['active'];
            
            $data = array(
                "is_primary" => $is_primary,
            );

            if (is_array($ids)) {
                foreach ($ids as $contact_id) {
                    $success = $this->contacts_model->update_status($data, $contact_id);   
                    if($success) {
                        $response = array(
                            'type' => 'success',
                            'message' => _l('updated_successfully', _l('contact')),
                        );         
                    }            
                }                 
            }

        }   

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));     
    }     

    /**
     * Handles upload for contact files
     * @param  mixed $contactid post id
     * @return boolean
     */
	public function uploadPicture() 
	{
		$id = $this->input->post('id');

        $success = handle_contact_profile_image_upload($id);

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
        $picture = $this->contacts_model->get($id);     
        $success = $this->contacts_model->delete_contact_profile_image($id);
        
        if ($success) {
            $response = array(
                'type' => 'success',
                'message' => _l('deleted'),
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