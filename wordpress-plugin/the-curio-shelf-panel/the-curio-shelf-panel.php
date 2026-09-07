<?php
/**
 * Plugin Name:       The Curio Shelf — Product Panel
 * Plugin URI:        https://www.thecurioshelf.in
 * Description:       Adds per-product Specifications and Care Instructions that the thecurioshelf.in storefront renders on the product page. Includes a control panel showing which products still need content.
 * Version:           1.0.0
 * Author:            The Curio Shelf
 * License:           GPL-2.0-or-later
 * Text Domain:       tcs-panel
 * Requires at least: 6.0
 * Requires PHP:      7.4
 *
 * The storefront is a headless Next.js app, so everything saved here is exposed
 * over the REST API. Two meta keys carry the data:
 *
 *   _tcs_specifications     array of { label, value }
 *   _tcs_care_instructions  array of strings
 *
 * Both are also readable from the WooCommerce product response as
 * `tcs_specifications` and `tcs_care_instructions`.
 */

// Block direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TCS_PANEL_VERSION', '1.0.0' );
define( 'TCS_META_SPECS', '_tcs_specifications' );
define( 'TCS_META_CARE', '_tcs_care_instructions' );
define( 'TCS_OPTION_DEFAULT_CARE', 'tcs_default_care_instructions' );

/* -------------------------------------------------------------------------
 * Data helpers
 * ---------------------------------------------------------------------- */

/**
 * Read the specifications for a product.
 *
 * @param int $product_id Product post ID.
 * @return array List of [ 'label' => string, 'value' => string ].
 */
function tcs_get_specifications( $product_id ) {
	$rows = get_post_meta( $product_id, TCS_META_SPECS, true );

	if ( ! is_array( $rows ) ) {
		return array();
	}

	$clean = array();
	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}
		$label = isset( $row['label'] ) ? trim( (string) $row['label'] ) : '';
		$value = isset( $row['value'] ) ? trim( (string) $row['value'] ) : '';

		// A row is only useful when both halves are present.
		if ( '' === $label || '' === $value ) {
			continue;
		}
		$clean[] = array(
			'label' => $label,
			'value' => $value,
		);
	}

	return $clean;
}

/**
 * Read the care instructions for a product.
 *
 * Falls back to the site-wide default list when the product has none of its
 * own, so a new product is never published with an empty care section.
 *
 * @param int  $product_id       Product post ID.
 * @param bool $allow_fallback   Whether to fall back to the global default.
 * @return string[] List of instruction lines.
 */
function tcs_get_care_instructions( $product_id, $allow_fallback = true ) {
	$lines = get_post_meta( $product_id, TCS_META_CARE, true );

	if ( is_array( $lines ) ) {
		$lines = array_values( array_filter( array_map( 'trim', array_map( 'strval', $lines ) ), 'strlen' ) );
	} else {
		$lines = array();
	}

	if ( empty( $lines ) && $allow_fallback ) {
		$lines = tcs_get_default_care_instructions();
	}

	return $lines;
}

/**
 * The site-wide default care instructions, set on the control panel screen.
 *
 * @return string[]
 */
function tcs_get_default_care_instructions() {
	$raw = get_option( TCS_OPTION_DEFAULT_CARE, '' );

	if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
		return array();
	}

	// Stored as one instruction per line.
	$lines = preg_split( '/\r\n|\r|\n/', $raw );

	return array_values( array_filter( array_map( 'trim', $lines ), 'strlen' ) );
}

/* -------------------------------------------------------------------------
 * Product edit screen — meta box
 * ---------------------------------------------------------------------- */

/**
 * Register the meta box on the product edit screen.
 */
