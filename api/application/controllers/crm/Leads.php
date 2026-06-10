<?php
defined('BASEPATH') or exit('No direct script access allowed');
header('Content-Type: text/html; charset=utf-8');

class Leads extends CRMController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('leads_model');
    }

    public function index($id = ''){}  

    /* List all leads */
    public function getTable()
    {
		$leads = $this->leads_model->getTable();

        $data = array();
		if(!empty($leads)){
			foreach($leads as $row){              
				$data[] = array(
					'id' => $row->id,
                    'name' => $row->name,
					'company' => $row->company,
					'phonenumber' => $row->phonenumber,
                    'email' => $row->email,
                    'status' => $row->status,
                    'source' => $row->source,                    
                    'status_name' => $row->status_name,
                    'source_name' => $row->source_name,
					'date' => $row->dateadded,
                );                 
            }
        }        
		$response = $data;
		
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));           
    }    

    /* Get leads id */
    public function getItemById($id)
    {
        $lead = $this->leads_model->get($id);

        if(!empty($id)) {
            if (mb_strpos($lead->name, ' ') !== false) {
                $_temp     = explode(' ', $lead->name);
                $firstname = $_temp[0];
                if (isset($_temp[2])) {
                    $lastname = $_temp[1] . ' ' . $_temp[2];
                } else {
                    $lastname = $_temp[1];
                }
            } else {
                $lastname  = '';
                $firstname = $lead->name;
            }

            $response = array(
                'id' => $lead->id,
                'name' => $lead->name,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'company' => $lead->company,
                'phonenumber' => $lead->phonenumber,
                'description' => $lead->description,
                'state' => $lead->state,
                'city' => $lead->city,
                'zip' => $lead->zip,
                'address' => $lead->address,
                'email' => $lead->email,
                'status' => $lead->status,
                'source' => $lead->source,                    
                'status_name' => $lead->status_name,
                'source_name' => $lead->source_name,
                'staffid' => $lead->addedfrom,
                'date' => $lead->dateadded,
            );
        }

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }    

    /* Add new client*/
    public function create()
    {
        $formdata = json_decode(file_get_contents('php://input'), true);  
                        
        if(!empty($formdata)) {

            $name           = $formdata['name'];
            $email          = $formdata['email'];
            $company        = $formdata['company'];
            $state          = $formdata['state'];
            $city           = $formdata['city'];
            $address        = $formdata['address'];
            $zip            = $formdata['zip'];
            $description    = $formdata['description'];
            $phonenumber    = $formdata['phonenumber'];
            $status         = $formdata['status'];
            $source         = $formdata['source'];
            $staffid 	    = $formdata['staffid'];

            $data = array(
                'name' => $name,
                'email' => $email,
                "company" => $company,
                "state" => $state,               
                "city" => $city,               
                "address" => $address,
                "zip" => $zip,               
                'phonenumber' => $phonenumber,
                "description" => $description,               
				'status' => $status,		
				'source' => $source,		
				'addedfrom' => $staffid,		
            );  
            
            $id = $this->leads_model->add($data);
            if ($id) {
				$response = array(
					'type' => 'success',
					'message' => _l('added_successfully', _l('lead')),
				);	                
            }

            $this->output
				->set_content_type('application/json')
				->set_output(json_encode($response));                 
        }
    }   

    /* Edit client*/
    public function update($id)
    {
		$formdata = json_decode(file_get_contents('php://input'), true);
    
        if(!empty($formdata)) {
            $name           = $formdata['name'];
            $email          = $formdata['email'];
            $company        = $formdata['company'];
            $state          = $formdata['state'];
            $city           = $formdata['city'];
            $address        = $formdata['address'];
            $zip            = $formdata['zip'];
            $description    = $formdata['description'];
            $phonenumber    = $formdata['phonenumber'];
            $status         = $formdata['status'];
            $source         = $formdata['source'];
            $staffid 	    = $formdata['staffid'];

            $data = array(
                'name' => $name,
                'email' => $email,
                "company" => $company,
                "state" => $state,               
                "city" => $city,               
                "address" => $address,
                "zip" => $zip,               
                'phonenumber' => $phonenumber,
                "description" => $description,               
				'status' => $status,		
				'source' => $source,		
				'addedfrom' => $staffid,		
            );  
            
            $success = $this->leads_model->update($data, $id);
            $response = set_alert(
                $success, 'updated_successfully', 'lead'
            ); 

            $this->output
				->set_content_type('application/json')
				->set_output(json_encode($response));               
        }
    }    
    
    /* Delete lead from database */
    public function delete($id)
    {
        $success = $this->leads_model->delete($id);
        if ($success == true) {
            $response = array(
                'type' => 'success',
                'message' => _l('deleted', _l('lead')),
            );         
        } else {
            $response = array(
                'type' => 'warning',
                'message' => _l('problem_deleting', _l('lead_lowercase')),
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
                foreach ($ids as $lead_id) {
                    $lead = $this->leads_model->get($lead_id);
                    $success = $this->leads_model->delete($lead_id);   
                    if($success) {
                        $response = array(
                            'type' => 'success',
                            'message' => _l('deleted', _l('lead')),
                        );         
                    } else {
                        $response = array(
                            'type' => 'warning',
                            'message' => _l('problem_deleting', _l('lead_lowercase')),
                        );                
                    }                                                  
                }                 
            }
        }      

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));         
    }       

    // Sources
    /* Manage leads sources */
    public function sources()
    {
        $data = $this->leads_model->get_source();

        $response = $data;
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }  
    
    /**
     * Convert lead to client
     * @since  version 1.0.1
     * @return mixed
     */
    public function convert_to_customer()
    {
		$formdata = json_decode(file_get_contents('php://input'), true);
    
        if(!empty($formdata)) {
            $default_country  = get_option('customer_default_country');
            if (is_automatic_calling_codes_enabled()) {
                $clientCountryId = $this->db->select('country')
                ->where('userid', $formdata['staffid'])
                ->get('clients')->row()->country ?? null;
                $clientCountry = get_country($clientCountryId);
                $callingCode   = $clientCountry ? '+' . ltrim($clientCountry->calling_code, '+') : null;
            } else {
                $callingCode = null;
            }

            $original_lead_email = $data['original_lead_email'];
            unset($data['original_lead_email']);

            $phonenumber = $formdata['phonenumber'];

            if ($callingCode && !empty($phonenumber) && $phonenumber == $callingCode) {
                $phonenumber = '';
            }

            if (isset($formdata['password'])) {
                $formdata['password'] = $formdata['password'];
            }    

            if ($formdata['country'] == '' && $default_country != '') {
                $formdata['country'] = $default_country;
            }            

            if (isset($formdata['send_set_password_email']) && $formdata['send_set_password_email'] == true) {
                $formdata['send_set_password_email'] = true;
            }

            $data = array(
                'leadid'   => $formdata['id'],
                'password' => $formdata['password'],              
                'firstname' => $formdata['firstname'],
                'lastname' => $formdata['lastname'],
                'email' => $formdata['email'],
                'phonenumber' => $formdata['phonenumber'],
                "company" => $formdata['company'],
                "website" => $formdata['website'],    
                "description" => $formdata['description'],               
                "city" => $formdata['city'],               
                "zip" => $formdata['zip'],               
                "state" => $formdata['state'],               
				'addedfrom' => $formdata['staffid'],
                'billing_street' => $formdata['address'],
                'billing_city' => $formdata['city'],
                'billing_state' => $formdata['state'],
                'billing_zip' => $formdata['zip'],
                'billing_country' => $formdata['country'],   
                'send_set_password_email' => $formdata['send_set_password_email'],            		
                'donotsendwelcomeemail' => $formdata['do_notsend_welcome_email'],            		
				'is_primary' => 1,	
            );
 
            
            $save_and_add_contact = false;
            if (isset($formdata['save_and_add_contact']) && $formdata['save_and_add_contact'] == true) {
                unset($formdata['save_and_add_contact']);
                $save_and_add_contact = true;
            }   
            
            $this->load->model('clients_model');
            $id = $this->clients_model->add($data, $save_and_add_contact);
            if ($id) {
                $primary_contact_id = get_primary_contact_user_id($id);

                if (get_option('auto_assign_customer_admin_after_lead_convert') == 1) {
                    $this->db->insert(db_prefix() . 'customer_admins', [
                        'date_assigned' => date('Y-m-d H:i:s'),
                        'customer_id'   => $id,
                        'staff_id'      => $data['addedfrom'],
                    ]);
                }   
                $this->leads_model->log_lead_activity($data['leadid'], $data['addedfrom'], 'not_lead_activity_converted', false, serialize([
                    get_staff_full_name($data['addedfrom']),
                ]));                
                $default_status = $this->leads_model->get_status('', [
                    'isdefault' => 1,
                ]); 
                
                $this->db->where('id', $data['leadid']);
                $this->db->update(db_prefix() . 'leads', [
                    'date_converted' => date('Y-m-d H:i:s'),
                    'status'         => $default_status[0]['id'],
                    'junk'           => 0,
                    'lost'           => 0,
                ]);  
                // Check if lead email is different then client email
                $contact = $this->clients_model->get_contact(get_primary_contact_user_id($id));
                if ($contact->email != $original_lead_email) {
                    if ($original_lead_email != '') {
                        $this->leads_model->log_lead_activity($data['leadid'], $data['addedfrom'], 'not_lead_activity_converted_email', false, serialize([
                            $original_lead_email,
                            $contact->email,
                        ]));
                    }
                }  
                
                // set the lead to status client in case is not status client
                $this->db->where('isdefault', 1);
                $status_client_id = $this->db->get(db_prefix() . 'leads_status')->row()->id;
                $this->db->where('id', $data['leadid']);
                $this->db->update(db_prefix() . 'leads', [
                    'status' => $status_client_id,
                ]);  
                
                if (get_option('gdpr_after_lead_converted_delete') == '1') {
                    // When lead is deleted
                    // move all proposals to the actual customer record
                    $this->db->where('rel_id', $data['leadid']);
                    $this->db->where('rel_type', 'lead');
                    $this->db->update('proposals', [
                        'rel_id'   => $id,
                        'rel_type' => 'customer',
                    ]);

                    $this->leads_model->delete($data['leadid']);

                    $this->db->where('userid', $id);
                    $this->db->update(db_prefix() . 'clients', ['leadid' => null]);
                }

                logActivity('Created Lead Client Profile [LeadID: ' . $data['leadid'] . ', ClientID: ' . $id . ']', 'create', $data['addedfrom']);
                hooks()->do_action('lead_converted_to_customer', ['lead_id' => $data['leadid'], 'customer_id' => $id]);                 
            }

            $response = array(
                'type' => 'success',
                'message' => _l('lead_to_client_base_converted_success'),
            );	             
        }   
        
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));         
    }

    
}