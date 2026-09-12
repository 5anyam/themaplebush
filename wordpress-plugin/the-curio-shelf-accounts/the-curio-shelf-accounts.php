<?php
/**
 * Plugin Name:       The Curio Shelf — Customer Accounts
 * Plugin URI:        https://www.thecurioshelf.in
 * Description:       Token-authenticated REST endpoints for the headless storefront: register, login, profile, order history with a delivery timeline, and customer-initiated cancellation.
 * Version:           1.0.0
 * Author:            The Curio Shelf
 * License:           GPL-2.0-or-later
 * Text Domain:       tcs-accounts
 * Requires at least: 6.0
 * Requires PHP:      7.4
 *
 * Why this exists
 * ---------------
 * The storefront is a Next.js app. Before this plugin the dashboard read orders
 * straight from the browser using WooCommerce admin keys and a `customer=<id>`
 * filter, where the id came from a plain cookie — anyone could edit that cookie
 * and read someone else's orders.
 *
 * Every endpoint here derives the customer from a signed token instead, so a
 * caller can only ever reach their own data. The storefront keeps that token in
 * an httpOnly cookie and never exposes it to page scripts.
 *
 * Namespace: tcsauth/v1   (kept separate from the tcs/v1 product panel plugin
 * so the two can be installed and updated independently)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TCS_ACCOUNTS_VERSION', '1.0.0' );
define( 'TCS_AUTH_NS', 'tcsauth/v1' );
define( 'TCS_AUTH_SECRET_OPTION', 'tcs_auth_signing_secret' );

/** Tokens are valid for 14 days; the storefront refreshes on activity. */
define( 'TCS_AUTH_TTL', 14 * DAY_IN_SECONDS );

/** Statuses a customer is allowed to cancel out of, themselves. */
function tcs_auth_cancellable_statuses() {
	/**
	 * Filter which order statuses a customer may cancel.
	 *
	 * @param string[] $statuses WooCommerce status slugs, without the "wc-" prefix.
	 */
	return apply_filters( 'tcs_auth_cancellable_statuses', array( 'pending', 'on-hold', 'processing' ) );
}

/* =========================================================================
 * Signing secret
 * ====================================================================== */

/**
 * The HMAC key used to sign tokens. Created once, then reused.
 *
 * Stored in options rather than a constant so the plugin works on a shared host
 * with no wp-config access. Deleting the option logs everybody out.
 *
 * @return string
 */
function tcs_auth_secret() {
	$secret = get_option( TCS_AUTH_SECRET_OPTION );

	if ( ! is_string( $secret ) || strlen( $secret ) < 64 ) {
		$secret = wp_generate_password( 88, true, true );
		update_option( TCS_AUTH_SECRET_OPTION, $secret, false );
	}

	return $secret;
}

register_activation_hook( __FILE__, 'tcs_auth_secret' );

/* =========================================================================
 * Token issue / verify
 * ====================================================================== */

/** URL-safe base64 without padding, the same encoding JWT uses. */
function tcs_auth_b64( $data ) {
	return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
}

function tcs_auth_b64_decode( $data ) {
	return base64_decode( strtr( $data, '-_', '+/' ) . str_repeat( '=', ( 4 - strlen( $data ) % 4 ) % 4 ) );
}

/**
 * A short fingerprint of the user's current password hash.
 *
 * Embedding it in the token means a password change (or reset) silently
 * invalidates every token issued before it, which is what you want after an
 * account is compromised.
 *
 * @param WP_User $user User object.
 * @return string
 */
function tcs_auth_password_fingerprint( $user ) {
	return substr( hash_hmac( 'sha256', $user->user_pass, tcs_auth_secret() ), 0, 16 );
}

/**
 * Issue a signed token for a user.
 *
 * @param WP_User $user User to issue for.
 * @return array{token:string,expires:int}
 */
