<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Handles uploading a user's/slide picture:
 * - Checks if a file was uploaded and if there are no upload errors
 * - Creates the destination directory if it does not exist
 * - Generates a unique filename for the uploaded file
 * - Validates the file extension
 * - Moves the uploaded file to the slide uploads folder
 * - Updates the database with the new picture filename
 * - Returns an array with type (success/error), message, picture URL
 */
function handle_slide_picture_uploads($slide_id, $staff_id, $subject = '', $description = '')
{
    $CI = &get_instance();

    if (!$slide_id) {
        return set_alert(false, 'bad_request', 'Missing slide ID.');
    }

    if (!is_numeric($staff_id)) {
        $staff_id = get_staff_user_id();
    }

    // Verifica erros de upload
    if (_api_upload_error($_FILES['file']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['file']['error']));
    }    

    $tmpFilePath = $_FILES['file']['tmp_name'];
    $originalName = $_FILES['file']['name'];

    // Define o caminho de upload
    $path = get_upload_path_by_type('slides');
    _maybe_create_upload_path($path);

    // Nome único para o arquivo
    $originalFilename   = unique_filename($path, $originalName);
    $filename           = app_generate_hash() . '.' . get_file_extension($originalFilename);    

    // Valida extensão
    if (!_upload_pictures_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('site_pic_types'));
    }

    hooks()->do_action('before_upload_slide_picture', $slide_id); 

    // Verifica se o arquivo foi enviado
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return set_alert(false, 'unprocessable', 'No file uploaded or upload error.');
    }  

    // Move arquivo enviado
    $newFilePath = $path . $filename;   
    if (!move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }

    // Optional metadata (if you want to keep parity with company pictures)
    if ($subject !== null)     { $update['subject']     = $subject; }
    if ($description !== null) { $update['description'] = $description; }

    // Upload the file into the company uploads dir
    $data = [
        'slideid'    => $slide_id,
        'file_name'  => $filename,
        'original_file_name'  => $originalFilename,
        'filetype'   => $_FILES['file']['type'],
        'dateadded'  => date('Y-m-d H:i:s'),
        'staffid'    => $staff_id,
        'subject'    => $subject,                    
        'description'    => $description,                    
    ]; 

    if (!class_exists('slides_model', false)) {
        $CI->load->model('slides_model');
    }

    $CI->slides_model->upload_picture($data); 

    // Retorno para frontend
    $resp = set_alert(true, 'create', 'picture');
    $resp['data'] = [
        'file_name' => $filename,
        'original_name' => $originalFilename,
        'filetype' => $_FILES['file']['type'],
        'path' => $newFilePath,
    ];

    return $resp;
}
/**
 * Handles uploading a user's/company picture:
 * - Checks if a file was uploaded and if there are no upload errors
 * - Creates the destination directory if it does not exist
 * - Generates a unique filename for the uploaded file
 * - Validates the file extension
 * - Moves the uploaded file to the company uploads folder
 * - Updates the database with the new picture filename
 * - Returns an array with type (success/error), message, picture URL
 */
