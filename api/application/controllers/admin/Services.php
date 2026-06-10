<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Services extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('services_model');
    }

    /**
     * Get all services
     *
     * Returns:
     * 200 OK with an array (possibly empty).
     * 500 on unexpected errors (handled by $this->safe()).
     */        
    public function getAll()
    {
        $this->safe(function () {
		    $services = $this->services_model->getAll();
		
            // array|obj|null
            if (empty($services)) {
                return $this->respond([], 200);
            }        


            // helper staff
            $buildStaff = function($staffid) {
                $s = $this->staff_model->get($staffid);
                if (empty($s)) {
                    return ['staffid' => null, 'fullname' => null];
                }
                return [
                    'staffid'  => (int)$s->staffid,
                    'fullname' => (string)$s->fullname
                ];
            };

            // helper data ISO
            $toIso = function($dateStr) {
                $ts = strtotime((string)$dateStr);
                return $ts ? date('c', $ts) : (string)$dateStr;
            };                   

            $data = [];            
			foreach($services as $row){ 
        
                // helper folder URL segura
                $folderUrl = null;
                if (!empty($row->folder)) {
                    $folder = trim((string)$row->folder, "/ \t\n\r\0\x0B");
                    if ($folder !== '') {
                        $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/') . '/';
                    }
                }

				$data[] = array(
                    'id'          => isset($row->id) ? (int)$row->id : null,
                    'name'        => (string) ($row->name ?? ''),
                    'description' => strip_tags(character_limiter((string) ($row->description ?? ''), 50)),
                    'folder'      => $folderUrl,
					'file_name'   => (string) ($row->file_name ?? ''),
					'date'        => $toIso($row->dateadded ?? null),
					'order'       => (int) ($row->order ?? 0), 
                    'staff'       => $buildStaff($row->staffid)
				);
            }
            return $this->respond($data, 200);
        });      
    }

    /**
     * Get a single slide by id.
     *
     * Validates the id, resolves the current language, fetches the post
     *
     * Responses:
     * - 200 OK with the item payload
     * - 404 Not Found when the post does not exist
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

		    $row = $this->services_model->get($pid);

            if (empty($row)) {
                return $this->notFound('Service not found.');
            }

            // helper folder URL segura
            $folderUrl = null;
            if (!empty($row->folder)) {
                $folder = trim((string)$row->folder, "/ \t\n\r\0\x0B");
                if ($folder !== '') {
                    $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/') . '/';
                }
            }            

            $data = [
                'id'          => isset($row->id) ? (int)$row->id : null,
                'name'        => (string)($row->name ?? ''),
                'description' => (string)($row->description ?? ''),
                'link'        => (string)($row->link ?? ''),
                'folder'      => $folderUrl, 
                'file_name'     => (string)($row->file_name ?? ''),
                'date'        => (string)($row->dateadded ?? ''),
                'staffid'     => isset($row->staffid) ? (int)$row->staffid : null
            ];
            return $this->respond($data, 200);
        });             
    }      
    
    /**
     * Create a new service.
     *
     * Expects JSON body with fields:
     *  - name (string, required)
     *  - description (string, optional)
     *  - link (string|null, optional)  // normalized to null when empty; validated if present
     *  - staffid (int, optional)
     *  - languageid (int, required)             // target translation language
     *
     * Responses:
     * - 200 OK with { id } on success
     * - 422 Unprocessable on validation errors
     * - 500 on unexpected errors (handled by $this->safe())
     */       
	public function create()
	{
        $this->safe(function () {
            // Load payload (expects JSON body)
            $formdata = $this->readJson();
		
            if (empty($formdata) || !is_array($formdata)) {
                return $this->unprocessable('Empty or invalid payload.');
            }

            $data = [];
            if (array_key_exists('name', $formdata))        $data['name']        = trim((string)$formdata['name']);
            if (array_key_exists('description', $formdata)) $data['description'] = trim((string)$formdata['description']);
            if (array_key_exists('staffid', $formdata))     $data['staffid']     = (int)$formdata['staffid'];


            // Insere via model
            $id = $this->services_model->add($data);   
    
            if (!$id) {
                return $this->unprocessable('Failed to create service.');
            }

            return $this->ok(['id' => (int)$id], 'create', 'service');  
        });  
    }   
    
    /**
     * Update a service.
     *
     * Expects JSON body with any of the fields:
     *  - name (string)
     *  - description (string)
     *  - link (string|null) - normalized to null when empty; validated if present
     *  - staffid (int)
     *  - languageid (int)            - required (> 0) to target the translation row
     *
     * Responses:
     * - 200 OK on success (even if 0 affected rows)
     * - 422 Unprocessable on validation errors or empty payload
     * - 500 on unexpected errors (handled by $this->safe())
     */    
	public function update($id) 
	{
        $this->safe(function () use ($id) {
            $pid = (int) $id;
            
            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            // Load payload (expects JSON body)
            $formdata = $this->readJson();    

            // array
            $data = [];
            if (array_key_exists('name', $formdata))        $data['name']        = trim((string)$formdata['name']);
            if (array_key_exists('description', $formdata)) $data['description'] = trim((string)$formdata['description']);
            if (array_key_exists('staffid', $formdata))     $data['staffid']     = (int)$formdata['staffid'];
            
            
            if (empty($data)) {
                return $this->unprocessable('No fields to update.');
            }

            $success = $this->services_model->update($data, $pid);
            if ($success || $success == 0) {
                return $this->ok($data, 'update', 'service');      
            }

            return $this->unprocessable('Failed to update service.');           
        });
    }  
    
	public function sortable() 
	{
        $this->safe(function () {
            $formdata = $this->readJson();

            $rows = $formdata['data'] ?? null;
            if (!is_array($rows) || empty($rows)) {
                return $this->unprocessable('Payload inválido.', ['data' => 'Required and must be a non-empty array of items.']);
            }

            if (is_array($rows)) {
                foreach ($rows as $pos => $item) {
                    $id = (int)$item['id'];
                    if ($id <= 0) {
                        return $this->unprocessable('Item inválido na lista.', [
                            "data[$pos].id" => 'Required and must be > 0'
                        ]);
                    }                    
                    $this->db->where('id', $id);
                    $this->db->update(db_prefix() . 'services', array(
                        'order' => (int)$pos
                    ));                                   				                                                       
                }    
            }         
            
            $summary = [
                'items'          => count($rows),
            ];            

            return $this->ok($summary, 'order', 'service');            
        });   
    }    
    
    /**
     * Delete a single service by ID.
     *
     * @param int|string $serviceid
     *
     * Requires 'services:delete' permission.
     *
     * Responses (handled via $this->safe):
     * - 200 OK ($this->ok) when deleted successfully.
     * - 404 Not Found ($this->notFound) when service does not exist.
     * - 422 Unprocessable ($this->unprocessable) when deletion fails or id invalid.
     */      
    public function delete($serviceid)
    {
        $this->safe(function () use ($serviceid) {
            $id = (int)$serviceid;

            if ($id <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            $service = $this->services_model->get($id);   
            if (empty($service)) {
                return $this->notFound('Service not found.');
            }            

            $success = $this->services_model->delete($id);

            if ($success) {
                // 200 OK
                return $this->ok(['id' => $id], 'delete', 'service');
            }
            
            // Fail
            return $this->unprocessable('Failed to delete item.', ['id' => $id]);
        });      
    }      
}