function tcs_auth_issue_token( $user ) {
	$now     = time();
	$expires = $now + TCS_AUTH_TTL;

	$payload = array(
		'uid' => (int) $user->ID,
		'iat' => $now,
		'exp' => $expires,
		'pwf' => tcs_auth_password_fingerprint( $user ),
	);

	$body      = tcs_auth_b64( wp_json_encode( $payload ) );
	$signature = tcs_auth_b64( hash_hmac( 'sha256', $body, tcs_auth_secret(), true ) );

	return array(
		'token'   => $body . '.' . $signature,
		'expires' => $expires,
	);
}

/**
 * Verify a token and return its user.
 *
 * @param string $token Raw token string.
 * @return WP_User|WP_Error
 */
function tcs_auth_user_from_token( $token ) {
	if ( ! is_string( $token ) || '' === $token || substr_count( $token, '.' ) !== 1 ) {
		return new WP_Error( 'tcs_bad_token', __( 'Your session is not valid. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	list( $body, $signature ) = explode( '.', $token, 2 );

	$expected = tcs_auth_b64( hash_hmac( 'sha256', $body, tcs_auth_secret(), true ) );

	// Constant-time compare so the signature can't be guessed byte by byte.
	if ( ! hash_equals( $expected, $signature ) ) {
		return new WP_Error( 'tcs_bad_token', __( 'Your session is not valid. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	$payload = json_decode( tcs_auth_b64_decode( $body ), true );

	if ( ! is_array( $payload ) || empty( $payload['uid'] ) || empty( $payload['exp'] ) ) {
		return new WP_Error( 'tcs_bad_token', __( 'Your session is not valid. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	if ( time() > (int) $payload['exp'] ) {
		return new WP_Error( 'tcs_token_expired', __( 'Your session has expired. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	$user = get_user_by( 'id', (int) $payload['uid'] );

	if ( ! $user ) {
		return new WP_Error( 'tcs_bad_token', __( 'Your session is not valid. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	// Password changed since the token was issued.
	if ( empty( $payload['pwf'] ) || ! hash_equals( tcs_auth_password_fingerprint( $user ), (string) $payload['pwf'] ) ) {
		return new WP_Error( 'tcs_token_stale', __( 'Your password changed. Please sign in again.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	return $user;
}

/**
 * Pull the bearer token off the request and resolve it to a user.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_User|WP_Error
 */
function tcs_auth_require_user( $request ) {
	$header = $request->get_header( 'authorization' );

	if ( ! $header ) {
		// Some hosts strip the Authorization header; accept an explicit fallback.
		$header = $request->get_header( 'x-tcs-token' );
		if ( $header ) {
			$header = 'Bearer ' . $header;
		}
	}

	if ( ! $header || stripos( $header, 'bearer ' ) !== 0 ) {
		return new WP_Error( 'tcs_no_token', __( 'Please sign in to continue.', 'tcs-accounts' ), array( 'status' => 401 ) );
	}

	return tcs_auth_user_from_token( trim( substr( $header, 7 ) ) );
}

/* =========================================================================
 * Brute-force throttling
 * ====================================================================== */

/**
 * Count failed sign-in attempts per IP and lock out after too many.
 *
 * Transient-backed, so it needs no table and expires on its own.
 *
 * @param string $key    Bucket key (IP or username).
 * @param bool   $record Whether to record a failure.
 * @return int Attempts in the current window.
 */
function tcs_auth_throttle( $key, $record = false ) {
	$transient = 'tcs_auth_fail_' . md5( $key );
	$count     = (int) get_transient( $transient );

	if ( $record ) {
		$count++;
		set_transient( $transient, $count, 15 * MINUTE_IN_SECONDS );
	}

	return $count;
}

function tcs_auth_clear_throttle( $key ) {
	delete_transient( 'tcs_auth_fail_' . md5( $key ) );
}

/** Best-effort client IP, used only for throttling. */
function tcs_auth_client_ip() {
	$candidates = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' );

	foreach ( $candidates as $key ) {
		if ( empty( $_SERVER[ $key ] ) ) {
			continue;
		}
		$value = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
		// X-Forwarded-For can be a list; the first entry is the client.
		$value = trim( explode( ',', $value )[0] );
		if ( filter_var( $value, FILTER_VALIDATE_IP ) ) {
			return $value;
		}
	}

	return 'unknown';
}

/* =========================================================================
 * Shared shapers
 * ====================================================================== */

/**
 * The public shape of a customer. Only ever built for the authenticated user.
 *
 * @param WP_User $user User.
 * @return array
 */
function tcs_auth_user_payload( $user ) {
	$billing = array();
	foreach ( array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone' ) as $field ) {
		$billing[ $field ] = (string) get_user_meta( $user->ID, 'billing_' . $field, true );
	}

	return array(
		'id'         => (int) $user->ID,
		'username'   => $user->user_login,
		'email'      => $user->user_email,
		'first_name' => (string) get_user_meta( $user->ID, 'first_name', true ),
		'last_name'  => (string) get_user_meta( $user->ID, 'last_name', true ),
		'billing'    => $billing,
	);
}

/**
 * Build a human-readable delivery timeline for an order.
 *
 * WooCommerce keeps a few dated milestones on the order itself, and everything
 * else worth showing lives in the customer-visible order notes. Merging the two
 * gives the shopper the same story the shop sees, in order.
 *
 * @param WC_Order $order Order.
 * @return array<int,array<string,string>>
 */
function tcs_auth_order_timeline( $order ) {
	$events = array();

	$created = $order->get_date_created();
	if ( $created ) {
		$events[] = array(
			'key'         => 'placed',
			'label'       => __( 'Order placed', 'tcs-accounts' ),
			'description' => sprintf(
				/* translators: %s: payment method title. */
				__( 'Paid via %s', 'tcs-accounts' ),
				$order->get_payment_method_title() ? $order->get_payment_method_title() : __( 'the selected method', 'tcs-accounts' )
			),
			'date'        => $created->date( DATE_ATOM ),
		);
	}

	$paid = $order->get_date_paid();
	if ( $paid ) {
		$events[] = array(
			'key'         => 'paid',
			'label'       => __( 'Payment confirmed', 'tcs-accounts' ),
			'description' => '',
			'date'        => $paid->date( DATE_ATOM ),
		);
	}

	// Customer-facing notes: the shop's own updates ("dispatched", tracking, …).
	$notes = wc_get_order_notes(
		array(
			'order_id' => $order->get_id(),
			'type'     => 'customer',
			'orderby'  => 'date_created',
			'order'    => 'ASC',
			'limit'    => 50,
		)
	);

	foreach ( $notes as $note ) {
		$events[] = array(
			'key'         => 'note',
			'label'       => __( 'Update', 'tcs-accounts' ),
			'description' => wp_strip_all_tags( $note->content ),
			'date'        => gmdate( DATE_ATOM, strtotime( $note->date_created ) ),
		);
	}

	$completed = $order->get_date_completed();
	if ( $completed ) {
		$events[] = array(
			'key'         => 'completed',
			'label'       => __( 'Delivered', 'tcs-accounts' ),
			'description' => '',
			'date'        => $completed->date( DATE_ATOM ),
		);
	}

	if ( $order->has_status( 'cancelled' ) ) {
		$modified = $order->get_date_modified();
		$events[]  = array(
			'key'         => 'cancelled',
			'label'       => __( 'Order cancelled', 'tcs-accounts' ),
			'description' => '',
			'date'        => $modified ? $modified->date( DATE_ATOM ) : '',
		);
	}

	if ( $order->has_status( 'refunded' ) ) {
		$modified = $order->get_date_modified();
		$events[]  = array(
			'key'         => 'refunded',
			'label'       => __( 'Refunded', 'tcs-accounts' ),
			'description' => '',
			'date'        => $modified ? $modified->date( DATE_ATOM ) : '',
		);
	}

	// Chronological, oldest first.
	usort(
		$events,
		function ( $a, $b ) {
			return strcmp( $a['date'], $b['date'] );
		}
	);

	return $events;
}

/**
 * The public shape of an order.
 *
 * @param WC_Order $order Order.
 * @param bool     $full  Include line items and the timeline.
 * @return array
 */
function tcs_auth_order_payload( $order, $full = false ) {
	$data = array(
		'id'                 => $order->get_id(),
		'number'             => $order->get_order_number(),
		'status'             => $order->get_status(),
		'currency'           => $order->get_currency(),
		'total'              => $order->get_total(),
		'subtotal'           => wc_format_decimal( $order->get_subtotal(), 2 ),
		'shipping_total'     => $order->get_shipping_total(),
		'discount_total'     => $order->get_discount_total(),
		'payment_method'     => $order->get_payment_method(),
		'payment_method_title' => $order->get_payment_method_title(),
		'date_created'       => $order->get_date_created() ? $order->get_date_created()->date( DATE_ATOM ) : '',
		'date_modified'      => $order->get_date_modified() ? $order->get_date_modified()->date( DATE_ATOM ) : '',
		'item_count'         => $order->get_item_count(),
		'can_cancel'         => in_array( $order->get_status(), tcs_auth_cancellable_statuses(), true ),
	);

	$items = array();
	foreach ( $order->get_items() as $item ) {
		$product   = $item->get_product();
		$image_id  = $product ? $product->get_image_id() : 0;
		$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : '';

		$items[] = array(
			'id'       => $item->get_id(),
			'name'     => $item->get_name(),
			'quantity' => $item->get_quantity(),
			'total'    => wc_format_decimal( $item->get_total(), 2 ),
			'slug'     => $product ? $product->get_slug() : '',
			'image'    => $image_url ? $image_url : '',
		);
	}
	$data['line_items'] = $items;

	if ( $full ) {
		$data['billing']  = $order->get_address( 'billing' );
		$data['shipping'] = $order->get_address( 'shipping' );
		$data['timeline'] = tcs_auth_order_timeline( $order );
	}

	return $data;
}

/**
 * Load an order and confirm it belongs to the given user.
 *
 * The ownership check is the whole point of this plugin — never skip it.
 *
 * @param int     $order_id Order ID.
 * @param WP_User $user     Authenticated user.
 * @return WC_Order|WP_Error
 */
function tcs_auth_get_own_order( $order_id, $user ) {
	$order = wc_get_order( $order_id );

	if ( ! $order ) {
		return new WP_Error( 'tcs_order_not_found', __( 'Order not found.', 'tcs-accounts' ), array( 'status' => 404 ) );
	}

	if ( (int) $order->get_customer_id() !== (int) $user->ID ) {
		// Deliberately the same message and status as "not found" so this
		// cannot be used to probe which order ids exist.
		return new WP_Error( 'tcs_order_not_found', __( 'Order not found.', 'tcs-accounts' ), array( 'status' => 404 ) );
	}

	return $order;
}

/* =========================================================================
 * Routes
 * ====================================================================== */

add_action( 'rest_api_init', 'tcs_auth_register_routes' );

function tcs_auth_register_routes() {
	$public = '__return_true';

	register_rest_route( TCS_AUTH_NS, '/register', array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'tcs_auth_route_register',
		'permission_callback' => $public,
	) );

	register_rest_route( TCS_AUTH_NS, '/login', array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'tcs_auth_route_login',
		'permission_callback' => $public,
	) );

	register_rest_route( TCS_AUTH_NS, '/forgot-password', array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'tcs_auth_route_forgot_password',
		'permission_callback' => $public,
	) );

	register_rest_route( TCS_AUTH_NS, '/me', array(
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'tcs_auth_route_me',
			'permission_callback' => $public, // Token is checked inside.
		),
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'tcs_auth_route_update_me',
			'permission_callback' => $public,
		),
	) );

	register_rest_route( TCS_AUTH_NS, '/orders', array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'tcs_auth_route_orders',
		'permission_callback' => $public,
		'args'                => array(
			'page'     => array( 'type' => 'integer', 'default' => 1 ),
			'per_page' => array( 'type' => 'integer', 'default' => 20 ),
		),
	) );

	register_rest_route( TCS_AUTH_NS, '/orders/(?P<id>\d+)', array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'tcs_auth_route_order',
		'permission_callback' => $public,
	) );

	register_rest_route( TCS_AUTH_NS, '/orders/(?P<id>\d+)/cancel', array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'tcs_auth_route_cancel_order',
		'permission_callback' => $public,
	) );

	register_rest_route( TCS_AUTH_NS, '/link-orders', array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'tcs_auth_route_link_orders',
		'permission_callback' => $public,
	) );
}

/* ── Register ─────────────────────────────────────────────────────────── */

function tcs_auth_route_register( WP_REST_Request $request ) {
	$params = $request->get_json_params();

	$email      = sanitize_email( $params['email'] ?? '' );
	$password   = (string) ( $params['password'] ?? '' );
	$first_name = sanitize_text_field( $params['first_name'] ?? '' );
	$last_name  = sanitize_text_field( $params['last_name'] ?? '' );
	$phone      = sanitize_text_field( $params['phone'] ?? '' );

	// The username is optional — most shoppers only want to give an email.
	$username = sanitize_user( $params['username'] ?? '', true );
	if ( '' === $username ) {
		$username = sanitize_user( current( explode( '@', $email ) ), true );
	}

	if ( '' === $email || '' === $password ) {
		return new WP_Error( 'tcs_missing_fields', __( 'Email and password are required.', 'tcs-accounts' ), array( 'status' => 400 ) );
	}

	if ( ! is_email( $email ) ) {
		return new WP_Error( 'tcs_invalid_email', __( 'Please enter a valid email address.', 'tcs-accounts' ), array( 'status' => 400 ) );
	}

	if ( strlen( $password ) < 8 ) {
		return new WP_Error( 'tcs_weak_password', __( 'Password must be at least 8 characters.', 'tcs-accounts' ), array( 'status' => 400 ) );
	}

	if ( email_exists( $email ) ) {
		return new WP_Error( 'tcs_email_exists', __( 'An account with this email already exists. Please sign in instead.', 'tcs-accounts' ), array( 'status' => 409 ) );
	}

	// Make the derived username unique rather than failing on a collision.
	$base  = $username;
	$tries = 0;
	while ( username_exists( $username ) && $tries < 50 ) {
		$tries++;
		$username = $base . $tries;
	}

	$user_id = wp_create_user( $username, $password, $email );

	if ( is_wp_error( $user_id ) ) {
		return new WP_Error( 'tcs_registration_failed', $user_id->get_error_message(), array( 'status' => 500 ) );
	}

	wp_update_user( array(
		'ID'           => $user_id,
		'first_name'   => $first_name,
		'last_name'    => $last_name,
		'display_name' => trim( $first_name . ' ' . $last_name ) ?: $username,
		'role'         => 'customer',
	) );

	update_user_meta( $user_id, 'billing_first_name', $first_name );
	update_user_meta( $user_id, 'billing_last_name', $last_name );
	update_user_meta( $user_id, 'billing_email', $email );
	if ( $phone ) {
		update_user_meta( $user_id, 'billing_phone', $phone );
	}

	$user = get_user_by( 'id', $user_id );

	// Claim any guest orders already placed with this email.
	$linked = tcs_auth_link_orders_for_user( $user );

	$token = tcs_auth_issue_token( $user );

	return rest_ensure_response( array(
		'token'         => $token['token'],
		'expires'       => $token['expires'],
		'user'          => tcs_auth_user_payload( $user ),
		'linked_orders' => $linked,
	) );
}

/* ── Login ────────────────────────────────────────────────────────────── */

function tcs_auth_route_login( WP_REST_Request $request ) {
	$params   = $request->get_json_params();
	$identity = trim( (string) ( $params['username'] ?? $params['email'] ?? '' ) );
	$password = (string) ( $params['password'] ?? '' );

	if ( '' === $identity || '' === $password ) {
		return new WP_Error( 'tcs_missing_fields', __( 'Please enter your email and password.', 'tcs-accounts' ), array( 'status' => 400 ) );
	}

	$ip = tcs_auth_client_ip();

	if ( tcs_auth_throttle( 'ip_' . $ip ) >= 10 ) {
		return new WP_Error(
			'tcs_too_many_attempts',
			__( 'Too many sign-in attempts. Please wait 15 minutes and try again.', 'tcs-accounts' ),
			array( 'status' => 429 )
		);
	}

	// wp_authenticate takes a username; resolve an email to one first.
	$login = $identity;
	if ( is_email( $identity ) ) {
		$by_email = get_user_by( 'email', $identity );
		if ( $by_email ) {
			$login = $by_email->user_login;
		}
	}

	// wp_authenticate runs the normal WordPress auth stack, so security plugins
	// and password policies still apply to storefront sign-ins.
	$user = wp_authenticate( $login, $password );

	if ( is_wp_error( $user ) ) {
		tcs_auth_throttle( 'ip_' . $ip, true );

		// One message for every failure mode, so the endpoint can't be used to
		// discover which email addresses have accounts.
		return new WP_Error(
			'tcs_invalid_credentials',
			__( 'Incorrect email or password.', 'tcs-accounts' ),
			array( 'status' => 401 )
		);
	}

	tcs_auth_clear_throttle( 'ip_' . $ip );

	$token = tcs_auth_issue_token( $user );

	return rest_ensure_response( array(
		'token'   => $token['token'],
		'expires' => $token['expires'],
		'user'    => tcs_auth_user_payload( $user ),
	) );
}

/* ── Forgot password ──────────────────────────────────────────────────── */

/**
 * Send WordPress's own password-reset email.
 *
 * The reply is always the same whether or not the address has an account, so
 * this cannot be used to find out who shops here. The link in the email opens
 * the WordPress reset form, which works fine alongside a headless storefront.
 */
function tcs_auth_route_forgot_password( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	$email  = sanitize_email( $params['email'] ?? '' );

	$generic = rest_ensure_response( array(
		'sent'    => true,
		'message' => __( 'If that email has an account, a reset link is on its way.', 'tcs-accounts' ),
	) );

	if ( '' === $email || ! is_email( $email ) ) {
		return $generic;
	}

	$ip = tcs_auth_client_ip();
	if ( tcs_auth_throttle( 'reset_' . $ip ) >= 5 ) {
		return new WP_Error(
			'tcs_too_many_attempts',
			__( 'Too many reset requests. Please wait 15 minutes and try again.', 'tcs-accounts' ),
			array( 'status' => 429 )
		);
	}
	tcs_auth_throttle( 'reset_' . $ip, true );

	$user = get_user_by( 'email', $email );
	if ( $user ) {
		// retrieve_password() handles key generation and the email itself.
		retrieve_password( $user->user_login );
	}

	return $generic;
}

/* ── Me ───────────────────────────────────────────────────────────────── */

function tcs_auth_route_me( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	return rest_ensure_response( array( 'user' => tcs_auth_user_payload( $user ) ) );
}

function tcs_auth_route_update_me( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$params = $request->get_json_params();

	$first_name = sanitize_text_field( $params['first_name'] ?? '' );
	$last_name  = sanitize_text_field( $params['last_name'] ?? '' );

	if ( '' !== $first_name || '' !== $last_name ) {
		wp_update_user( array(
			'ID'           => $user->ID,
			'first_name'   => $first_name,
			'last_name'    => $last_name,
			'display_name' => trim( $first_name . ' ' . $last_name ) ?: $user->user_login,
		) );
		update_user_meta( $user->ID, 'billing_first_name', $first_name );
		update_user_meta( $user->ID, 'billing_last_name', $last_name );
	}

	// Billing address fields. The account email is deliberately not editable
	// here — changing it would move which guest orders the account can claim.
	$billing_fields = array( 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone' );

	foreach ( $billing_fields as $field ) {
		if ( array_key_exists( $field, (array) $params ) ) {
			update_user_meta( $user->ID, 'billing_' . $field, sanitize_text_field( $params[ $field ] ) );
		}
	}

	$user = get_user_by( 'id', $user->ID );

	return rest_ensure_response( array( 'user' => tcs_auth_user_payload( $user ) ) );
}

/* ── Orders ───────────────────────────────────────────────────────────── */

function tcs_auth_route_orders( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$per_page = min( 50, max( 1, (int) $request->get_param( 'per_page' ) ) );
	$page     = max( 1, (int) $request->get_param( 'page' ) );

	$query = wc_get_orders( array(
		'customer_id' => $user->ID, // Scoped to the token's user, never a parameter.
		'limit'       => $per_page,
		'paged'       => $page,
		'orderby'     => 'date',
		'order'       => 'DESC',
		'paginate'    => true,
	) );

	$orders = array();
	foreach ( $query->orders as $order ) {
		$orders[] = tcs_auth_order_payload( $order );
	}

	return rest_ensure_response( array(
		'orders'   => $orders,
		'total'    => (int) $query->total,
		'pages'    => (int) $query->max_num_pages,
		'page'     => $page,
	) );
}

function tcs_auth_route_order( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$order = tcs_auth_get_own_order( (int) $request->get_param( 'id' ), $user );
	if ( is_wp_error( $order ) ) {
		return $order;
	}

	return rest_ensure_response( array( 'order' => tcs_auth_order_payload( $order, true ) ) );
}

function tcs_auth_route_cancel_order( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$order = tcs_auth_get_own_order( (int) $request->get_param( 'id' ), $user );
	if ( is_wp_error( $order ) ) {
		return $order;
	}

	if ( ! in_array( $order->get_status(), tcs_auth_cancellable_statuses(), true ) ) {
		return new WP_Error(
			'tcs_not_cancellable',
			__( 'This order can no longer be cancelled. Please contact support.', 'tcs-accounts' ),
			array( 'status' => 409 )
		);
	}

	$params = $request->get_json_params();
	$reason = sanitize_textarea_field( $params['reason'] ?? '' );

	$note = $reason
		? sprintf(
			/* translators: %s: the reason the customer gave. */
			__( 'Cancelled by the customer from their account. Reason: %s', 'tcs-accounts' ),
			$reason
		)
		: __( 'Cancelled by the customer from their account.', 'tcs-accounts' );

	$order->update_status( 'cancelled', $note );

	/**
	 * Fires after a customer cancels their own order.
	 *
	 * @param WC_Order $order  The cancelled order.
	 * @param string   $reason Reason given, possibly empty.
	 */
	do_action( 'tcs_auth_order_cancelled', $order, $reason );

	return rest_ensure_response( array( 'order' => tcs_auth_order_payload( $order, true ) ) );
}

/* ── Linking guest orders ─────────────────────────────────────────────── */

/**
 * Attach guest orders placed with this account's email to the account.
 *
 * Matching on the billing email is safe here because the email belongs to the
 * account: WordPress will not let two accounts share one, and registration
 * requires access to nothing else. Orders already owned by someone are skipped.
 *
 * @param WP_User $user User to link to.
 * @return int Number of orders linked.
 */
function tcs_auth_link_orders_for_user( $user ) {
	$orders = wc_get_orders( array(
		'billing_email' => $user->user_email,
		'customer_id'   => 0, // Guest orders only.
		'limit'         => 100,
	) );

	$linked = 0;
	foreach ( $orders as $order ) {
		if ( (int) $order->get_customer_id() !== 0 ) {
			continue;
		}
		$order->set_customer_id( $user->ID );
		$order->save();
		$linked++;
	}

	return $linked;
}

function tcs_auth_route_link_orders( WP_REST_Request $request ) {
	$user = tcs_auth_require_user( $request );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	$linked = tcs_auth_link_orders_for_user( $user );

	return rest_ensure_response( array( 'linked' => $linked ) );
}

/* =========================================================================
 * Admin notice: WooCommerce is required
 * ====================================================================== */

add_action( 'admin_notices', 'tcs_auth_dependency_notice' );

function tcs_auth_dependency_notice() {
	if ( class_exists( 'WooCommerce' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p>';
	esc_html_e( 'The Curio Shelf — Customer Accounts needs WooCommerce to be active.', 'tcs-accounts' );
	echo '</p></div>';
}