function handle_company_picture_uploads($staff_id, $subject = '', $description = '')
{
    $CI = &get_instance();

    if (!is_numeric($staff_id)) {
        $staff_id = get_staff_user_id();
    }

    // Verifica erros de upload
    if (_api_upload_error($_FILES['file']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['file']['error']));
    }    
  

    $tmpFilePath = $_FILES['file']['tmp_name'];
    $originalName = $_FILES['file']['name'];
        
    // Define o caminho de upload
    $path = get_upload_path_by_type('company');
    _maybe_create_upload_path($path);

    // Nome único para o arquivo
    $originalFilename   = unique_filename($path, $originalName);
    $filename           = app_generate_hash() . '.' . get_file_extension($originalFilename);    

    // Valida extensão
    if (!_upload_pictures_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('site_pic_types'));
    }

    hooks()->do_action('before_upload_company_picture', $staff_id); 

    // Verifica se o arquivo foi enviado
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return set_alert(false, 'unprocessable', 'No file uploaded or upload error.');
    }  

    // Move arquivo enviado
    $newFilePath = $path . $filename;   
    if (!move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }

    // Upload the file into the company uploads dir
    $data = array(
        'file_name'  => $filename,
        'original_file_name'  => $originalFilename,
        'filetype'   => $_FILES['file']['type'],
        'dateadded'  => date('Y-m-d H:i:s'),
        'staffid'    => $staff_id,
        'subject'    => $subject,                    
        'description'    => $description,                    
    ); 

    if (!class_exists('company_model', false)) {
        $CI->load->model('company_model');
    }

    $CI->company_model->upload_picture($data); 


    // Retorno para frontend
    $resp = set_alert(true, 'create', 'picture');
    $resp['data'] = [
        'file_name' => $filename,
        'original_name' => $originalFilename,
        'filetype' => $_FILES['file']['type'],
        'path' => $newFilePath,
    ];

    return $resp; 
}
/**
 * Item file
 * @param  mixed $id Item ID to add file
 * @return array  - Result values
 */
function handle_company_picture_item_uploads($id)
{
    $message    = '';

    if (isset($_FILES['file']) && _api_upload_error($_FILES['file']['error'])) {   
        return array(
            'message' => _api_upload_error($_FILES['file']['error'])
        );         
        return false; 
    }    
    if (isset($_FILES['file']['name']) && $_FILES['file']['name'] != '') {
        $path = get_upload_path_by_type('company') . '/icons/';
        
        hooks()->do_action('before_upload_company_picture_item');
        // Get the temp file path
        $tmpFilePath = $_FILES['file']['tmp_name'];
        // Make sure we have a filepath
        if (!empty($tmpFilePath) && $tmpFilePath != '') {
            _maybe_create_upload_path($path);  
            $filename    = unique_filename($path, $_FILES['file']['name']); 
            // Getting file extension
            $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));   
            $allowed_extensions = [
                'png',
                'svg'
            ];

            $allowed_extensions = hooks()->apply_filters('company_item_file_upload_allowed_extensions', $allowed_extensions);

            if (!in_array($extension, $allowed_extensions)) {
                return array(
                    'message' => 'Image extension not allowed. Extensions: .png, .svg'
                );                  
                return false; 
            }                   
            $CI = & get_instance();
                 
            // Remove old image  
            $CI->db->where('id', $id);
            $_file = $CI->db->get(db_prefix() . 'company_items')->row();
            $_filename = $path . $_file->file_name;
            if($_filename && file_exists($path . $_file->file_name)) {
                @unlink($_filename);
            }	  
            
            $newFilePath = $path . $filename;                           
            // Upload the file into the company uploads dir
            if (move_uploaded_file($tmpFilePath, $newFilePath)) {

                $CI->db->where('id', $id);
                $CI->db->update(db_prefix() . 'company_items', [
                    'file_name' => $filename,
                ]);
                // Remove original image
                //unlink($newFilePath);

                return true; 
            }                         
        }       
    }

    return false;
}
/**
 * Handles uploading a user's/team avatar:
 * - Checks if a file was uploaded and if there are no upload errors
 * - Creates the destination directory if it does not exist
 * - Generates a unique filename for the uploaded file
 * - Validates the file extension
 * - Removes the old avatar and its thumbnails (thumb and small)
 * - Moves the uploaded file to the team uploads folder
 * - Creates resized images: thumb (320x320) and small (96x96)
 * - Updates the database with the new avatar filename
 * - Deletes the original file after creating the thumbnails
 * - Returns an array with type (success/error), message, and small avatar URL
 */
