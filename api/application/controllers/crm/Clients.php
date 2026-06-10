<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Clients extends CRMController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('clients_model');
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
            $clients = $this->clients_model->getAll();

            // array|object|null
            if (empty($clients)) {
                return $this->respond([], 200);
            }

            // Helper: convert date to ISO format
            $toIso = function ($dateStr) {
                if (empty($dateStr)) {
                    return null;
                }

                $timestamp = strtotime((string) $dateStr);

                return $timestamp ? date('c', $timestamp) : (string) $dateStr;
            };

            // Helper: build customer groups array
            $buildCustomerGroups = function ($groups) {
                if (empty($groups)) {
                    return [];
                }

                return array_values(array_filter(array_map('trim', explode(',', (string) $groups))));
            };

            $data = [];

            foreach ($clients as $row) {
                $data[] = [
                    'userid'         => isset($row->userid) ? (int) $row->userid : null,
                    'company'        => (string) ($row->company ?? ''),
                    'fullname'       => (string) ($row->fullname ?? ''),
                    'email'          => isset($row->email) ? (string) $row->email : null,
                    'phonenumber'    => isset($row->phonenumber) ? (string) $row->phonenumber : null,
                    'active'         => isset($row->active) ? (int) $row->active : 0,
                    'date'           => $toIso($row->datecreated ?? null),
                    'customerGroups' => $buildCustomerGroups($row->customerGroups ?? null),
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
    public function getItemById($id)
    {
        $this->safe(function () use ($id) {
            $pid = (int) $id;

            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }     

            $client = $this->clients_model->get($pid);          

            // object|null
            if (empty($client) || empty($client->userid)) {
                return $this->notFound([
                    'type'    => 'info',
                    'message' => 'Could not find client for specified ID',
                ], 404);
            }

            // Helper: convert date to ISO format
            $toIso = function($dateStr) {
                $ts = strtotime((string)$dateStr);
                return $ts ? date('c', $ts) : (string)$dateStr;
            };           

            // Helper: build safe client upload folder URL
            $buildFolderUrl = function ($userid) {
                if (empty($userid)) {
                    return null;
                }

                return rtrim(base_url('api/uploads/clients/' . rawurlencode((int) $userid)), '/') . '/';
            };            

            // Helper: build contacts array
            $buildContacts = function ($userid) use ($toIso) {
                $contacts = $this->clients_model->get_contacts($userid);

                if (empty($contacts)) {
                    return [];
                }

                $data = [];
                foreach ($contacts as $contact) {
                    $data[] = [
                        'id'          => isset($contact->id) ? (int) $contact->id : null,
                        'firstname'   => (string) ($contact->firstname ?? ''),
                        'lastname'    => (string) ($contact->lastname ?? ''),
                        'fullname'    => (string) ($contact->fullname ?? ''),
                        'email'       => isset($contact->email) ? (string) $contact->email : null,
                        'phonenumber' => isset($contact->phonenumber) ? (string) $contact->phonenumber : null,
                        'date'        => $toIso($contact->datecreated ?? null),
                        'last_login'  => $toIso($contact->last_login ?? null),
                        'is_primary'  => isset($contact->is_primary) ? (int) $contact->is_primary : 0,
                    ];
                }

                return $data;
            };

            // If company is empty, Perfex may auto populate it with firstname and lastname
            if (!empty($client->company) && is_empty_customer_company($client->userid)) {
                $client->company = '';
            }            
            
            $data = [
                'id'          => isset($client->userid) ? (int) $client->userid : null,
                'userid'      => isset($client->userid) ? (int) $client->userid : null,
                'company'     => (string) ($client->company ?? ''),
                'phonenumber' => isset($client->phonenumber) ? (string) $client->phonenumber : null,
                'website'     => isset($client->website) ? (string) $client->website : null,
                'description' => isset($client->description) ? (string) $client->description : null,
                'address'     => isset($client->address) ? (string) $client->address : null,
                'folder'      => $buildFolderUrl($client->userid ?? null),
                'logo_image'  => isset($client->logo_image) ? (string) $client->logo_image : null,
                'city'        => isset($client->city) ? (string) $client->city : null,
                'zip'         => isset($client->zip) ? (string) $client->zip : null,
                'state'       => isset($client->state) ? (string) $client->state : null,
                'date'        => $toIso($client->datecreated ?? null),
                'staffid'     => isset($client->addedfrom) ? (int) $client->addedfrom : null,
                'active'      => isset($client->active) ? (int) $client->active : 0,
                'contacts'    => $buildContacts($client->userid),
            ];

            return $this->respond($data, 200);
        });    
    }

    /**
     * Create a new client.
     *
     * Expects JSON body with fields:
     *  - name (string, required)
     *  - description (string, optional)
     *  - staffid (int, optional)
     *
     * Responses:
     * - 200 OK with { id } on success
     * - 422 Unprocessable on validation errors
     * - 500 on unexpected errors (handled by $this->safe())
     */   
    public function create()
    {
        if (!has_permission('clients', '', 'create')) {
            access_denied('clients');
        }

        $this->safe(function () {
            // Load payload: expects JSON body
            $formdata = $this->readJson();

            if (empty($formdata) || !is_array($formdata)) {
                return $this->unprocessable('Empty or invalid payload.');
            }

            // array
            $data = [];

            if (array_key_exists('phonenumber', $formdata))  $data['phonenumber'] = trim((string) $formdata['phonenumber']);
            if (array_key_exists('address', $formdata))      $data['address']     = trim((string) $formdata['address']);
            if (array_key_exists('company', $formdata))      $data['company']     = trim((string) $formdata['company']);
            if (array_key_exists('website', $formdata))      $data['website']     = trim((string) $formdata['website']);
            if (array_key_exists('description', $formdata))  $data['description'] = trim((string) $formdata['description']);
            if (array_key_exists('city', $formdata))         $data['city']        = trim((string) $formdata['city']);
            if (array_key_exists('zip', $formdata))          $data['zip']         = trim((string) $formdata['zip']);
            if (array_key_exists('state', $formdata))        $data['state']       = trim((string) $formdata['state']);
            if (array_key_exists('staffid', $formdata))      $data['addedfrom']   = (int) $formdata['staffid'];
            if (array_key_exists('active', $formdata))       $data['active']      = (int) $formdata['active'];

            // Default values
            $data['is_primary'] = 1;

            // Optional flag
            $saveAndAddContact = isset($formdata['save_and_add_contact'])
                && $formdata['save_and_add_contact'] === true;

            // Insert client via model
            $id = $this->clients_model->add($data);

            if (!$id) {
                return $this->unprocessable('Failed to create client.');
            }

            return $this->ok([
                'userid'               => (int) $id,
                'save_and_add_contact' => $saveAndAddContact,
            ], 'create', 'client');
        });
    }  

    /**
     * Update a client.
     *
     * Expects JSON body with any of the fields:
     *  - name (string)
     *  - description (string)
     *  - staffid (int)
     *
     * Responses:
     * - 200 OK on success (even if 0 affected rows)
     * - 422 Unprocessable on validation errors or empty payload
     * - 500 on unexpected errors (handled by $this->safe())
     */  
    public function update($id)
    {
        if (!has_permission('clients', '', 'edit')) {
            access_denied('clients');
        }    
    
        $this->safe(function () use ($id) {
            // Validate client ID
            $pid = (int) $id;

            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            // Load payload: expects JSON body
            $formdata = $this->readJson();

            if (empty($formdata) || !is_array($formdata)) {
                return $this->unprocessable('Empty or invalid payload.');
            }            

            // array
            $data = [];

            if (array_key_exists('phonenumber', $formdata))  $data['phonenumber'] = trim((string) $formdata['phonenumber']);
            if (array_key_exists('address', $formdata))      $data['address']     = trim((string) $formdata['address']);
            if (array_key_exists('company', $formdata))      $data['company']     = trim((string) $formdata['company']);
            if (array_key_exists('website', $formdata))      $data['website']     = trim((string) $formdata['website']);
            if (array_key_exists('description', $formdata))  $data['description'] = trim((string) $formdata['description']);
            if (array_key_exists('city', $formdata))         $data['city']        = trim((string) $formdata['city']);
            if (array_key_exists('zip', $formdata))          $data['zip']         = trim((string) $formdata['zip']);
            if (array_key_exists('state', $formdata))        $data['state']       = trim((string) $formdata['state']);
            if (array_key_exists('staffid', $formdata))      $data['addedfrom']   = (int) $formdata['staffid'];
            if (array_key_exists('active', $formdata))       $data['active']      = (int) $formdata['active'];

            if (empty($data)) {
                return $this->unprocessable('No valid fields to update.');
            }

            // Update client via model
            $success = $this->clients_model->update($data, $pid);
            if ($success || $success == 0) {
                return $this->ok($data, 'update', 'client');      
            }

            return $this->unprocessable('Failed to update client.'); 
        });      
    }    

    /**
     * Delete a single client by ID.
     *
     * @param int|string $clientid
     *
     * Requires 'clients:delete' permission.
     *
     * Responses (handled via $this->safe):
     * - 200 OK ($this->ok) when deleted successfully.
     * - 404 Not Found ($this->notFound) when client does not exist.
     * - 422 Unprocessable ($this->unprocessable) when deletion fails or id invalid.
     */
    public function delete($clientid)
    {
        if (!has_permission('clients', '', 'delete')) {
            access_denied('clients');
        }

        $this->safe(function () use ($clientid) {
            $id = (int)$clientid;

            if ($id <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            $client = $this->clients_model->get($id);
            if (empty($client)) {
                return $this->notFound('Client not found.');
            }                   

            $success = $this->clients_model->delete($id);
            if ($success) {
                // 200 OK
                return $this->ok(['id' => $id], 'delete', 'client');
            }
            
            // Fail
            return $this->unprocessable('Failed to delete client.', ['id' => $id]);     
        });
    }  
    
    /**
     * Bulk delete client by IDs.
     *
     * Expects JSON body:
     * {
     *   "ids": number[]   // required, array of post IDs
     * }
     *
     * Responses:
     * - 200 OK with {type, message, details}:
     *   - type: "success" when all deleted
     *   - type: "warning" when partially deleted
     *   - type: "error" when none deleted
     *   details: { deleted: int[], failed: int[], not_found: int[] }
     * - 400 when payload is missing/invalid
     */       
    public function deleteItems()
    {
        if (!has_permission('clients', '', 'delete')) {
            access_denied('clients');
        }

		$this->safe(function () {
            $formdata = $this->readJson();

            if (empty($formdata) || !is_array($formdata) || !isset($formdata['ids'])) {
                return $this->unprocessable('Empty or invalid payload.');
            } 

            // Normalize ids: unique, int > 0
            $ids = $formdata['ids'];
            if (!is_array($ids)) {
                $ids = [$ids];
            }
            $ids = array_values(array_filter(array_unique(array_map('intval', $ids)), static function ($v) {
                return $v > 0;
            }));
    
            if (empty($ids)) {
                return $this->badRequest('Nenhum ID válido informado.', ['ids' => $ids]);
            }
            
            $deleted   = [];
            $failed    = [];
            $notFound  = [];     

            foreach ($ids as $client_id) {
                // Optionally check existence (faster UX feedback)
                $exists = $this->clients_model->get($client_id);
                if (empty($exists)) {
                    $notFound[] = $client_id;
                    continue;
                }   

                $success = $this->clients_model->delete($client_id);
                if ($success) {
                    $deleted[] = $client_id;
                } else {
                    $failed[] = $client_id;
                }               
            }

            $total = count($ids);
            $ok    = count($deleted);                
    
            $details = [
                'deleted'   => $deleted,
                'failed'    => $failed,
                'not_found' => $notFound,
                'total'     => $total,
            ];      
            
            if ($ok === $total) {
                return $this->ok($details, 'delete', 'client');
            }     
            
            if ($ok === 0) {
                if (count($notFound) === $total) {
                    return $this->notFound('No clients found to delete.', $details);
                }
                // All attempted but failed
                return $this->unprocessable('Failed to delete items.', $details);
            }
                
            // Partial success
            $details['status'] = 'partial';
            return $this->ok($details, 'delete', 'client');                
        });                   
    }   
    
    public function getSocial($id = '')
	{
        $data = $this->clients_model->get_social($id);

        $response = $data;
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    }

	public function addSocial()
	{
		$formdata = json_decode(file_get_contents('php://input'), true);
		
        if(!empty($formdata)) {
            $name                   = $formdata['name'];
            $link                   = $formdata['link'];  
            $clientid               = $formdata['clientid'];
            $staffid                = $formdata['staffid'];

            $data = array(
                'name' => $name,
                'link' => $link,
                'clientid' => $clientid,
                'staffid' => $staffid,
            );  

            $success = $this->clients_model->add_social($data);   
            $response = set_alert(
                $success, 'added_successfully', ''
            );	
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));                          
        }
    }     
    
	public function updateSocial($id) 
	{
		$formdata = json_decode(file_get_contents('php://input'), true);
		
		if(!empty($formdata)) {
            $name                   = $formdata['name'];
            $link                   = $formdata['link']; 
            $clientid               = $formdata['clientid'];
            $staffid                = $formdata['staffid'];

			$data = array(
				'name' => $name,
                'link' => $link,
                'clientid' => $clientid,
                'staffid' => $staffid,                
            );  

            $success = $this->clients_model->update_social($data, $id);
            $response = set_alert(
                $success, 'updated_successfully', ''
            );	
            
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));         
        }
    }  

    public function deleteSocial($id)
    {
        $social = $this->clients_model->get_social($id);
        $success = $this->clients_model->delete_social($id);   
        
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
			->set_content_type('application/json')
			->set_output(json_encode($response));          
    } 

    /**
     * Upload picture(s) for a client.
     *
     * Expects multipart/form-data:
     *  - clientid (int, required)
     *  - file(s) in $_FILES (handled by handle_client_picture_uploads)
     *
     * Responses (via $this->safe):
     *  - 200 OK: $this->ok(..., 'create', 'picture') on success
     *  - 422 Unprocessable: for validation or upload warnings (type === 'warning')
     *  - 400 Bad Request: for invalid payload or upload errors
     */
	public function uploadPicture() 
	{
        $this->safe(function () {
            $clientid      = $this->input->post('id');

            $result = handle_client_picture_uploads($clientid);

            // if invalid or erro
            if (!$result || !is_array($result)) {
                $result = set_alert(false, 'unexpected_error', 'Empty response from upload helper.');
            }

            $ok   = (bool)($result['ok'] ?? false);
            $type = $result['alert']['type'] ?? ($ok ? 'success' : 'error');

            $status = $ok ? 200 : ($type === 'warning' ? 422 : 400);

            if (!$ok) {
                return $this->respond($result, $status);
            }

            return $this->ok($result['data'] ?? null, 'upload', 'picture');
        });
    }
    
    /**
     * Delete a single picture by its ID.
     *
     * Params:
     * - $id (int, required): the picture ID
     *
     * Responses:
     * - 200 OK ($this->ok) when deleted successfully (returns the deleted id)
     * - 422 Unprocessable when id is missing/invalid or delete fails
     * - 500 on unexpected errors (handled by $this->safe())
     */       
	public function deletePicture($id)
	{
        return $this->safe(function () use ($id) {
            $pid = (int)$id;

            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            $success = $this->clients_model->delete_picture($pid);

            if ($success) {
                // 200 OK
                return $this->ok(['id' => $pid], 'delete', 'picture');
            }

            // Fail
            return $this->unprocessable('Failed to delete item.', ['id' => $pid]);           
        });  
    }      
}