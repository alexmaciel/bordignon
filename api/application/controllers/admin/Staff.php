<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Staff extends AdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('staff_model');
    }

    /**
     * Get all staff members.
     *
     * Returns:
     * 200 OK with an array (possibly empty).
     * 500 on unexpected errors (handled by $this->safe()).
     */  
    public function getAll()
    {
        $this->safe(function () {
		    $admins = $this->staff_model->getAll();
		
            // array|obj|null
            if (empty($admins)) {
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
			foreach($admins as $row){
                $staffid = isset($row->staffid) ? (int)$row->staffid : (int)($row->id ?? 0);

                $website = '';
                if (!empty($row->adminWebsite)) {
                    $website = (string)$row->adminWebsite;
                } elseif (!empty($row->email) && strpos($row->email, '@') !== false) {
                    $parts = explode('@', $row->email);
                    $website = $parts[1] ?? '';
                }            

				$data[] = array(
                    'id'               => isset($row->id) ? (int)$row->id : null,
                    'staffid'          => $staffid,
                    'firstname'        => (string)($row->firstname ?? ''),
                    'lastname'         => (string)($row->lastname ?? ''),
                    'fullname'         => (string)($row->fullname ?? ''),
                    'email'            => !empty($row->email) ? (string)$row->email : null,
                    'phone'            => !empty($row->phone) ? (string)$row->phone : null,
                    'avatar'           => $staffid > 0 ? staff_profile_image_url($staffid, 'thumb') : null,
                    'role'             => !empty($row->role) ? $this->roles_model->get($row->role) : 0,
                    'admin'            => isset($row->admin) ? (int)$row->admin : 0,
                    'username'         => (string)($row->username ?? ''),
                    'default_language' => (string)($row->default_language ?? ''),
                    'date'             => $toIso($row->dateadded ?? null), 
                    'address'          => (string)($row->address ?? ''),
                    'website'          => $website,
                    'active'           => isset($row->active) ? (int)$row->active : 0,
				);
			}

            return $this->respond($data, 200);
		});
	} 

    /**
     * Get a single staff member by id.
     *
     * Validates the id, resolves the current language, fetches the staff
     * and its language, and returns a normalized payload.
     *
     * Responses:
     * - 200 OK with the item payload
     * - 404 Not Found when the staff member does not exist
     * - 422 Unprocessable when id is missing/invalid
     * - 500 on unexpected errors (handled by $this->safe())
     *
     * @param mixed $id
     * @return void (echo JSON)
     */        
    public function getItemById($id)
    {
        $this->safe(function () use ($id) {
            $staffid = (int) $id;

            if ($staffid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            hooks()->do_action('staff_view_profile', $staffid);


            $row = $this->staff_model->get($staffid);
            if (empty($row)) {
                return $this->notFound('Staff member not found.');
            }

            $website = '';

            if (!empty($row->website)) {
                $website = (string)$row->website;
            } elseif (!empty($row->email) && strpos($row->email, '@') !== false) {
                $parts = explode('@', $row->email);
                $website = $parts[1] ?? '';
            }


            $data = [
                'id'               => isset($row->staffid) ? (int)$row->staffid : null,
                'staffid'          => isset($row->staffid) ? (int)$row->staffid : null,
                'firstname'        => (string)($row->firstname ?? ''),
                'lastname'         => (string)($row->lastname ?? ''),
                'fullname'         => (string)($row->fullname ?? ''),
                'email'            => !empty($row->email) ? (string)$row->email : null,
                'phone'            => !empty($row->phone) ? (string)$row->phone : null,
                'avatar'           => !empty($row->staffid) ? staff_profile_image_url($row->staffid, 'thumb') : null,
                'admin'            => isset($row->admin) ? (int)$row->admin : 0,
                'role'             => !empty($row->role) ? $this->roles_model->get($row->role) : 0,
                'username'         => (string)($row->username ?? ''),
                'default_language' => (string)($row->default_language ?? ''),
                'date'             => (string)($row->datecreated ?? ''),
                'address'          => (string)($row->address ?? ''),
                'active'           => isset($row->active) ? (int)$row->active : 0,
                'website'          => $website,
                'permissions'      => $row->permissions ?? [],
            ];
		    return $this->respond($data, 200);
        });     
    }   

    public function create()
    {
        $this->safe(function () {
            // Load payload (expects JSON body)
            $formdata = $this->readJson();

            if (empty($formdata) || !is_array($formdata)) {
                return $this->unprocessable('Empty or invalid payload.');
            }

            $firstname = trim((string)($formdata['firstname'] ?? ''));
            $lastname  = trim((string)($formdata['lastname'] ?? ''));
            $email     = trim((string)($formdata['email'] ?? ''));
            $password  = (string)($formdata['password'] ?? '');
            $role      = isset($formdata['role']) ? (int)$formdata['role'] : 0;
            $active    = isset($formdata['active']) ? (int)$formdata['active'] : 0;
            $sendMail  = isset($formdata['send_mail']) ? (int)$formdata['send_mail'] : 0;

            $errors = [];

            if ($firstname === '') {
                $errors['firstname'] = 'Required.';
            }

            if ($lastname === '') {
                $errors['lastname'] = 'Required.';
            }

            if ($email === '') {
                $errors['email'] = 'Required.';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Invalid email.';
            }

            if ($password === '') {
                $errors['password'] = 'Required.';
            }

            /*
            if (strlen($password) < 8) {
                $errors['password'] = 'Password must be at least 8 characters.';
            }
            */

            if ($role <= 0) {
                $errors['role'] = 'Required.';
            }

            if (!empty($errors)) {
                return $this->unprocessable('Failed to create staff member.', $errors);
            }

            /**
             * Permissão: somente admin pode criar staff.
             */
            $isAdmin = function_exists('is_admin') ? is_admin() : false;

            if (!$isAdmin) {
                return $this->forbidden('You do not have permission to create staff members.');
            }

            /**
             * Verifica e-mail duplicado.
             */
            $this->db->where('email', $email);
            $existingStaff = $this->db->get(db_prefix() . 'staff')->row();

            if ($existingStaff) {
                return $this->unprocessable(_l('email_exists'), [
                    'email' => _l('email_exists')
                ]);
            }

            $data = [
                'firstname'          => $firstname,
                'lastname'           => $lastname,
                'email'              => $email,
                'role'               => $role,
                'password'           => $password,
                'active'             => $active,
                'send_welcome_email' => $sendMail,
                'default_language'   => get_staff_default_language() != ''
                    ? get_staff_default_language()
                    : get_option('active_language'),
            ];

            $id = $this->staff_model->add($data);

            if ($id) {
                return $this->ok([
                    'id'      => (int)$id,
                    'staffid' => (int)$id,
                ], 'create', 'staff_member');
            }

            return $this->unprocessable('Failed to create staff member.', [
                'create' => 'Could not create staff member.'
            ]);
        });
    }   

    /**
     * Update a staff member.
     *
     * Expects JSON body with any of the fields:
     *  - name (string)
     *  - description (string)
     *  - email (string|null) - normalized to null when empty; validated if present
     *  - phone (string|null) - normalized to null when empty; validated if present
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
        if (!has_permission('staff', '', 'edit')) {
            access_denied('staff');
        }
				
        $this->safe(function () use ($id) {
            hooks()->do_action('staff_staff_edit_profile', $id);

            $pid = (int) $id;
            if ($pid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            // Load payload (expects JSON body)
            $formdata = $this->readJson();  

            $firstname   = trim((string)($formdata['firstname'] ?? ''));
            $lastname    = trim((string)($formdata['lastname'] ?? ''));
            $phone       = trim((string)($formdata['phone'] ?? ''));
            $emailRaw    = trim((string)($formdata['email'] ?? ''));
            $address     = trim((string)($formdata['address'] ?? ''));
            $username    = trim((string)($formdata['username'] ?? ''));
            $roleId      = (int)($formdata['role'] ?? 0);
            $admin       = !empty($formdata['admin']) ? 1 : 0;
            $language    = (string)($formdata['default_language'] ?? '');

            $permissions 	= $formdata['permissions'];
            
            $errors = [];
            if ($firstname === '') $errors['firstname'] = 'Required.';
            if ($lastname  === '') $errors['lastname']  = 'Required.';

            // Email
            $email = strtolower($emailRaw);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Invalid email.';
            }

            if ($roleId <= 0) {
                $errors['role'] = 'Invalid role.';
            } else {
                $role = $this->roles_model->get($roleId);
                if (!$role) {
                    $errors['role'] = 'Role not found.';
                }
            }

            if (!empty($errors)) {
                return $this->unprocessable('Validation failed.', $errors);
            }
                    
            $current = $this->staff_model->get($pid);
            if (!$current) {
                return $this->respond(['error' => true, 'message' => 'Staff not found.'], 404);
            }            

            if (strcasecmp((string)$current->email, $email) !== 0) {
                $this->db->where('email', $email);
                $this->db->where('staffid !=', $pid);
                $dupEmail = $this->db->get(db_prefix().'staff')->row();
                if ($dupEmail) {
                    return $this->unprocessable('Email already exists.', ['email' => 'This email is already in use.']);
                }
            }
                     
            if ($username !== '' && strcasecmp((string)$current->username, $username) !== 0) {
                $this->db->where('username', $username);
                $this->db->where('staffid !=', $pid);
                $dupUser = $this->db->get(db_prefix().'staff')->row();
                if ($dupUser) {
                    return $this->unprocessable('Username already exists.', ['username' => 'This username is already in use.']);
                }
            }   

            if ((int)$current->staffid === get_staff_user_id() && ( ($admin !== (int)$current->admin) || ($roleId !== (int)$current->role) )) {
                return $this->unprocessable('You cannot change your own role or admin flag.');
			}

            $data = array(
                'firstname'        => $firstname,
                'lastname'         => $lastname,
                'phone'            => $phone,
                'email'            => $email,
                'address'          => $address,
                'username'         => $username,
                'role'             => $roleId,
                'admin'            => $admin,
                'permissions'      => $permissions,
                'default_language' => $language,
            );	
                
            $data = array_filter($data, static function ($v) {
                // mantém 0 e '0'; remove null e string vazia
                return !($v === null || $v === '');
            });   

            $success = $this->staff_model->update($pid, $data);

            if ($success) {
                return $this->ok($data, 'update', 'staff_member');      
            }

            return $this->unprocessable('Failed to update staff.'); 
		});	
    }
    
    
	public function uploadAvatar($id) 
	{
        $this->safe(function () use ($id) {
            $pid = (int)$id;

            $result = handle_profile_image_upload($pid);

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
    
    /* Remove staff profile image / ajax */
	public function deleteAvatar($id)
	{
        $this->safe(function () use ($id) {

            $staff_id = is_numeric($id) && (int)$id > 0
                ? (int)$id
                : (int)get_staff_user_id();

            if ($staff_id <= 0) {
                return $this->unprocessable('Missing or invalid id.', [
                    'id' => 'Required and must be greater than zero.'
                ]);
            }

            $success = $this->staff_model->deleteAvatar($staff_id);

            if ($success) {
                // 200 OK
                return $this->ok(null, 'delete', 'avatar');
            }

            // Fail
            return $this->unprocessable('Failed to delete avatar.');
        });
    }

    public function delete($id)
    {
        $this->safe(function () use ($id) {
            $sid = (int)$id;

            if ($sid <= 0) {
                return $this->unprocessable('Missing or invalid id.', [
                    'id' => 'Required and must be greater than zero.'
                ]);
            }

            $staff = $this->staff_model->get($sid);
            if (empty($staff)) {
                return $this->notFound('Staff member not found.');
            }

            if ((int)$staff->staffid === 1) {
                return $this->unprocessable('You cannot delete the main administrator.', [
                    'staff' => 'Main administrator cannot be deleted.'
                ]);
            }

            if ((int)$staff->admin === 1) {
                return $this->unprocessable('You cannot delete administrators.', [
                    'admin' => 'Administrators cannot be deleted.'
                ]);
            }

            $isAdmin = function_exists('is_admin') ? is_admin() : false;

            if (!$isAdmin) {
                return $this->forbidden('You do not have permission to delete staff members.');
            }

            $success = $this->staff_model->delete($sid);

            if ($success) {
                return $this->ok([], 'delete', 'staff_member');
            }

            return $this->unprocessable('Failed to delete staff member.', [
                'delete' => 'Could not delete staff member.'
            ]);
        });
    }       
    
    /* When staff change his password */
    public function change_password($id) 
	{
        $this->safe(function () use ($id) {
            $sid = (int) $id;

            if ($sid <= 0) {
                return $this->unprocessable('Missing or invalid id.', ['id' => 'Required and must be greater than zero.']);
            }

            // Permission: user can change only his own password unless admin
            $currentId = function_exists('get_staff_user_id') ? (int) get_staff_user_id() : 0;
            $isAdmin   = function_exists('is_admin') ? is_admin() : false;
            $isSelf    = ($sid === $currentId);     
            
            if (!$isAdmin && !$isSelf) {
                return $this->forbidden('You cannot change other users’ passwords.');
            }

            // Load payload (expects JSON body)
            $formdata = $this->readJson();

            $currentPassword 	= (string) ($formdata['currentPassword'] ?? '');
            $newPassword        = (string) ($formdata['password'] ?? '');            

            // Basic validation
            $errors = [];
            if ($newPassword === '') {
                $errors['password'] = 'Required.';
            }    

            if ($isSelf && $currentPassword === '') {
                $errors['currentPassword'] = 'Required.';
            }

            // Optional: add policy checks (length/complexity)
            // if (strlen($newPassword) < 8) { $errors['password'] = 'Must be at least 8 characters.'; }

            if (!empty($errors)) {
                return $this->unprocessable('Failed to create profile.', $errors);
            }

            $user = $this->staff_model->get($sid);
            if (!$user) {
                return $this->notFound('Staff member not found.');
            }      
            
            if ($isSelf) {
                $isCurrentPasswordValid = app_hasher()->CheckPassword($currentPassword, $user->password);

                if (!$isCurrentPasswordValid) {
                    return $this->unprocessable('Current password is incorrect.', [
                        'currentPassword' => _l('staff_old_password_incorrect')
                    ]);
                }   
            }

            // Change password in model
            $success = $this->staff_model->change_password($sid, $newPassword);            

            if ($success) {
                hooks()->do_action('staff_password_changed', $sid);

                return $this->ok([], 'update', 'staff_password'); 
            }   
            
            return $this->unprocessable('Failed to update password.', ['change' => _l('staff_problem_changing_password') ?: 'Could not change password.']);
        });        
    } 

    public function get_staff_permissions($id = '') {
        $staff          = $this->staff_model->get($id);

        $permissionsData = [ 'funcData' => ['staff_id' => isset($staff) ? $staff->staffid : null ] ];
        if (isset($staff)) {
            $permissionsData['staff'] = $staff;
        }
        if (isset($staff)) {
            $is_admin = is_admin($staff->staffid);
        }

        $builtReport = array();
        $capability_obj = array();
        $permission_obj = array();

        foreach (get_available_staff_permissions($permissionsData) as $feature => $permission) {
            $permissions = array(
                'name' => $permission['name'] ?? '',
                //'before' => isset($permission['before']) ? $permission['before'] : '',                   
            );

            $builtReport[] = $permissions;

            foreach ($permission['capabilities'] as $capability => $name) {
                $help = '';
                $checked  = '';
                $disabled = '';
                    
                if (
                    (isset($is_admin) && $is_admin) || 
                    (is_array($name) && isset($name['not_applicable']) && $name['not_applicable']) || 
                    (
                        ($capability == 'view_own' || $capability == 'view' && array_key_exists('view_own', $permission['capabilities']) && array_key_exists('view', $permission['capabilities'])) && 
                        ((isset($staff) && staff_can(($capability == 'view' ? 'view_own' : 'view'), $feature, $staff->staffid)) || 
                        (isset($role) && has_role_permission($role->roleid, ($capability == 'view' ? 'view_own' : 'view'), $feature)))
                    )
                ) {
                    $disabled = ' disabled ';
                } elseif (
                        (isset($staff) && staff_can($capability, $feature, $staff->staffid)) ||
                        isset($role) && has_role_permission($role->roleid, $capability, $feature)
                    ) {
                    $checked = ' checked ';
                }


                if (isset($permission['help']) && array_key_exists($capability, $permission['help'])) {
                    $help = $permission['help'][$capability];
                }

                $capabilities = array(
                    'label' => !is_array($name) ? $name : $name['name'],
                    'help' => $help,
                    'capability' => $capability,
                    'disabled' => $disabled,
                    'checked' => $checked,
                    'feature' => $feature
                );

                $builtReport[] = $capabilities;
            }
        }

        $response = $builtReport;

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));              
    }

    public function get_roles()
    {

        $response = $this->roles_model->get();

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));   
    }       

    /* Get role permission for specific role id */
    public function role_changed($id)
    {

        $response = $this->roles_model->get($id)->permissions;

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($response));   
    }    
}