function handle_teams_avatar_uploads($team_id)
{
    $CI = &get_instance();

    // Basic guards
    if (empty($team_id) || !is_numeric($team_id)) {
        return set_alert(false, 'unprocessable', 'Invalid item ID.');
    }

    // Check file presence early
    if (!isset($_FILES['file_avatar'])) {
        return set_alert(false, 'unprocessable', 'No file provided.');
    }    

    // Map PHP upload error to API message
    if (_api_upload_error($_FILES['file_avatar']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['file_avatar']['error']));
    }  

    // Extract upload basics
    $tmpFilePath    = $_FILES['file_avatar']['tmp_name'] ?? '';
    $originalName   = $_FILES['file_avatar']['name'] ?? '';


    // Destination path for team team_id (team/team_id)
    $basePath = rtrim(get_upload_path_by_type('teams'), '/\\');
    $path     = $basePath . '/' . $team_id . '/'; 
    _maybe_create_upload_path($path);

    
    // Generate unique target filename
    $filename = unique_filename($path, $originalName);

    // Valida extensão
    if (!_upload_pictures_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('site_pic_types'));
    }    

    // Remove previous file if exists
    $CI->db->where('id', $team_id);
    $_file = $CI->db->get(db_prefix() . 'teams')->row();
    if ($_file && !empty($_file->file_avatar)) {
        @unlink($path . $_file->file_avatar);
        @unlink($path . 'small_' . pathinfo($_file->file_avatar, PATHINFO_BASENAME));
    }

    // Move uploaded file to final path
    $newFilePath = $path . $filename;
    if (!@move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }    

    // Gera imagens redimensionadas
    $CI->load->library('image_lib');

    // Small 250x250
    $config                   = [];
    $config['image_library']  = 'gd2';
    $config['source_image']   = $newFilePath;
    $config['new_image']      = 'small_' . $filename;
    $config['maintain_ratio'] = true;
    $config['width']          = 250;
    $config['height']         = 250;
    $CI->image_lib->initialize($config);
    $CI->image_lib->resize();
    $CI->image_lib->clear();

    /// Persist new filename to DB
    $CI->db->where('id', $team_id);
    $CI->db->update(db_prefix() . 'teams', [
        'file_avatar' => $filename
    ]);    
    if ($CI->db->affected_rows() === 0) {
        // Rollback file if DB update failed
        if (is_file($newFilePath)) {
            @unlink($newFilePath);
        }
        return set_alert(false, 'unexpected_error', 'Database update failed.');        
    }

    // Remove arquivo original
    //@unlink($newFilePath);
    
    // Build frontend payload with useful info
    $resp = set_alert(true, 'upload', 'picture');  
    $resp['data'] = [
        'id'            => (int)$team_id,
        'path'          => $newFilePath, // absolute server path (use relative if needed)
        'file_avatar'   => $originalName,     
    ];     
    
    return $resp;

}
/**
 * Upload picture for Category
 * - Validates upload and extension (reuses _upload_pictures_allowed / site_pic_types)
 * - Ensures destination path exists (category)
 * - Removes previous file if exists
 * - Updates DB with new file metadata
 * - Returns standardized set_alert payload + data for frontend
 *
 * @param int         $category_id     Category item ID (required)
 * @return array                       set_alert payload with data or error
 */
