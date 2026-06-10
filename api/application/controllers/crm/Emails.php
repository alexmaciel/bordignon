<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Emails extends CRMController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('text');
        $this->load->model('emails_model');
    }

    // Send email - No templates used only simple string
    public function send_email()
    {
		//$formdata = json_decode(file_get_contents('php://input'), true);
		
        if($this->input->post()) { 

            $contact_emails     = $this->input->post('contact_emails'); 
            $from_email 	    = $this->input->post('from_email'); 
            $from_name 	        = $this->input->post('from_name'); 
            $subject 	        = $this->input->post('subject'); 
            $message 	        = $this->input->post('message'); 

            $data = array(
                'from_email' => $from_email,
                'from_name' => $from_name,
                'to_email' => $contact_emails,
                'message' => $message,
                'subject' => $subject,
            );

            $attachments = false;
            if (isset($_FILES['file']['name']) && $_FILES['file']['name'] != '') {
                $attachments = true;

                // Getting file extension
                $extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));   
                $allowed_extensions = explode(',', get_option('ticket_attachments_file_extensions'));
                $allowed_extensions = array_map('trim', $allowed_extensions);
                               
                $allowed_extensions = hooks()->apply_filters('ticket_attachments_file_extensions', $allowed_extensions);

                if (!in_array($extension, $allowed_extensions)) {
                    $attachments = false;
                } 

                $this->emails_model->add_attachment(array(
                    'attachment' => $_FILES['file']['tmp_name'],
                    'filename' => $_FILES['file']['name'],
                    'type' => $_FILES['file']['type'],
                    'read' => true
                )); 

                $attachments = true;
            } 

            $success = $this->emails_model->send_crm_contact($data);

            if ($attachments) {
                $response = array(
                    'type' => 'error',
                    'title' => 'Error!',                        
                    'message' => 'Extensão de arquivo não permitido. Extensões: ' . get_option('ticket_attachments_file_extensions')
                );                  
            } elseif ($success == true) {
                $response = array(
                    'type' => 'success',
                    'title' => 'Success!',   
                    'message' => _l('custom_file_success_send')
                );
            } else {
                $response = array(
                    'type' => 'warning',
                    'title' => 'Warning!', 
                    'message' => _l('custom_file_fail_send')
                );            
            }

            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($response));             
        }
    }    
    
}