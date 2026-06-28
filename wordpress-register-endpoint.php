<?php
/**
 * Add this code to your existing custom WordPress plugin
 * (the same file that has the custom-api/v1/login endpoint)
 */

add_action('rest_api_init', function () {
    register_rest_route('custom-api/v1', '/register', array(
        'methods'             => 'POST',
        'callback'            => 'custom_api_register_user',
        'permission_callback' => '__return_true',
    ));
});

function custom_api_register_user(WP_REST_Request $request) {
    $params     = $request->get_json_params();
    $username   = sanitize_user($params['username'] ?? '');
    $email      = sanitize_email($params['email'] ?? '');
    $password   = $params['password'] ?? '';
    $first_name = sanitize_text_field($params['first_name'] ?? '');
    $last_name  = sanitize_text_field($params['last_name'] ?? '');

    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Username, email and password are required.', array('status' => 400));
    }
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Please enter a valid email address.', array('status' => 400));
    }
    if (strlen($password) < 6) {
        return new WP_Error('weak_password', 'Password must be at least 6 characters.', array('status' => 400));
    }
    if (username_exists($username)) {
        return new WP_Error('username_exists', 'This username is already taken. Please choose another.', array('status' => 409));
    }
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'An account with this email already exists. Please login instead.', array('status' => 409));
    }

    // Create WordPress user
    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }

    // Set name + WooCommerce customer role
    wp_update_user(array(
        'ID'         => $user_id,
        'first_name' => $first_name,
        'last_name'  => $last_name,
        'role'       => 'customer',
    ));

    // Set WooCommerce billing meta
    update_user_meta($user_id, 'billing_first_name', $first_name);
    update_user_meta($user_id, 'billing_last_name',  $last_name);
    update_user_meta($user_id, 'billing_email',      $email);

    return array(
        'success' => true,
        'data'    => array(
            'id'         => $user_id,
            'username'   => $username,
            'email'      => $email,
            'first_name' => $first_name,
            'last_name'  => $last_name,
        ),
    );
}