function handle_category_file_uploads($category_id)
{
    $CI = &get_instance();

    // Basic guards
    if (empty($category_id) || !is_numeric($category_id)) {
        return set_alert(false, 'unprocessable', 'Invalid item ID.');
    }

    // Check file presence early
    if (!isset($_FILES['file'])) {
        return set_alert(false, 'unprocessable', 'No file provided.');
    }    

    // Map PHP upload error to API message
    if (_api_upload_error($_FILES['file']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['file']['error']));
    }

    // Extract upload basics
    $tmpFilePath   = $_FILES['file']['tmp_name'];
    $originalName  = $_FILES['file']['name'];
    $mimeType      = $_FILES['file']['type'];   
    
    if (empty($tmpFilePath) || empty($originalName)) {
        return set_alert(false, 'unprocessable', 'Empty file or temporary path.');
    }    

    // Destination path for category category_id (category/category_id)
    $basePath = rtrim(get_upload_path_by_type('categories'), '/\\');
    $path     = $basePath . '/' . $category_id . '/';     
    _maybe_create_upload_path($path);  
    
    // Generate unique target filename
    $filename    = unique_filename($path, $_FILES['file']['name']);
    $newFilePath = $path . $filename;

    // Valida extensão
    if (!_upload_pictures_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('site_pic_types'));
    }    

    // Pre-upload hook for observers
    hooks()->do_action('before_upload_category_picture', $category_id);

    // Remove previous file if exists
    $CI->db->where('id', $category_id);
    $current = $CI->db->get(db_prefix() . 'categories')->row();
    if ($current && !empty($current->file_name)) {
        $oldPath = $path . $current->file_name;
        if (is_file($oldPath)) {
            // Suppress unlink warnings but keep operation safe
            @unlink($oldPath);
        }
    }    

    // Move uploaded file to final path
    if (!@move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }    

    // Persist new filename to DB
    $CI->db->where('id', (int)$category_id);
    $CI->db->update(db_prefix() . 'categories', [
        'file_name' => $filename,
        'original_file_name' => $originalName
    ]);

    if ($CI->db->affected_rows() === 0) {
        // Rollback file if DB update failed
        if (is_file($newFilePath)) {
            @unlink($newFilePath);
        }
        return set_alert(false, 'unexpected_error', 'Database update failed.');
    }    

    // Build frontend payload with useful info
    $resp = set_alert(true, 'upload', 'picture');  
    $resp['data'] = [
        'category_id'   => (int)$category_id,
        'path'          => $newFilePath, // absolute server path (use relative if needed)
        'file_name'     => $filename,     
    ];  

    return $resp;    
}
/**
 * Upload picture for Client
 * - Validates upload and extension (reuses _upload_pictures_allowed / site_pic_types)
 * - Ensures destination path exists (Client)
 * - Removes previous file if exists
 * - Updates DB with new file metadata
 * - Returns standardized set_alert payload + data for frontend
 *
 * @param int         $client_id     Client item ID (required)
 * @return array                       set_alert payload with data or error
 */
function handle_client_picture_uploads($client_id)
{
    $CI = &get_instance();

    // Basic guards
    if (empty($client_id) || !is_numeric($client_id)) {
        return set_alert(false, 'unprocessable', 'Invalid item ID.');
    }

    // Check file presence early
    if (!isset($_FILES['file'])) {
        return set_alert(false, 'unprocessable', 'No file provided.');
    }    

    // Map PHP upload error to API message
    if (_api_upload_error($_FILES['file']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['file']['error']));
    }  

    // Extract upload basics
    $tmpFilePath    = $_FILES['file']['tmp_name'] ?? '';
    $originalName   = $_FILES['file']['name'] ?? '';
    $mimeType       = $_FILES['file']['type'] ?? '';     
  

    // Build upload path
    $basePath = rtrim(get_upload_path_by_type('clients'), '/\\') . '/';
    $path     = $basePath . '/' . $client_id . '/';
    _maybe_create_upload_path($path);

    // Generate unique target filename
    $filename = unique_filename($path, $originalName);
    $newFilePath = $path . $filename;  

    // Valida extensão
    if (!_upload_pictures_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('site_pic_types'));
    }  

    // Pre-upload hook for observers
    hooks()->do_action('before_upload_client_picture', $client_id);
        

    // Remove previous file if exists
    $CI->db->where('userid', $client_id);
    $current = $CI->db->get(db_prefix() . 'clients')->row();
    if ($current && !empty($current->logo_image)) {
        $oldPath = $path . $current->logo_image;
        if (is_file($oldPath)) {
            // Suppress unlink warnings but keep operation safe
            @unlink($oldPath);
        }
    }

    // Move uploaded file to final path
    if (!@move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }    
                 
    // Gera imagens redimensionadas
    $CI->load->library('image_lib');    

    // Small 375x375
    $config                   = [];
    $config['image_library']  = 'gd2';
    $config['source_image']   = $newFilePath;
    $config['new_image']      = $filename;
    $config['maintain_ratio'] = true;
    $config['width']          = 375;
    $config['height']         = 375;
    $CI->image_lib->initialize($config);
    $CI->image_lib->resize();
    $CI->image_lib->clear();


    /// Persist new filename to DB
    $CI->db->where('userid', $client_id);
    $CI->db->update(db_prefix() . 'clients', [
        'logo_image' => $filename
    ]);

    if ($CI->db->affected_rows() === 0) {
        // Rollback file if DB update failed
        if (is_file($newFilePath)) {
            @unlink($newFilePath);
        }
        return set_alert(false, 'unexpected_error', 'Database update failed.');        
    }

    // Build frontend payload with useful info
    $resp = set_alert(true, 'upload', 'picture');  
    $resp['data'] = [
        'userid'        => (int)$client_id,
        'path'          => $newFilePath, // absolute server path (use relative if needed)
        'file_name'     => $originalName,     
    ];     
    
    return $resp;
}
/**
 * Maybe upload contact profile image
 * @param  string $contact_id contact_id or current logged in contact id will be used if not passed
 * @return boolean
 */
