<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Services_model extends Api_Model
{
    public function __construct()
    {
        parent::__construct();
    }    

    /**
     * Fetch slides with optional and language scoping.
     *
     * @param array      $where   Extra conditions. Supports:
     *                            - 'language'  => string (e.g. 'english')
     *                            - 'languageid'=> int
     *
     * @return array<object>      Result set of stdClass rows.
     */        
    public function getAll($where = array())
    {
        $columns = [
            db_prefix() .'services.id',
            db_prefix() .'services.name as name',
            db_prefix() .'services.description as description',          
            db_prefix() .'services.file_name', 
            db_prefix() .'services.folder',
            db_prefix() .'services.dateadded',
            db_prefix() .'services.staffid',
            db_prefix() .'services.slug',
            db_prefix() .'services.order',
        ]; 
        $this->db->select($columns);
        $this->db->where($where);   

        $this->db->order_by('order', 'asc');

        return $this->db->get(db_prefix() . 'services')->result();            
    }

    /**
     * Fetch a single slide by id or a list of services.
     *
     * Behavior:
     * - When $id is numeric, returns a single stdClass row or null if not found.
     * - When $id is empty/non-numeric, returns an array of stdClass rows.
     *
     * Language scoping via $where:
     * - $where['languageid'] (int) OR $where['language'] (string) will be applied.
     *   Any other key/value pairs in $where are also applied as standard where clauses.
     *
     * @param mixed      $id
     * @param array      $where
     * @return object|array<object>|null
     */
    public function get($id = '', $where = array())
    {
        $columns = [
            db_prefix() .'services.id',
            db_prefix() .'services.name as name',
            db_prefix() .'services.description as description',          
            db_prefix() .'services.file_name', 
            db_prefix() .'services.folder',
            db_prefix() .'services.dateadded',
            db_prefix() .'services.staffid',
            db_prefix() .'services.slug',
            db_prefix() .'services.order',
        ];         
        $this->db->select($columns);
        $this->db->where($where);

        if (is_numeric($id)) {
            $this->db->where(db_prefix() . 'services.id', $id);

            $service =  $this->db->get(db_prefix() . 'services')->row();
            $this->api_object_cache->set('services-data' . $service->name, $service);

            return $service;
        }
        $this->db->order_by('order', 'asc');

        $services = $this->api_object_cache->get('services-data');

        if (!$services && !is_array($services)) {
            $services = $this->db->get(db_prefix() . 'services')->result();
            $this->api_object_cache->add('services-data', $services);
        }
    
        return $services;  
    }  

    /**
     * Insert a new service with translations (for all active languages) and categories.
     *
     * Expected $data keys:
     *  - name (string, required)
     *  - description (string, optional)
     *  - link (string|null, optional)
     *  - staffid (int, optional)
     *
     * Returns:
     *  - int insert_id on success
     *  - false on failure
     */ 
	public function add($data)
	{

        unset($data['null']);

        $data['dateadded']      = date('Y-m-d H:i:s');
        $data['description']    = nl2br($data['description'] ?? '');

        $data['slug']            = slug_it($data['name']);

        $data = hooks()->apply_filters('before_add_service', $data);

        $this->db->insert(db_prefix() . 'services', $data);
        $insert_id = $this->db->insert_id();     

        if ($insert_id) {
            hooks()->do_action('after_add_service', $insert_id);
            log_activity('New Service Created [ID: ' . $insert_id . ']', 'add');

            return $insert_id;
        }   

        return false;
    }      

    /**
     * Update service info
     * @param  array $data service data
     * @param  mixed $id   service id
     * @return boolean
     */    
    public function update($data, $id)
	{  

        $data['description']    = nl2br($data['description']);
        $data['slug']           = slug_it($data['name']);

        $this->db->where('id', $id);
        $this->db->update(db_prefix() . 'services', $data);  

        if ($this->db->affected_rows() > 0) {
            log_activity('Service Updated [ID:' . $id . ']', 'update');

            hooks()->do_action('after_update_services', $id);
            return true;
        }

        return false;
    }  
    
    /**
     * Permanently delete a slide and all related data.
     *
     * Deletes:
     * - slides_translation (all languages)
     * - files/pictures (via delete_picture)
     * - slide (row itself)
     *
     * Hooks:
     * - before_service_deleted($service_id)
     * - after_service_deleted($service_id)
     *
     * @param int $service_id
     * @return bool True if the service was deleted, false otherwise.
     */         
    public function delete($service_id)
    {
        $service_id = (int)$service_id;
        if ($service_id <= 0) {
            return false;
        }
                
        hooks()->do_action('before_service_deleted', $service_id);

        $this->db->where('id', $service_id);
        $this->db->delete(db_prefix() . 'services');           
        
        if ($this->db->affected_rows() > 0) {
            return true;
        }

        return false;
    }      

    /**
     * Get services by slug
     * @param  string $slug    optional slug
     * @param  array  $where perform where
     * @return mixed
     * Get service object based on passed slug if not passed slug return array of all services
     */
    public function get_service_slug($slug = '', $where = array())
    {
        $columns = [
            db_prefix() .'services.id',
            db_prefix() .'services.name as name',
            db_prefix() .'services.description as description',          
            db_prefix() .'services.slug',
            db_prefix() .'services.folder',
            db_prefix() .'services.file_name', 
            db_prefix() .'services.dateadded',
            db_prefix() .'services.staffid',
            db_prefix() .'services.order',
        ];         
        $this->db->select($columns);
        $this->db->where($where);

        if (!empty($slug)) {
            $this->db->where(db_prefix() . 'services.slug', $slug);

            $service =  $this->db->get(db_prefix() . 'services')->row();
            $this->api_object_cache->set('services-data' . $service->name, $service);

        }
        
        return $service;
    }      
}