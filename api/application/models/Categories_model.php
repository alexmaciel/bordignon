<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Categories_model extends Api_Model
{
    public function __construct()
    {
        parent::__construct();
    }    

    public function getAll($where = array())
    {
        $columns = [
            db_prefix() .'categories.id',
            db_prefix() .'categories.file_name', 
            db_prefix() .'categories.folder',
            db_prefix() .'categories.dateadded',
            db_prefix() .'categories.staffid',
            db_prefix() .'categories.order',
            db_prefix() .'categories.name as name',
            db_prefix() .'categories.description as description',          
        ]; 
        $this->db->select($columns);
        
        $this->db->where($where);   

        $this->db->order_by('order', 'asc');

        return $this->db->get(db_prefix() . 'categories')->result();            
    }

    /**
     * Get categories
     * @param  string $id    optional id
     * @param  array  $where perform where
     * @return mixed
     * Get category object based on passed id if not passed id return array of all categories
     */
    public function get($id = '', $where = array())
    {
        $columns = [
            db_prefix() .'categories.id',
            db_prefix() .'categories.file_name', 
            db_prefix() .'categories.folder',
            db_prefix() .'categories.dateadded',
            db_prefix() .'categories.staffid',
            db_prefix() .'categories.order',
            db_prefix() .'categories.name as name',
            db_prefix() .'categories.description as description',          
        ];         
        $this->db->select($columns);
        $this->db->where($where);

        if (is_numeric($id)) {
            $this->db->where(db_prefix() . 'categories.id', $id);

            $category =  $this->db->get(db_prefix() . 'categories')->row();
            $this->api_object_cache->set('categories-data' . $category->name, $category);

            return $category;
        }
        $this->db->order_by('order', 'asc');

        $categories = $this->api_object_cache->get('categories-data');

        if (!$categories && !is_array($categories)) {
            $categories = $this->db->get(db_prefix() . 'categories')->result();
            $this->api_object_cache->add('categories-data', $categories);
        }
    
        return $categories;  
    }  
    
    /**
     * Add new category
     * @param array $data category $_POST data
     */    
	public function add($data)
	{

        unset($data['null']);
        $data['dateadded']      = date('Y-m-d H:i:s');
        $data['description']    = nl2br($data['description']);

        $data = hooks()->apply_filters('before_add_category', $data);

        $this->db->insert(db_prefix() . 'categories', $data);
        $insert_id = $this->db->insert_id();     
        if ($insert_id) {
            hooks()->do_action('after_add_category', $insert_id);
            logActivity('New Category Created [ID: ' . $insert_id . ']', 'add');

            return $insert_id;
        }   

        return false;
    }  
    
    /**
     * Update Category info
     * @param  array $data Category data
     * @param  mixed $id   Category id
     * @return boolean
     */    
    public function update($data, $id)
	{  

        $data['description']    = nl2br($data['description']);

        $this->db->where('id', $id);
        $this->db->update(db_prefix() . 'categories', $data);  

        if ($this->db->affected_rows() > 0) {
            logActivity('Category Updated [ID:' . $id . ']', 'update');

            hooks()->do_action('after_update_categories', $id);
            return true;
        }

        return false;
    }  
    
    public function delete($id)
    {
        hooks()->do_action('before_category_deleted', $id);

        $this->db->where('id', $id);
        $file = $this->db->get(db_prefix() . 'categories')->row();                
        if ($file) {
            $path     = get_upload_path_by_type('categories');
            $fullPath = $path . $file->file_name;     
            if ($fullPath && file_exists($fullPath)) {
                @unlink($fullPath);  
            }
        }

        $this->db->where('id', $id);
        $this->db->delete(db_prefix() . 'categories');           
        
        if ($this->db->affected_rows() > 0) {
            return true;
        }

        return false;
    }      
    
    public function delete_picture($id)
    {
        $this->db->where('id', $id);
        $file = $this->db->get(db_prefix() . 'categories')->row();
        if ($file) {
            $path     = get_upload_path_by_type('categories') . '/icons/';
            $fullPath = $path . $file->file_name;     
            if ($fullPath && file_exists($fullPath)) {
                @unlink($fullPath);  
            }

            $this->db->where('id', $id);
            $this->db->update(db_prefix() . 'categories', array(
                'file_name' => NULL
            ));  
        }  

        return true;
    }    
}