function handle_contact_profile_image_upload($contact_id)
{
    $message    = '';

    if (isset($_FILES['profile_image']) && _api_upload_error($_FILES['profile_image']['error'])) {   
        return array(
            'message' => _api_upload_error($_FILES['profile_image']['error'])
        );         
        return false; 
    }    
    if (isset($_FILES['profile_image']['name']) && $_FILES['profile_image']['name'] != '') {
        $path = get_upload_path_by_type('contact_profile_images') . $contact_id . '/';
        
        hooks()->do_action('before_upload_contact_profile_image');
        // Get the temp file path
        $tmpFilePath = $_FILES['profile_image']['tmp_name'];
        // Make sure we have a filepath
        if (!empty($tmpFilePath) && $tmpFilePath != '') {
            _maybe_create_upload_path($path);  
            $filename    = unique_filename($path, $_FILES['profile_image']['name']); 
            // Getting file extension
            $extension = strtolower(pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION));   
            $allowed_extensions = [
                'jpg',
                'jpeg',
                'png',
            ];

            $allowed_extensions = hooks()->apply_filters('contact_profile_image_upload_allowed_extensions', $allowed_extensions);

            if (!in_array($extension, $allowed_extensions)) {
                return array(
                    'message' => 'Image extension not allowed. Extensions: ' . get_option('site_pic_types')
                );                  
                return false; 
            }                   
            $CI = & get_instance();
                 
            // Remove old image  
            $CI->db->where('id', $contact_id);
            $_file = $CI->db->get(db_prefix() . 'contacts')->row();
            $_filename = $path . $_file->profile_image;
            if($_filename && file_exists($path . $_file->profile_image)) {
                @unlink($_filename);
            }	  
            
            $newFilePath = $path . $filename;                           
            // Upload the file into the company uploads dir
            if (move_uploaded_file($tmpFilePath, $newFilePath)) {
                $config                   = [];
                $config['image_library']  = 'gd2';
                $config['source_image']   = $newFilePath;
                $config['new_image']      = 'small_' . $filename;
                $config['maintain_ratio'] = true;
                $config['width']          = hooks()->apply_filters('contact_profile_image_small_width', 150);
                $config['height']         = hooks()->apply_filters('contact_profile_image_small_height', 150);
               
                $CI->image_lib->initialize($config);
                $CI->image_lib->resize();
                $CI->image_lib->clear();

                $CI->db->where('id', $contact_id);
                $CI->db->update(db_prefix() . 'contacts', [
                    'profile_image' => $filename,
                ]);
                // Remove original image
                unlink($newFilePath);                

                return true; 
            }                         
        }       
    }

    return false;
}
/**
 * Handles uploading a user's/staff avatar:
 * - Checks if a file was uploaded and if there are no upload errors
 * - Creates the destination directory if it does not exist
 * - Generates a unique filename for the uploaded file
 * - Validates the file extension
 * - Removes the old avatar and its thumbnails (thumb and small)
 * - Moves the uploaded file to the staff uploads folder
 * - Creates resized images: thumb (320x320) and small (96x96)
 * - Updates the database with the new avatar filename
 * - Deletes the original file after creating the thumbnails
 * - Returns an array with type (success/error), message, and small avatar URL
 */