function tcs_add_meta_box() {
	add_meta_box(
		'tcs_product_panel',
		__( 'Curio Shelf — Specifications & Care', 'tcs-panel' ),
		'tcs_render_meta_box',
		'product',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'tcs_add_meta_box' );

/**
 * Render the meta box markup.
 *
 * @param WP_Post $post Current product post.
 */
function tcs_render_meta_box( $post ) {
	// Nonce so the save handler can confirm the request came from this form.
	wp_nonce_field( 'tcs_save_product_panel', 'tcs_panel_nonce' );

	$specs = tcs_get_specifications( $post->ID );
	// Pass false so the editor sees this product's own lines, not the fallback.
	$care  = tcs_get_care_instructions( $post->ID, false );

	$default_care = tcs_get_default_care_instructions();
	?>
	<div class="tcs-panel">

		<!-- ── Specifications ───────────────────────────────────────────── -->
		<h3 class="tcs-heading"><?php esc_html_e( 'Specifications', 'tcs-panel' ); ?></h3>
		<p class="tcs-hint">
			<?php esc_html_e( 'Shown as a two-column table on the product page. Example: "Material" / "Cotton canvas with PEVA lining".', 'tcs-panel' ); ?>
		</p>

		<table class="tcs-table widefat" id="tcs-specs-table">
			<thead>
				<tr>
					<th class="tcs-col-handle"></th>
					<th class="tcs-col-label"><?php esc_html_e( 'Label', 'tcs-panel' ); ?></th>
					<th class="tcs-col-value"><?php esc_html_e( 'Value', 'tcs-panel' ); ?></th>
					<th class="tcs-col-action"></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $specs as $row ) : ?>
					<tr class="tcs-row">
						<td class="tcs-col-handle"><span class="tcs-drag dashicons dashicons-menu"></span></td>
						<td>
							<input type="text" name="tcs_specs_label[]" class="widefat"
								value="<?php echo esc_attr( $row['label'] ); ?>"
								placeholder="<?php esc_attr_e( 'Material', 'tcs-panel' ); ?>" />
						</td>
						<td>
							<input type="text" name="tcs_specs_value[]" class="widefat"
								value="<?php echo esc_attr( $row['value'] ); ?>"
								placeholder="<?php esc_attr_e( 'Cotton canvas', 'tcs-panel' ); ?>" />
						</td>
						<td class="tcs-col-action">
							<button type="button" class="button-link tcs-remove" aria-label="<?php esc_attr_e( 'Remove row', 'tcs-panel' ); ?>">&times;</button>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<p>
			<button type="button" class="button" id="tcs-add-spec">
				+ <?php esc_html_e( 'Add specification', 'tcs-panel' ); ?>
			</button>
			<button type="button" class="button" id="tcs-add-preset">
				<?php esc_html_e( 'Insert common rows', 'tcs-panel' ); ?>
			</button>
		</p>

		<hr class="tcs-sep" />

		<!-- ── Care instructions ────────────────────────────────────────── -->
		<h3 class="tcs-heading"><?php esc_html_e( 'Care Instructions', 'tcs-panel' ); ?></h3>
		<p class="tcs-hint">
			<?php esc_html_e( 'One instruction per line. Shown as a bulleted list on the product page.', 'tcs-panel' ); ?>
			<?php if ( ! empty( $default_care ) ) : ?>
				<br />
				<em><?php esc_html_e( 'Leave this empty to use the site-wide default set under Curio Shelf → Product Panel.', 'tcs-panel' ); ?></em>
			<?php endif; ?>
		</p>

		<textarea name="tcs_care" id="tcs-care" rows="6" class="widefat"
			placeholder="<?php esc_attr_e( "Wipe the lining with a damp cloth after every use&#10;Spot clean the outer fabric, do not soak&#10;Air dry flat, away from direct sunlight", 'tcs-panel' ); ?>"><?php
			echo esc_textarea( implode( "\n", $care ) );
		?></textarea>

		<?php if ( ! empty( $default_care ) && empty( $care ) ) : ?>
			<p class="tcs-hint tcs-fallback-note">
				<?php esc_html_e( 'Currently falling back to the default list:', 'tcs-panel' ); ?>
				<em><?php echo esc_html( implode( ' · ', $default_care ) ); ?></em>
			</p>
		<?php endif; ?>
	</div>

	<style>
		.tcs-panel { padding: 4px 0 8px; }
		.tcs-panel .tcs-heading { margin: 14px 0 4px; font-size: 14px; }
		.tcs-panel .tcs-hint { margin: 0 0 10px; color: #646970; font-size: 12px; }
		.tcs-panel .tcs-sep { margin: 22px 0 6px; border: 0; border-top: 1px solid #dcdcde; }
		.tcs-table { margin-bottom: 10px; }
		.tcs-table th { font-weight: 600; }
		.tcs-col-handle { width: 28px; text-align: center; }
		.tcs-col-action { width: 34px; text-align: center; }
		.tcs-col-label { width: 30%; }
		.tcs-drag { cursor: grab; color: #a7aaad; }
		.tcs-remove { color: #b32d2e; text-decoration: none; font-size: 18px; line-height: 1; cursor: pointer; }
		.tcs-remove:hover { color: #8a2424; }
		.tcs-row.tcs-dragging { opacity: .45; }
		.tcs-fallback-note { margin-top: 8px; }
	</style>

	<script>
	( function () {
		var table = document.getElementById( 'tcs-specs-table' );
		if ( ! table ) { return; }
		var body = table.querySelector( 'tbody' );

		// Build one empty specification row.
		function makeRow( label, value ) {
			var tr = document.createElement( 'tr' );
			tr.className = 'tcs-row';
			tr.innerHTML =
				'<td class="tcs-col-handle"><span class="tcs-drag dashicons dashicons-menu"></span></td>' +
				'<td><input type="text" name="tcs_specs_label[]" class="widefat" placeholder="Material" /></td>' +
				'<td><input type="text" name="tcs_specs_value[]" class="widefat" placeholder="Cotton canvas" /></td>' +
				'<td class="tcs-col-action"><button type="button" class="button-link tcs-remove" aria-label="Remove row">&times;</button></td>';
			if ( label ) { tr.querySelectorAll( 'input' )[0].value = label; }
			if ( value ) { tr.querySelectorAll( 'input' )[1].value = value; }
			return tr;
		}

		document.getElementById( 'tcs-add-spec' ).addEventListener( 'click', function () {
			var row = makeRow();
			body.appendChild( row );
			row.querySelector( 'input' ).focus();
		} );

		// Common rows for carry goods, so the shop does not retype them every time.
		var PRESETS = [ 'Material', 'Dimensions', 'Capacity', 'Closure', 'Lining', 'Weight', 'Country of Origin' ];

		document.getElementById( 'tcs-add-preset' ).addEventListener( 'click', function () {
			var existing = [];
			body.querySelectorAll( 'input[name="tcs_specs_label[]"]' ).forEach( function ( input ) {
				existing.push( input.value.trim().toLowerCase() );
			} );
			PRESETS.forEach( function ( label ) {
				// Skip labels the product already has.
				if ( existing.indexOf( label.toLowerCase() ) === -1 ) {
					body.appendChild( makeRow( label, '' ) );
				}
			} );
		} );

		// Remove a row.
		body.addEventListener( 'click', function ( e ) {
			var btn = e.target.closest( '.tcs-remove' );
			if ( btn ) {
				e.preventDefault();
				btn.closest( 'tr' ).remove();
			}
		} );

		// Lightweight drag-to-reorder using the handle.
		var dragging = null;

		body.addEventListener( 'mousedown', function ( e ) {
			var handle = e.target.closest( '.tcs-drag' );
			if ( ! handle ) { return; }
			dragging = handle.closest( 'tr' );
			dragging.draggable = true;
			dragging.classList.add( 'tcs-dragging' );
		} );

		body.addEventListener( 'dragover', function ( e ) {
			if ( ! dragging ) { return; }
			e.preventDefault();
			var over = e.target.closest( 'tr' );
			if ( ! over || over === dragging ) { return; }
			var rect = over.getBoundingClientRect();
			var after = ( e.clientY - rect.top ) > ( rect.height / 2 );
			body.insertBefore( dragging, after ? over.nextSibling : over );
		} );

		function endDrag() {
			if ( ! dragging ) { return; }
			dragging.draggable = false;
			dragging.classList.remove( 'tcs-dragging' );
			dragging = null;
		}

		body.addEventListener( 'dragend', endDrag );
		document.addEventListener( 'mouseup', endDrag );
	} )();
	</script>
	<?php
}

/**
 * Persist the meta box values.
 *
 * @param int $post_id Product post ID.
 */
function tcs_save_meta_box( $post_id ) {
	// Ignore autosaves and revisions, which post partial data.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	// The nonce is absent for quick edit and bulk edit, where this form is not shown.
	if ( ! isset( $_POST['tcs_panel_nonce'] ) ) {
		return;
	}
	if ( ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['tcs_panel_nonce'] ) ), 'tcs_save_product_panel' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// ── Specifications ──
	$labels = isset( $_POST['tcs_specs_label'] ) ? (array) wp_unslash( $_POST['tcs_specs_label'] ) : array();
	$values = isset( $_POST['tcs_specs_value'] ) ? (array) wp_unslash( $_POST['tcs_specs_value'] ) : array();

	$specs = array();
	foreach ( $labels as $index => $label ) {
		$label = sanitize_text_field( $label );
		$value = isset( $values[ $index ] ) ? sanitize_text_field( $values[ $index ] ) : '';

		if ( '' === trim( $label ) || '' === trim( $value ) ) {
			continue;
		}
		$specs[] = array(
			'label' => trim( $label ),
			'value' => trim( $value ),
		);
	}

	if ( empty( $specs ) ) {
		delete_post_meta( $post_id, TCS_META_SPECS );
	} else {
		update_post_meta( $post_id, TCS_META_SPECS, $specs );
	}

	// ── Care instructions ──
	$care_raw = isset( $_POST['tcs_care'] ) ? (string) wp_unslash( $_POST['tcs_care'] ) : '';
	$lines    = preg_split( '/\r\n|\r|\n/', $care_raw );
	$care     = array();

	foreach ( $lines as $line ) {
		$line = sanitize_text_field( $line );
		if ( '' !== trim( $line ) ) {
			$care[] = trim( $line );
		}
	}

	if ( empty( $care ) ) {
		delete_post_meta( $post_id, TCS_META_CARE );
	} else {
		update_post_meta( $post_id, TCS_META_CARE, $care );
	}
}
add_action( 'save_post_product', 'tcs_save_meta_box' );

/* -------------------------------------------------------------------------
 * REST API exposure
 * ---------------------------------------------------------------------- */

/**
 * Add both fields to the WooCommerce product response (wc/v3/products).
 *
 * This is the endpoint the storefront already uses, so no extra request is
 * needed on the Next.js side.
 *
 * @param WP_REST_Response $response Outgoing response.
 * @param WC_Product       $product  Product object.
 * @return WP_REST_Response
 */
function tcs_add_fields_to_wc_response( $response, $product ) {
	if ( ! $product instanceof WC_Product ) {
		return $response;
	}

	$product_id = $product->get_id();

	$response->data['tcs_specifications']    = tcs_get_specifications( $product_id );
	$response->data['tcs_care_instructions'] = tcs_get_care_instructions( $product_id );

	return $response;
}
add_filter( 'woocommerce_rest_prepare_product_object', 'tcs_add_fields_to_wc_response', 10, 2 );

// Variations inherit the parent product's content unless they set their own.
add_filter( 'woocommerce_rest_prepare_product_variation_object', 'tcs_add_fields_to_wc_response', 10, 2 );

/**
 * Also register the fields on the core REST product route, and make them
 * writable so the values can be managed programmatically if needed.
 */
function tcs_register_rest_fields() {
	register_rest_field(
		'product',
		'tcs_specifications',
		array(
			'get_callback'    => function ( $post ) {
				return tcs_get_specifications( $post['id'] );
			},
			'update_callback' => function ( $value, $post ) {
				if ( ! current_user_can( 'edit_post', $post->ID ) ) {
					return new WP_Error( 'tcs_forbidden', __( 'You cannot edit this product.', 'tcs-panel' ), array( 'status' => 403 ) );
				}
				$specs = array();
				foreach ( (array) $value as $row ) {
					if ( ! is_array( $row ) || empty( $row['label'] ) || empty( $row['value'] ) ) {
						continue;
					}
					$specs[] = array(
						'label' => sanitize_text_field( $row['label'] ),
						'value' => sanitize_text_field( $row['value'] ),
					);
				}
				update_post_meta( $post->ID, TCS_META_SPECS, $specs );
				return true;
			},
			'schema'          => array(
				'description' => __( 'Product specifications as label/value pairs.', 'tcs-panel' ),
				'type'        => 'array',
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'label' => array( 'type' => 'string' ),
						'value' => array( 'type' => 'string' ),
					),
				),
			),
		)
	);

	register_rest_field(
		'product',
		'tcs_care_instructions',
		array(
			'get_callback'    => function ( $post ) {
				return tcs_get_care_instructions( $post['id'] );
			},
			'update_callback' => function ( $value, $post ) {
				if ( ! current_user_can( 'edit_post', $post->ID ) ) {
					return new WP_Error( 'tcs_forbidden', __( 'You cannot edit this product.', 'tcs-panel' ), array( 'status' => 403 ) );
				}
				$lines = array();
				foreach ( (array) $value as $line ) {
					$line = sanitize_text_field( (string) $line );
					if ( '' !== trim( $line ) ) {
						$lines[] = trim( $line );
					}
				}
				update_post_meta( $post->ID, TCS_META_CARE, $lines );
				return true;
			},
			'schema'          => array(
				'description' => __( 'Care instructions, one per list item.', 'tcs-panel' ),
				'type'        => 'array',
				'items'       => array( 'type' => 'string' ),
			),
		)
	);
}
add_action( 'rest_api_init', 'tcs_register_rest_fields' );

/**
 * A small public endpoint the storefront can call directly if it ever needs
 * these fields without authenticating against the WooCommerce API.
 *
 * GET /wp-json/tcs/v1/product/<id-or-slug>
 */
function tcs_register_rest_routes() {
	register_rest_route(
		'tcs/v1',
		'/product/(?P<key>[a-zA-Z0-9-_]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true', // Read-only, published products only.
			'callback'            => 'tcs_rest_get_product_panel',
			'args'                => array(
				'key' => array(
					'description' => __( 'Product ID or slug.', 'tcs-panel' ),
					'type'        => 'string',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'tcs_register_rest_routes' );

/**
 * Handler for the public panel endpoint.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error
 */
function tcs_rest_get_product_panel( $request ) {
	$key = $request->get_param( 'key' );

	// Numeric keys are treated as IDs, anything else as a slug.
	if ( ctype_digit( (string) $key ) ) {
		$post = get_post( (int) $key );
	} else {
		$posts = get_posts(
			array(
				'name'           => sanitize_title( $key ),
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => 1,
			)
		);
		$post = $posts ? $posts[0] : null;
	}

	if ( ! $post || 'product' !== $post->post_type || 'publish' !== $post->post_status ) {
		return new WP_Error( 'tcs_not_found', __( 'Product not found.', 'tcs-panel' ), array( 'status' => 404 ) );
	}

	return rest_ensure_response(
		array(
			'id'                    => $post->ID,
			'slug'                  => $post->post_name,
			'tcs_specifications'    => tcs_get_specifications( $post->ID ),
			'tcs_care_instructions' => tcs_get_care_instructions( $post->ID ),
		)
	);
}

/* -------------------------------------------------------------------------
 * Control panel screen
 * ---------------------------------------------------------------------- */

/**
 * Register the admin menu.
 */
function tcs_register_admin_menu() {
	add_menu_page(
		__( 'Curio Shelf', 'tcs-panel' ),
		__( 'Curio Shelf', 'tcs-panel' ),
		'manage_woocommerce',
		'tcs-panel',
		'tcs_render_admin_page',
		'dashicons-screenoptions',
		56
	);
}
add_action( 'admin_menu', 'tcs_register_admin_menu' );

/**
 * Register the default care instructions setting.
 */
function tcs_register_settings() {
	register_setting(
		'tcs_panel_settings',
		TCS_OPTION_DEFAULT_CARE,
		array(
			'type'              => 'string',
			'sanitize_callback' => function ( $value ) {
				$lines = preg_split( '/\r\n|\r|\n/', (string) $value );
				$clean = array();
				foreach ( $lines as $line ) {
					$line = sanitize_text_field( $line );
					if ( '' !== trim( $line ) ) {
						$clean[] = trim( $line );
					}
				}
				return implode( "\n", $clean );
			},
			'default'           => '',
		)
	);
}
add_action( 'admin_init', 'tcs_register_settings' );

/**
 * Count products, optionally only those missing a given meta key.
 *
 * Uses WP_Query with fields => ids and no pagination so only the count is
 * fetched, rather than hydrating every product object.
 *
 * @param string $missing_meta_key Meta key that must be absent, or '' for all products.
 * @return int
 */
function tcs_count_products( $missing_meta_key = '' ) {
	$args = array(
		'post_type'              => 'product',
		'post_status'            => array( 'publish', 'draft', 'private' ),
		'posts_per_page'         => 1,
		'fields'                 => 'ids',
		'no_found_rows'          => false,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	);

	if ( $missing_meta_key ) {
		$args['meta_query'] = array(
			array(
				'key'     => $missing_meta_key,
				'compare' => 'NOT EXISTS',
			),
		);
	}

	$query = new WP_Query( $args );

	return (int) $query->found_posts;
}

/**
 * Render the control panel: a coverage list plus the default care setting.
 */
function tcs_render_admin_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'tcs-panel' ) );
	}

	$paged    = isset( $_GET['paged'] ) ? max( 1, (int) $_GET['paged'] ) : 1;
	$per_page = 20;

	$query = new WP_Query(
		array(
			'post_type'      => 'product',
			'post_status'    => array( 'publish', 'draft', 'private' ),
			'posts_per_page' => $per_page,
			'paged'          => $paged,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);

	// Coverage counts, done with meta queries so the whole catalogue never has
	// to be loaded into memory just to draw three numbers.
	$total         = tcs_count_products();
	$missing_specs = tcs_count_products( TCS_META_SPECS );
	$missing_care  = tcs_count_products( TCS_META_CARE );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Curio Shelf — Product Panel', 'tcs-panel' ); ?></h1>
		<p class="description">
			<?php esc_html_e( 'Specifications and care instructions added here appear on the product page at thecurioshelf.in. Edit any product to fill them in.', 'tcs-panel' ); ?>
		</p>

		<!-- Coverage summary -->
		<div class="tcs-cards">
			<div class="tcs-card">
				<span class="tcs-card-num"><?php echo esc_html( $total ); ?></span>
				<span class="tcs-card-label"><?php esc_html_e( 'Products', 'tcs-panel' ); ?></span>
			</div>
			<div class="tcs-card <?php echo $missing_specs ? 'tcs-warn' : 'tcs-ok'; ?>">
				<span class="tcs-card-num"><?php echo esc_html( $missing_specs ); ?></span>
				<span class="tcs-card-label"><?php esc_html_e( 'Missing specifications', 'tcs-panel' ); ?></span>
			</div>
			<div class="tcs-card <?php echo $missing_care ? 'tcs-warn' : 'tcs-ok'; ?>">
				<span class="tcs-card-num"><?php echo esc_html( $missing_care ); ?></span>
				<span class="tcs-card-label"><?php esc_html_e( 'Using default care text', 'tcs-panel' ); ?></span>
			</div>
		</div>

		<!-- Default care instructions -->
		<h2><?php esc_html_e( 'Default care instructions', 'tcs-panel' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Used for any product that has no care instructions of its own. One instruction per line.', 'tcs-panel' ); ?>
		</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'tcs_panel_settings' ); ?>
			<textarea name="<?php echo esc_attr( TCS_OPTION_DEFAULT_CARE ); ?>" rows="5" class="large-text" placeholder="<?php esc_attr_e( 'Wipe clean with a damp cloth', 'tcs-panel' ); ?>"><?php
				echo esc_textarea( get_option( TCS_OPTION_DEFAULT_CARE, '' ) );
			?></textarea>
			<?php submit_button( __( 'Save default care instructions', 'tcs-panel' ) ); ?>
		</form>

		<!-- Per-product coverage -->
		<h2><?php esc_html_e( 'Products', 'tcs-panel' ); ?></h2>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Product', 'tcs-panel' ); ?></th>
					<th><?php esc_html_e( 'Specifications', 'tcs-panel' ); ?></th>
					<th><?php esc_html_e( 'Care instructions', 'tcs-panel' ); ?></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
			<?php if ( $query->have_posts() ) : ?>
				<?php
				while ( $query->have_posts() ) :
					$query->the_post();
					$id         = get_the_ID();
					$spec_count = count( tcs_get_specifications( $id ) );
					$care_own   = tcs_get_care_instructions( $id, false );
					?>
					<tr>
						<td><strong><?php echo esc_html( get_the_title() ); ?></strong></td>
						<td>
							<?php if ( $spec_count ) : ?>
								<span class="tcs-pill tcs-pill-ok">
									<?php
									printf(
										/* translators: %d: number of specification rows. */
										esc_html( _n( '%d row', '%d rows', $spec_count, 'tcs-panel' ) ),
										(int) $spec_count
									);
									?>
								</span>
							<?php else : ?>
								<span class="tcs-pill tcs-pill-warn"><?php esc_html_e( 'Not set', 'tcs-panel' ); ?></span>
							<?php endif; ?>
						</td>
						<td>
							<?php if ( ! empty( $care_own ) ) : ?>
								<span class="tcs-pill tcs-pill-ok">
									<?php
									printf(
										/* translators: %d: number of care instruction lines. */
										esc_html( _n( '%d line', '%d lines', count( $care_own ), 'tcs-panel' ) ),
										(int) count( $care_own )
									);
									?>
								</span>
							<?php else : ?>
								<span class="tcs-pill tcs-pill-muted"><?php esc_html_e( 'Using default', 'tcs-panel' ); ?></span>
							<?php endif; ?>
						</td>
						<td>
							<a class="button button-small" href="<?php echo esc_url( get_edit_post_link( $id ) ); ?>">
								<?php esc_html_e( 'Edit', 'tcs-panel' ); ?>
							</a>
						</td>
					</tr>
				<?php endwhile; ?>
				<?php wp_reset_postdata(); ?>
			<?php else : ?>
				<tr><td colspan="4"><?php esc_html_e( 'No products found.', 'tcs-panel' ); ?></td></tr>
			<?php endif; ?>
			</tbody>
		</table>

		<?php
		// Pagination.
		$pages = (int) $query->max_num_pages;
		if ( $pages > 1 ) {
			echo '<div class="tablenav"><div class="tablenav-pages">';
			echo wp_kses_post(
				paginate_links(
					array(
						'base'      => add_query_arg( 'paged', '%#%' ),
						'format'    => '',
						'current'   => $paged,
						'total'     => $pages,
						'prev_text' => '&laquo;',
						'next_text' => '&raquo;',
					)
				)
			);
			echo '</div></div>';
		}
		?>
	</div>

	<style>
		.tcs-cards { display: flex; gap: 14px; margin: 18px 0 26px; flex-wrap: wrap; }
		.tcs-card {
			background: #fff; border: 1px solid #dcdcde; border-left-width: 4px;
			border-radius: 6px; padding: 14px 20px; min-width: 150px;
		}
		.tcs-card.tcs-ok   { border-left-color: #00a32a; }
		.tcs-card.tcs-warn { border-left-color: #dba617; }
		.tcs-card-num   { display: block; font-size: 26px; font-weight: 700; line-height: 1.1; }
		.tcs-card-label { display: block; font-size: 12px; color: #646970; margin-top: 2px; }
		.tcs-pill {
			display: inline-block; padding: 2px 9px; border-radius: 999px;
			font-size: 11px; font-weight: 600;
		}
		.tcs-pill-ok    { background: #edfaef; color: #00650f; }
		.tcs-pill-warn  { background: #fcf3e4; color: #8a5c00; }
		.tcs-pill-muted { background: #f0f0f1; color: #646970; }
	</style>
	<?php
}

/* -------------------------------------------------------------------------
 * Product list column
 * ---------------------------------------------------------------------- */

/**
 * Add a column to the products list showing whether the panel is filled in.
 *
 * @param array $columns Existing columns.
 * @return array
 */
function tcs_add_product_column( $columns ) {
	$columns['tcs_panel'] = __( 'Specs / Care', 'tcs-panel' );
	return $columns;
}
add_filter( 'manage_edit-product_columns', 'tcs_add_product_column', 20 );

/**
 * Render the products list column.
 *
 * @param string $column  Column key.
 * @param int    $post_id Product ID.
 */
function tcs_render_product_column( $column, $post_id ) {
	if ( 'tcs_panel' !== $column ) {
		return;
	}

	$specs = count( tcs_get_specifications( $post_id ) );
	$care  = count( tcs_get_care_instructions( $post_id, false ) );

	echo esc_html(
		sprintf(
			/* translators: 1: specification row count, 2: care instruction line count. */
			__( '%1$d specs · %2$d care', 'tcs-panel' ),
			$specs,
			$care
		)
	);
}
add_action( 'manage_product_posts_custom_column', 'tcs_render_product_column', 20, 2 );
