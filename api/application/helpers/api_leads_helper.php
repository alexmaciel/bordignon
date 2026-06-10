<?php
defined('BASEPATH') or exit('No direct script access allowed');

hooks()->add_action('api_admin_head', 'leads_api_admin_head_data');

/**
 * Get leads summary
 * @return array
 */
function get_leads_summary()
{
    $CI = &get_instance();
    if (!class_exists('leads_model')) {
        $CI->load->model('leads_model');
    }
    $statuses = $CI->leads_model->get_status();

    $totalStatuses         = count($statuses);
    //$has_permission_view   = has_permission('leads', '', 'view');
    $sql                   = '';    
    //$whereNoViewPermission = '(addedfrom = ' . get_staff_user_id() . ' OR assigned=' . get_staff_user_id() . ' OR is_public = 1)';

    $statuses[] = [
        'lost'  => true,
        'name'  => _l('lost_leads'),
        'color' => '#fc2d42',
    ];    

    /*    
    $statuses[] = [
        'junk'  => true,
        'name'  => _l('junk_leads'),
        'color' => '',
    ];
    */

    foreach ($statuses as $status) {
        $sql .= ' SELECT COUNT(*) as total';
        $sql .= ',SUM(lead_value) as value';
        $sql .= ' FROM ' . db_prefix() . 'leads';

        if (isset($status['lost'])) {
            $sql .= ' WHERE lost=1';
        } elseif (isset($status['junk'])) {
            $sql .= ' WHERE junk=1';
        } else {
            $sql .= ' WHERE status=' . $status['id'];
        }
        /*
        if (!$has_permission_view) {
            $sql .= ' AND ' . $whereNoViewPermission;
        }
        */
        $sql .= ' UNION ALL ';
        $sql = trim($sql);
    }

    $result = [];   
    
    // Remove the last UNION ALL
    $sql    = substr($sql, 0, -10);
    $result = $CI->db->query($sql)->result();

    /*
    if (!$has_permission_view) {
        $CI->db->where($whereNoViewPermission);
    }
    */

    $total_leads = $CI->db->count_all_results(db_prefix() . 'leads');

    foreach ($statuses as $key => $status) {
        if (isset($status['lost']) || isset($status['junk'])) {
            $statuses[$key]['percent'] = ($total_leads > 0 ? number_format(($result[$key]->total * 100) / $total_leads, 2) : 0);
        }

        $statuses[$key]['total'] = $result[$key]->total;
        $statuses[$key]['value'] = $result[$key]->value;
    }

    return $statuses;    
}