function handle_profile_image_upload($profile_id)
{

    $CI = &get_instance();

    // Basic guards
    if (empty($profile_id) || !is_numeric($profile_id)) {
        return set_alert(false, 'unprocessable', 'Invalid item ID.');
    }

    // Check file presence early
    if (!isset($_FILES['avatar'])) {
        return set_alert(false, 'unprocessable', 'No file provided.');
    }    

    // Map PHP upload error to API message
    if (_api_upload_error($_FILES['avatar']['error'])) {
        return set_alert(false, 'unprocessable', _api_upload_error($_FILES['avatar']['error']));
    }    

    // Extract upload basics
    $tmpFilePath    = $_FILES['avatar']['tmp_name'];
    $originalName   = $_FILES['avatar']['name'];


    // Destination path for staff profile_id (staff/profile_id)
    $path = rtrim(get_upload_path_by_type('staff'), '/\\') . '/' . $profile_id . '/';
    _maybe_create_upload_path($path);

    // Generate unique target filename
    $filename = unique_filename($path, $originalName);

    // Valida extensão
    if (!_upload_avatar_allowed($filename)) {
        return set_alert(false, 'unprocessable', 'Image extension not allowed. Allowed: ' . get_option('avatar_types'));
    }


    // Remove previous file if exists
    $CI->db->where('staffid', $profile_id);
    $_file = $CI->db->get(db_prefix() . 'staff')->row();
    if ($_file && !empty($_file->avatar)) {
        @unlink($path . $_file->avatar);
        @unlink($path . 'small_' . pathinfo($_file->avatar, PATHINFO_BASENAME));
        @unlink($path . 'thumb_' . pathinfo($_file->avatar, PATHINFO_BASENAME));
    }

    // Move uploaded file to final path
    $newFilePath = $path . $filename;
    if (!@move_uploaded_file($tmpFilePath, $newFilePath)) {
        return set_alert(false, 'unexpected_error', 'Failed to move uploaded file.');
    }

    // Gera imagens redimensionadas
    $CI->load->library('image_lib');

    // Thumb 320x320
    $config = [
        'image_library' => 'gd2',
        'source_image' => $newFilePath,
        'new_image' => 'thumb_' . $filename,
        'maintain_ratio' => true,
        'width' => 320,
        'height' => 320
    ];
    $CI->image_lib->initialize($config);
    $CI->image_lib->resize();
    $CI->image_lib->clear();

    // Small 96x96
    $config['new_image'] = 'small_' . $filename;
    $config['width'] = 96;
    $config['height'] = 96;
    $CI->image_lib->initialize($config);
    $CI->image_lib->resize();
    $CI->image_lib->clear();

    /// Persist new filename to DB
    $CI->db->where('staffid', $profile_id);
    $CI->db->update(db_prefix() . 'staff', [
        'avatar' => $filename
    ]);
    if ($CI->db->affected_rows() === 0) {
        // Rollback file if DB update failed
        if (is_file($newFilePath)) {
            @unlink($newFilePath);
        }
        return set_alert(false, 'unexpected_error', 'Database update failed.');        
    }

    // Remove arquivo original
    unlink($newFilePath);
    
    // Build frontend payload with useful info
    $resp = set_alert(true, 'upload', 'picture');  
    $resp['data'] = [
        'staffid'       => (int)$profile_id,
        'path'          => $newFilePath, // absolute server path (use relative if needed)
        'avatar'        => staff_profile_image_url($profile_id, 'small')        
    ];     
    
    return $resp;
}
/**
 * Maybe upload staff profile image
 * @param  string $staff_id staff_id or current logged in staff id will be used if not passed
 * @return boolean
 */
