<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Clients extends ClientsController
{
    public function __construct()
    {
        parent::__construct();

        hooks()->do_action('after_clients_area_init', $this);
    }    

    /**
     * API Root endpoint.
     *
     * Returns basic app info (e.g., company name).
     *
     * Response: 200 OK
     */    
    public function index()
    {
        $this->safe(function () {
            $data = [
                'title' => (string) get_option('company_name'),
            ];
            return $this->respond($data, 200);
        });    
    }       
        
    
    /**
     * Public slides endpoint.
     *
     * Returns active slides with a short description and main picture (if any).
     * Folder and file URLs are built as:
     *   {base}/api/uploads/slides/{slide_id}/<file>
     * Thumbnail convention: "small_{file_name}" in the same folder (fallback to original if missing).
     *
     * Response: 200 OK with an array (possibly empty).
     */
    public function slides()
    {
        $this->safe(function () {

            $slides = $this->slides_model->get('', [
                'slides.active' => 1,
            ]);

            if (empty($slides)) {
                return $this->respond([], 200);
            }            

            $data = [];
			foreach($slides as $row){
                // Short description (safe cast)
                $shortDesc = strip_tags(character_limiter((string)($row->description ?? ''), 150));
                
                // Base folder URL: /api/uploads/slides/
                $base   = rtrim(base_url('api/uploads/slides'), '/');
                $folder = $base . '/';

                // Picture (first/main) - optional
                $pic      = $this->slides_model->get_picture($row->id);
                $pictures = [];

                if (!empty($pic)) {
                    $fileName   = (string)($pic->file_name ?? '');
                    $origName   = (string)($pic->original_file_name ?? '');
                    $subject    = (string)($pic->subject ?? '');
                    $descPic    = (string)($pic->description ?? '');

                    // thumb
                    $thumbName  = 'thumb_' . $fileName;

                    // Prefer thumb; fall back to original if needed
                    $thumbUrl = $folder . rawurlencode($thumbName);
                    $fileUrl  = $folder . rawurlencode($fileName);

                    $pictures = [
                        'file_name'          => $fileName,
                        'original_file_name' => $origName,
                        'subject'            => $subject,
                        'description'        => sanitize_html_input($descPic),
                        'url'                => $fileUrl,
                        'thumb'              => $thumbUrl, // client may fall back to url if 404
                    ];
                }

				$data[] = [
                    'id'            => $row->id,
					'name'          => $row->name,
					'description'   => sanitize_html_input($shortDesc),
					'link'          => $row->link,
					'mask'          => $row->mask,
					'folder'        => $folder,
                    'active'        => $row->active,
					'pictures'      => $pictures,
                ];			
			}
            return $this->respond($data, 200);
		});
    }  

   /**
     * Get all active posts.
     *
     * Optional GET params:
     * - category_id (int)
     * - search_string (string)
     *
     * Returns active posts with basic info and thumbnail.
     * Response: 200 OK (array or empty array)
     */
    public function posts()
    {
        $this->safe(function () {

            // Collect filter params
            $ts_filter_data = [
                'category_id'   => $this->input->get('category_id'),
                'search_string' => $this->input->get('search_string'),
            ];
            $filter = ['filter' => $ts_filter_data];

            // Fetch posts
            $posts = $this->posts_model->get('', $filter, [
                'posts.active' => 1,
            ]);
            
            if (empty($posts)) {
                return $this->respond([], 200);
            }        

            $data = [];
			foreach($posts as $row){ 
                // Shortened description
                $shortDesc = strip_tags(character_limiter((string)($row->description ?? ''), 50));

                // Folder URL (safe encoding)
                $folder = trim((string)($row->folder ?? ''), "/ \t\n\r\0\x0B");                
                // Folder URL safe
                if ($folder !== '') {
                    $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/\\') . '/' . rawurlencode((int)$row->id) . '/';
                }
                // Thumbnail helper (fallback handled by post_image_url)
                $thumbUrl = post_image_url((int)$row->id, 'thumb');

				$data[] = [
                    'id'               => isset($row->id) ? (int)$row->id : null,
                    'name'             => (string)($row->name ?? ''),
                    'description'      => $shortDesc,
                    'long_description' => sanitize_html_input((string)($row->long_description ?? '')),
                    'folder'           => $folderUrl,
                    'order'            => isset($row->order) ? (int)$row->order : 0,
                    'external_link'    => (string)($row->external_link ?? ''),
                    'slug'             => (string)($row->slug ?? ''),
                    'pictures'         => [
                        'thumb' => $thumbUrl,
                    ],
                ];                
            }
            return $this->respond($data, 200);         
        });
    }   
    
    /**
     * Get posts by slug.
     *
     * @param string $slug
     *
     * Returns an array of posts matching the slug, including:
     * - basic fields, categories, and pictures (with file URL + thumb URL)
     * - folder URL: /api/uploads/posts/{id}/
     * - time_read via estimateReadingTime()
     *
     * Response: 200 OK (array or empty array)
     */
    public function getPostsBySlug($slug)
    {
        $this->safe(function () use ($slug) {

            $slug = (string)$slug;
            if ($slug === '') {
                return $this->unprocessable('Missing or invalid slug.', [
                    'slug' => 'Required and must not be empty.'
                ]);
            }

            $row = $this->posts_model->slug($slug, [
                'languages.language_cod' => $lang,
            ]);

            // array|obj|null
            if (empty($row)) {
                return $this->respond([], 200);
            }

            // Helper date -> ISO-8601 (RFC3339)
            $toIso = static function ($dateStr) {
                $ts = @strtotime((string)$dateStr);
                return $ts ? date('c', $ts) : (string)$dateStr;
            };            

            $id        = isset($row->id) ? (int)$row->id : null;
            // helper folder URL segura
            $folderUrl = null;
            if (!empty($row->folder)) {
                $folder = trim((string)$row->folder, "/ \t\n\r\0\x0B");
                if ($folder !== '') {
                    // Folder URL: /api/uploads/posts/{id}/
                    $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/') . '/' . rawurlencode((int)$row->id) . '/';
                }
            }  

            // Pictures
            $pictures = [];
            $product_pic = $this->posts_model->get_pictures($id);
            if (!empty($product_pic)) {
                foreach ($product_pic as $pic) {
                    $fname   = (string)($pic->file_name ?? '');
                    $orig    = (string)($pic->original_file_name ?? '');
                    $subject = (string)($pic->subject ?? '');
                    $pdesc   = (string)($pic->description ?? '');
                    $visible = isset($pic->visible_full) ? (int)$pic->visible_full : null;

                    // URLs (prefer thumb small_{file_name})
                    $fileUrl  = $folderUrl . rawurlencode($fname);
                    $thumbUrl = $folderUrl . rawurlencode($fname . '_thumb');

                    $pictures[] = [
                        'file_name'          => $fname,
                        'original_file_name' => $orig,
                        'visible_full'       => $visible,
                        'subject'            => $subject,
                        'description'        => $pdesc,
                        'url'                => $fileUrl,
                        'thumb'              => $thumbUrl,
                    ];
                }
            }

            // Categories
            $categories = [];
            $post_cat = $this->posts_model->get_categories($id);
            if (!empty($post_cat)) {
                foreach ($post_cat as $cat) {
                    $categories[] = [
                        'id'   => isset($cat->id) ? (int)$cat->id : null,
                        'name' => (string)($cat->name ?? ''),
                    ];
                }
            }  
            
            $longDesc = sanitize_html_input((string)($row->long_description ?? ''));
            $data = [
                'id'               => $id,
                'name'             => (string)($row->name ?? ''),
                'description'      => (string)($row->description ?? ''),
                'long_description' => $longDesc, 
                'folder'           => $folderUrl,
                'slug'             => (string)($row->slug ?? ''),
                'order'            => isset($row->order) ? (int)$row->order : 0,
                'date'             => $toIso($row->dateadded ?? null),
                'categories'       => $categories,
                'pictures'         => $pictures,
                'time_read'        => estimateReadingTime($longDesc),
            ];   

            return $this->respond($data, 200); 
        });
    }    

    /**
     * Get all post categories.
     *
     * Returns all categories from products_model.
     * 
     * Response:
     * - 200 OK with an array of categories (possibly empty)
     */
    public function categories()
    {
        $this->safe(function () {

            $categories = $this->categories_model->get();
            // array|obj|null
            if (empty($categories)) {
                return $this->respond([], 200);
            }

            $data = [];
            foreach($categories as $row){
                // helper folder URL segura
                $folderUrl = null;
                if (!empty($row->folder)) {
                    $folder = trim((string)$row->folder, "/ \t\n\r\0\x0B");
                    if ($folder !== '') {
                        // Folder URL: /api/uploads/posts/{id}/
                        $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/\\') . '/' . rawurlencode((int)$row->id) . '/';
                    }
                }  

                $fname   = (string)($row->file_name ?? '');
                // URLs (prefer thumb _thumb{file_name})
                $thumbUrl = $folderUrl . $fname;
                                
                $data[] = [
                    'id'            => isset($row->id) ? (int)$row->id : null,
                    'name'          => (string)($row->name ?? ''),
                    'description'   => (string)($row->description ?? ''), 
                    'file_name'     => $fname, 
                    'slug'          => (string)($row->slug ?? ''), 
                    'thumb'         => $thumbUrl,    
                ];
            }
            return $this->respond($data, 200);
        });
    }

    /**
     * Get categories for a given post.
     *
     * @param int|string $slug
     *
     * Responses:
     * - 200 OK with an array of categories (possibly empty)
     * - 422 Unprocessable when id is missing/invalid
     */
    public function category($slug)
    {
        $this->safe(function () use ($slug) {

            $slug = (string)$slug;
            if ($slug === '') {
                return $this->unprocessable('Missing or invalid slug.', [
                    'slug' => 'Required and must not be empty.'
                ]);
            }

            $row = $this->categories_model->slug($slug);
            // array|obj|null
            if (empty($row)) {
                return $this->respond([], 200);
            }     
            
            $data = [
                'id'          => isset($row->id) ? (int)$row->id : null,
                'name'        => (string)($row->name ?? ''),
            ];                    

            return $this->respond($data, 200);
        });
    }     

    /**
     * Public company endpoint.
     *
     * Returns active company with a short description and main picture (if any).
     * Folder and file URLs are built as:
     *   {base}/api/uploads/{folder}/<file>
     *
     * Response: 200 OK with an array (possibly empty).
     */
    public function company()
    {
        $this->safe(function () {

            $row = $this->company_model->get();
            if (empty($row)) {
                return $this->respond([], 200);
            }

            $data = [];  
            // Short description (safe cast)
            $shortDesc = strip_tags(character_limiter((string)($row->description ?? ''), 250));

            // Base folder URL: /api/uploads/company/
            $base   = rtrim(base_url('api/uploads'), '/\\') . '/';
            $folder = $base . $row->folder. '/';

            $data = [
                'name'              => (string)($row->name ?? ''),
                'description'       => $shortDesc,
                'long_description'  => sanitize_html_input((string)($row->long_description ?? '')),
                'folder'            => $folder,
            ];

            return $this->respond($data, 200);          
        });
    }    

    /**
     * Get all company items.
     *
     * Returns all items from the company_model with normalized data and URLs.
     * Each item may include:
     * - id, name, description
     * - folder (URL)
     * - file_name
     * - visible_draft (bool/int)
     * - language (code)
     *
     * Response: 200 OK (array or empty array)
     */
	public function companyItems()
	{
        $this->safe(function () {

            $items = $this->company_model->get_items('');

            if (empty($items)) {
                return $this->respond([], 200);
            }

            $data = [];
			foreach($items as $row){ 
				$data[] = [
                    'id'            => isset($row->id) ? (int)$row->id : null,
                    'name'          => (string)($row->name ?? ''),
					'description'   => sanitize_html_input((string)($row->description ?? '')),
					'order'         => isset($row->order) ? (int)$row->order : 0, 
                ];
			}
            return $this->respond($data, 200);          
		});
	}   

    /**
     * Get company pictures.
     *
     * @param int|bool $limit Optional limit for the number of results.
     *
     * Returns all company pictures (or limited set) with file URLs and metadata.
     *
     * Response: 200 OK (array or empty array)
     */    
	public function companyPictures($limit = false)
	{
        $this->safe(function () use ($limit) {
            $pictures = $this->company_model->get_pictures('', $limit);

            if (empty($pictures)) {
                return $this->respond([], 200);
            }

            // Folder URL (safe encoding)
            $baseUrl = rtrim(base_url('api/uploads/company'), '/\\') . '/';

            $data = [];
            foreach($pictures as $pic){
                $fileName = (string)($pic->file_name ?? '');
                $origName = (string)($pic->original_file_name ?? '');
                $subject  = (string)($pic->subject ?? '');   
                $desc     = (string)($pic->description ?? '');     
                
                // URLs seguras (encode por arquivo)
                $fileUrl  = $baseUrl . rawurlencode($fileName);
            
                $data[] = [
                    'file_name'          => $fileName,
                    'original_file_name' => $origName,                      
                    'subject'            => $subject,
                    'description'        => $desc,                                                   
                ];
            }      
            return $this->respond($data, 200);          
        });
	}   
    
    /**
     * Get all teams.
     *
     * Returns all team records with basic details and avatar URLs.
     * Each item includes folder URL (/api/uploads/teams/{id}/) and file_avatar (full path).
     *
     * Response: 200 OK (array or empty array)
     */
    public function teams()
    {
        $this->safe(function () {
            $teams = $this->teams_model->get();

            if (empty($teams)) {
                return $this->respond([], 200);
            }

            $base = rtrim(base_url('api/uploads/teams'), '/');
            
            $data = [];
			foreach($teams as $row){ 
                $id = isset($row->id) ? (int)$row->id : 0;
                $folderUrl = $base . '/' . rawurlencode((string)$id) . '/';

                $fileName = !empty($row->file_avatar) ? (string)$row->file_avatar : null;
                $fileUrl  = $fileName ? $folderUrl . rawurlencode($fileName) : null;

                $data[] = [
                    'id'          => $id,
                    'name'        => (string)($row->name ?? ''),
                    'description' => sanitize_html_input((string)($row->description ?? '')),
                    'employer'    => (string)($row->employer ?? ''),
                    'phonenumber' => (string)($row->phonenumber ?? ''),
                    'email'       => (string)($row->email ?? ''),
                    'folder'      => $folderUrl,
                    'file_avatar' => $fileUrl,
                    'order'       => isset($row->order) ? (int)$row->order : 0,
                ];
            }
            return $this->respond($data, 200);          
        });
    }    

    /**
     * Get all services.
     *
     * Returns all services from services_model.
     * Folder and file URLs are built as:
     *   {base}/api/uploads/<file>* 
     * 
     * Response:
     * - 200 OK with an array of services (possibly empty)
     */
    public function services()
    {
        $this->safe(function () {

            $services = $this->services_model->get();
         
            // array|obj|null
            if (empty($services)) {
                return $this->respond([], 200);
            }

            $data = [];
            foreach($services as $row){ 
                // helper folder URL segura
                $folderUrl = null;
                if (!empty($row->folder)) {
                    $folder = trim((string)$row->folder, "/ \t\n\r\0\x0B");
                    if ($folder !== '') {
                        // Folder URL: /api/uploads/{folder}/
                        $folderUrl = rtrim(base_url('api/uploads/' . rawurlencode($folder)), '/\\') . '/';
                    }
                }  

                $fname   = (string)($row->file_name ?? '');
                // URLs (prefer thumb _thumb{file_name})
                $thumbUrl = $folderUrl . $fname;                

                $data[] = array(
                    'id'            => isset($row->id) ? (int)$row->id : null,
                    'name'          => (string)($row->name ?? ''),
                    'description'   => sanitize_html_input((string)($row->description ?? '')),
                    'file_name'     => $fname,
                    'folder'        => $folderUrl,
                    'order'         => isset($row->order) ? (int)$row->order : 0, 
                    'slug'          => (string)($row->slug ?? ''), 
                );
            }
            return $this->respond($data, 200);           
         });       
    }    
    
    /**
     * Get service for a given post.
     *
     * @param int|string $slug
     *
     * Responses:
     * - 200 OK with an array of service (possibly empty)
     * - 422 Unprocessable when id is missing/invalid
     */    
    public function service($slug)
    {
        $this->safe(function () use ($slug) {
            
            $slug = (string)$slug;
            if ($slug === '') {
                return $this->unprocessable('Missing or invalid slug.', [
                    'slug' => 'Required and must not be empty.'
                ]);
            }

            $row = $this->services_model->get_service_slug($slug);
            // array|obj|null
            if (empty($row)) {
                return $this->respond([], 200);
            }     

            $data = [
                'id'            => isset($row->id) ? (int)$row->id : null,
                'name'          => (string)($row->name ?? ''),
                'description'   => sanitize_html_input((string)($row->description ?? '')),                
            ];      

            return $this->respond($data, 200);
        });
    }        

    public function social()
    {
        $this->safe(function () {
            $data = $this->social_model->get(null, ['active' => 1]);
            if (empty($data)) {
                $response = array(
                    'type' => 'info',
                    'message' => 'No Pictures'
                );                   
                return $this->respond($response, 200);
            }

            return $this->respond($data, 200);  
        });
    }    

    public function addLead()
    {
        $this->safe(function () {
            // Load payload (expects JSON body)
            $formdata = $this->readJson();
            
            if (empty($formdata) || !is_array($formdata)) {
                return $this->unprocessable('Empty or invalid payload.');
            }

            // Required fields
            $errors = [];
            $name           = (string)($formdata['name']           ?? '');
            $phonenumber    = (string)($formdata['phonenumber']    ?? '');
            $emailRaw       = trim((string)($formdata['email']     ?? ''));
            $source         = (int)($formdata['source']            ?? 3);

            // E-mail: normaliza e valida
            $email = strtolower($emailRaw);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Invalid email.';
            }    
            
            if (!empty($errors)) {
                return $this->unprocessable('Validation failed.', $errors);
            }            

			$data = [
                'name'        => $name,
				'phonenumber' => $phonenumber,
				'email'       => $email,
                'source'      => $source
            ];

            // Insere via model
            $id = $this->leads_model->add($data);
            if (!$id) {
                return $this->unprocessable('Failed to create lead.');
            }

           return $this->ok(['id' => (int)$id], 'create', 'lead');
        });      
    }  

    /**
     * Get all countries.
     *
     * Returns all countries from posts_model.
     * 
     * Response:
     * - 200 OK with an array of countries (possibly empty)
     */
    public function countries()
    {
        $this->safe(function () {
            $countries = get_all_countries();

            // array|obj|null
            if (empty($countries)) {
                return $this->respond([], 200);
            }

            $data = [];
			foreach($countries as $row){ 
                $data[] = [
                    'name'     => (string)($row['short_name'] ?? ''),
                    'iso'      => (string)($row['iso2'] ?? ''),
                    'code'     => (string)($row['calling_code'] ?? ''),
                    'value'    => (int)$row['country_id'],
                ];
            }
            return $this->respond($data, 200);
        });
    }

    /**
     * Send contact email (optionally with one attachment).
     *
     * Expects multipart/form-data (POST):
     *  - subject   (string, required)
     *  - firstname (string, required)
     *  - lastname  (string, required)
     *  - email     (string, required, valid email)
     *  - phone     (string, optional)
     *  - message   (string, required)
     *  - file      (file,   optional; extension must be in ticket_attachments_file_extensions)
     *
     * Responses (via $this->safe):
     *  - 200 OK     on success
     *  - 400/422    on invalid payload or disallowed attachment
     */
    public function settings()
    {
        $this->safe(function () {

            $whatsapp_chat_clients_area = get_option('whatsapp_chat_clients_area');
            $whatsapp_chat_clients_area = html_entity_decode(clear_textarea_breaks($whatsapp_chat_clients_area));

            if(isMobile()){
                $service = 'api.whatsapp.com';
            }
            else {
                $service = 'web.whatsapp.com';
            }

            $data = [
				'main_domain'              => get_option('main_domain'),
				'company_name'             => get_option('company_name'),
				'business_name'            => get_option('business_name'),
				'company_address'          => get_option('company_address'),
				'company_city'             => get_option('company_city'),
				'company_alt_phonenumber'  => get_option('company_alt_phonenumber'),
				'company_postal_code'      => get_option('company_postal_code'),
				'company_phonenumber'      => get_option('company_phonenumber'),
				'company_email'            => get_option('company_email'),
				'company_description'      => get_option('company_description'),
                
                'ticket_attachments_file_extensions' => get_option('ticket_attachments_file_extensions'),

                // Whatsapp
                'whatsapp_chat'            => get_option('whatsapp_chat'),					
                'whatsapp_chat_clients_area' => 'https://wa.me/' . $whatsapp_chat_clients_area,						
                'whatsapp_chat_description' => '?text=' . get_option('whatsapp_chat_description'),	            
            ];
           return $this->respond($data, 200);    
        });    
    }    

    // Send email - No templates used only simple string
    public function send_email()
    {
		
        $this->safe(function () {
            if (!$this->input->post()) {
                return $this->badRequest('Invalid request method. Expected POST.');
            }

            // Normalize inputs
            $subject   = trim((string)$this->input->post('subject'));
            $firstname = trim((string)$this->input->post('firstname'));
            $lastname  = trim((string)$this->input->post('lastname'));
            $email     = trim((string)$this->input->post('email'));
            $phone     = trim((string)$this->input->post('phone'));
            $message   = trim((string)$this->input->post('message'));

            // Basic validations
            $errors = [];
            if ($firstname === '')  { $errors['firstname'] = 'Required.'; }
            if ($lastname === '')   { $errors['lastname']  = 'Required.'; }
            if ($message === '')    { $errors['message']   = 'Required.'; }
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Invalid email.';
            }
            if (!empty($errors)) {
                return $this->unprocessable('Invalid form data.', $errors);
            }

            $data = [
                'subject'   => $subject,
                'firstname' => $firstname,
                'lastname'  => $lastname,
                'email'     => $email,
                'phone'     => $phone,
                'message'   => $message,
            ];
            
            $this->load->model('emails_model');

            // Handle optional attachment
            $attachmentAdded = false;
            $disallowedExt   = null;

            if (isset($_FILES['file']) && is_array($_FILES['file']) && ($_FILES['file']['name'] ?? '') !== '') {
                // Check PHP upload errors first
                if (!empty($_FILES['file']['error']) && $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                    return $this->badRequest('Upload error.', ['file_error' => (int)$_FILES['file']['error']]);
                }

                $extension = strtolower((string)pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
                $allowed_extensions = explode(',', (string)get_option('ticket_attachments_file_extensions'));
                $allowed_extensions = array_values(array_filter(array_map('trim', $allowed_extensions)));
                $allowed_extensions = hooks()->apply_filters('ticket_attachments_file_extensions', $allowed_extensions);

                if ($extension === '' || !in_array($extension, $allowed_extensions, true)) {
                    $disallowedExt = $extension;
                } else {
                    // Add the attachment to emails_model queue
                    $this->emails_model->add_attachment([
                        'attachment' => $_FILES['file']['tmp_name'],
                        'filename'   => $_FILES['file']['name'],
                        'type'       => $_FILES['file']['type'] ?? 'application/octet-stream',
                        'read'       => true,
                    ]);
                    $attachmentAdded = true;
                }
            }  
            
            // If user attempted an upload but extension is not allowed, stop here
            if ($disallowedExt !== null) {
                return $this->unprocessable(
                    'File extension not allowed.',
                    [
                        'extension' => $disallowedExt,
                        'allowed'   => implode(', ', $allowed_extensions ?? []),
                    ]
                );
            }            

            // Send email via model
            $success = $this->emails_model->send_email_contact($data);

            if ($success) {
                return $this->respond([
                    'type'    => 'success',
                    'title'   => 'Success!',
                    'message' => 'Your message has been sent successfully.',
                    'meta'    => ['attachment_added' => $attachmentAdded],
                ], 200);
            }  
            
            // Soft failure (e.g., SMTP issue)
            return $this->respond([
                'type'    => 'warning',
                'title'   => 'Warning!',
                'message' => 'Failed to send your message.',
                'meta'    => ['attachment_added' => $attachmentAdded],
            ], 200);            
        });
    }       
}