function handle_admin_avatar_upload($staff_id = '')
{

    if (isset($_FILES['adminAvatar']['name']) && $_FILES['adminAvatar']['name'] != '') {
        do_action('before_upload_admin_avatar');
        $path = get_upload_path_by_type('avatars');
        // Get the temp file path
        $tmpFilePath = $_FILES['adminAvatar']['tmp_name'];
        // Make sure we have a filepath
        if (!empty($tmpFilePath) && $tmpFilePath != '') {
            // Getting file extension
            $extension = strtolower(pathinfo($_FILES['adminAvatar']['name'], PATHINFO_EXTENSION));
            $allowed_extensions = [
                'jpg',
                'jpeg',
                'png',
            ];

            if (!in_array($extension, $allowed_extensions)) {
                //set_alert('warning', _l('file_php_extension_blocked'));

                return false;
            }
            //_maybe_create_upload_path($path);
            $filename    = unique_filename($path, $_FILES['adminAvatar']['name']);
            $newFilePath = $path . '/' . $filename;
            // Upload the file into the company uploads dir
            if (move_uploaded_file($tmpFilePath, $newFilePath)) {
                $CI                       = & get_instance();
                $config                   = [];
                $config['image_library']  = 'gd2';
                $config['source_image']   = $newFilePath;
                $config['new_image']      = 'thumb_' . $filename;
                $config['maintain_ratio'] = true;
                $config['width']          = 320;
                $config['height']         = 320;
                $CI->image_lib->initialize($config);
                $CI->image_lib->resize();
                $CI->image_lib->clear();
                $config['image_library']  = 'gd2';
                $config['source_image']   = $newFilePath;
                $config['new_image']      = 'small_' . $filename;
                $config['maintain_ratio'] = true;
                $config['width']          = 96;
                $config['height']         = 96;
                $CI->image_lib->initialize($config);
                $CI->image_lib->resize();
                $CI->db->where('adminId', $staff_id);
                $CI->db->update('admins', [
                    'adminAvatar' => $filename,
                ]);
                // Remove original image
                unlink($newFilePath);

                return true;
            }
        }
    }

    return false;
}
/**
 * Check if path exists if not exists will create one
 * This is used when uploading files
 * @param  string $path path to check
 * @return null
 */
function _maybe_create_upload_path($path)
{
    if (!file_exists($path)) {
        mkdir($path, 0755);
        fopen(rtrim($path, '/') . '/' . 'index.html', 'w');
    }
}

function create_img_thumb($path, $filename, $width = 1440, $height = 720)
{
    $CI = & get_instance();

    $source_path = rtrim($path, '/') . '/' . $filename;
    $target_path = $path;
    $config_manip = array(
        'image_library' => 'gd2',
        'source_image' => $source_path,
        'new_image' => $target_path,
        'maintain_ratio' => true,
        'create_thumb' => true,
        'thumb_marker' => '_thumb',
        'width' => $width,
        'height' => $height
    );

    $CI->image_lib->initialize($config_manip);
    $CI->image_lib->resize();
    $CI->image_lib->clear();
}

function create_img_posts_thumb($path, $filename, $width = 520, $height = 520)
{
    $CI = &get_instance();

    $source_path = rtrim($path, '/') . '/' . $filename;
    $target_path = $path;
    $config_manip = array(
        'image_library'  => 'gd2',
        'source_image'   => $source_path,
        'new_image'      => $target_path,
        'maintain_ratio' => true,
        'create_thumb'   => true,
        'thumb_marker'   => '_thumb',
        'width'          => $width,
        'height'         => $height,
    );

    $CI->image_lib->initialize($config_manip);
    $CI->image_lib->resize();
    $CI->image_lib->clear();
}

/**
 * Handles uploads error with translation texts
 * @param  mixed $error type of error
 * @return mixed
 */
function _api_upload_error($error)
{
    // Get the Max Upload Size allowed
    $maxUpload = (int)(ini_get('upload_max_filesize'));  

    $uploadErrors = [
        0 => _l('file_uploaded_success'),
        1 => _l('file_exceeds_max_filesize') . '. Maximum size: ' . $maxUpload . 'MB',
        2 => _l('file_exceeds_maxfile_size_in_form'),
        3 => _l('file_uploaded_partially'),
        4 => _l('file_not_uploaded'),
        6 => _l('file_missing_temporary_folder'),
        7 => _l('file_failed_to_write_to_disk'),
        8 => _l('file_php_extension_blocked'),
    ];

    if (isset($uploadErrors[$error]) && $error != 0) {
        return $uploadErrors[$error];
    }

    return false;
}
/**
 * Check if extension is allowed for upload
 * @param  string $filename filename
 * @return boolean
 */
function _upload_extension_allowed($filename)
{
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    $browser = get_instance()->agent->browser();

    $allowed_extensions = explode(',', get_option('allowed_files'));
    $allowed_extensions = array_map('trim', $allowed_extensions);

    //  https://discussions.apple.com/thread/7229860
    //  Used in main.js too for Dropzone
    if (strtolower($browser) === 'safari'
        && in_array('.jpg', $allowed_extensions)
        && !in_array('.jpeg', $allowed_extensions)
    ) {
        $allowed_extensions[] = '.jpeg';
    }
    // Check for all cases if this extension is allowed
    if (!in_array('.' . $extension, $allowed_extensions)) {
        return false;
    }

    return true;
}
/**
 * Check if extension is allowed for upload
 * @param  string $filename filename
 * @return boolean
 */
function _upload_pictures_allowed($filename)
{
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    $browser = get_instance()->agent->browser();

    $allowed_extensions = explode(',', get_option('site_pic_types'));
    $allowed_extensions = array_map('trim', $allowed_extensions);

    //  https://discussions.apple.com/thread/7229860
    //  Used in main.js too for Dropzone
    if (strtolower($browser) === 'safari'
        && in_array('.jpg', $allowed_extensions)
        && !in_array('.jpeg', $allowed_extensions)
    ) {
        $allowed_extensions[] = '.jpeg';
    }
    // Check for all cases if this extension is allowed
    if (!in_array('.' . $extension, $allowed_extensions)) {
        return false;
    }

    return true;
}
/**
 * Check if extension is allowed for upload
 * @param  string $filename filename
 * @return boolean
 */
function _upload_avatar_allowed($filename)
{
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    $browser = get_instance()->agent->browser();

    $allowed_extensions = explode(',', get_option('avatar_types'));
    $allowed_extensions = array_map('trim', $allowed_extensions);

    //  https://discussions.apple.com/thread/7229860
    //  Used in main.js too for Dropzone
    if (strtolower($browser) === 'safari'
        && in_array('.jpg', $allowed_extensions)
        && !in_array('.jpeg', $allowed_extensions)
    ) {
        $allowed_extensions[] = '.jpeg';
    }
    // Check for all cases if this extension is allowed
    if (!in_array('.' . $extension, $allowed_extensions)) {
        return false;
    }

    return true;
}
/**
 * Function that return full path for upload based on passed type
 * @param  string $type
 * @return string
 */
function get_upload_path_by_type($type)
{
    $path = '';
    switch ($type) {
        case 'avatars':
            $path = AVATAR_ATTACHMENTS_FOLDER;

        break;   
        case 'slides':
            $path = SLIDES_UPLOADS_FOLDER;

        break;  
        case 'categories':
            $path = CATEGORIES_IMAGES_FOLDER;

        break;      
        case 'company':
            $path = COMPANY_UPLOADS_FOLDER;

        break;   
        case 'staff':
            $path = STAFF_UPLOADS_FOLDER;
    
        break;
        case 'clients':
            $path = CLIENT_LOGO_IMAGES_FOLDER;
    
        break;         
        case 'contact_profile_images':
            $path = CONTACT_PROFILE_IMAGES_FOLDER;
    
        break;                       
        case 'services':
            $path = SERVICES_UPLOADS_FOLDER;

        break;                   
        case 'teams':
            $path = TEAMS_UPLOADS_FOLDER;

        break;  
        case 'projects':
            $path = PROJECTS_UPLOADS_FOLDER;

        break;         
        case 'posts':
            $path = POSTS_UPLOADS_FOLDER;

        break;                                           
    }

    return hooks()->apply_filters('get_upload_path_by_type', $path, $type);
}