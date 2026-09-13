<?php
/**
 * Plugin Name:       The Curio Shelf — Product Families
 * Plugin URI:        https://www.thecurioshelf.in
 * Description:       Group separate products into colour / size families. Every option is its own product with its own page, price, images and stock; the storefront links the family together with swatches.
 * Version:           1.0.1
 * Author:            The Curio Shelf
 * License:           GPL-2.0-or-later
 * Text Domain:       tcs-families
 * Requires at least: 6.0
 * Requires PHP:      7.4
 *
 * How it works
 * ------------
 * A "family" is a term in the private `tcs_family` taxonomy, managed under
 * Products → Product Families, much like categories. Each family defines its
 * options ("Colour", "Size"), the order their values appear in, and a swatch
 * colour for each colour value.
 *
 * Every product in the family says which values it is — e.g. Colour: Blue,
 * Size: M — from a box on its edit screen. On the storefront, clicking another
 * swatch opens that sibling product's own page.
 *
 * Compared with WooCommerce variable products this gives every option its own
 * URL (shareable, indexable), its own gallery, and its own reviews.
 *
 * Data:
 *   term meta  tcs_family_axes     list of { id, name, type, values[], swatches{} }
 *   post meta  _tcs_family_values  { axis id => value }
 *
 * Exposed as `tcs_family` on the WooCommerce product REST response, and at
 * GET /wp-json/tcsfam/v1/product/<id-or-slug>.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TCS_FAM_VERSION', '1.0.1' );
define( 'TCS_FAM_TAX', 'tcs_family' );
define( 'TCS_FAM_AXES_META', 'tcs_family_axes' );
define( 'TCS_FAM_VALUES_META', '_tcs_family_values' );
define( 'TCS_FAM_NS', 'tcsfam/v1' );

/* =========================================================================
 * Taxonomy
 * ====================================================================== */

add_action( 'init', 'tcs_fam_register_taxonomy' );

function tcs_fam_register_taxonomy() {
	register_taxonomy(
		TCS_FAM_TAX,
		'product',
		array(
			'labels'             => array(
				'name'          => __( 'Product Families', 'tcs-families' ),
				'singular_name' => __( 'Product Family', 'tcs-families' ),
				'menu_name'     => __( 'Product Families', 'tcs-families' ),
				'all_items'     => __( 'All families', 'tcs-families' ),
				'edit_item'     => __( 'Edit family', 'tcs-families' ),
				'update_item'   => __( 'Update family', 'tcs-families' ),
				'add_new_item'  => __( 'Add new family', 'tcs-families' ),
				'new_item_name' => __( 'New family name', 'tcs-families' ),
				'search_items'  => __( 'Search families', 'tcs-families' ),
				'not_found'     => __( 'No families yet.', 'tcs-families' ),
			),
			'description'        => __( 'Separate products that are the same item in different colours or sizes.', 'tcs-families' ),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_admin_column'  => true,
			'show_in_nav_menus'  => false,
			'show_tagcloud'      => false,
			'show_in_quick_edit' => false,
			'show_in_rest'       => false,
			'hierarchical'       => false,
			'rewrite'            => false,
			// Needed for the family filter on the products list.
			'query_var'          => TCS_FAM_TAX,
			// The product screen uses the custom box below instead.
			'meta_box_cb'        => false,
			'capabilities'       => array(
				'manage_terms' => 'manage_product_terms',
				'edit_terms'   => 'edit_product_terms',
				'delete_terms' => 'delete_product_terms',
				'assign_terms' => 'assign_product_terms',
			),
		)
	);
}

/* =========================================================================
 * Data helpers
 * ====================================================================== */

/**
 * A family's options, cleaned.
 *
 * @param int $term_id Family term ID.
 * @return array<int,array{id:string,name:string,type:string,values:string[],swatches:array<string,string>}>
 */
function tcs_fam_get_axes( $term_id ) {
	$axes = get_term_meta( $term_id, TCS_FAM_AXES_META, true );

	if ( ! is_array( $axes ) ) {
		return array();
	}

	$clean = array();
	foreach ( $axes as $axis ) {
		if ( ! is_array( $axis ) || empty( $axis['id'] ) || ! isset( $axis['name'] ) || '' === $axis['name'] ) {
			continue;
		}

		$values = array();
		foreach ( (array) ( $axis['values'] ?? array() ) as $value ) {
			$value = trim( (string) $value );
			if ( '' !== $value ) {
				$values[] = $value;
			}
		}

		$swatches = array();
		foreach ( (array) ( $axis['swatches'] ?? array() ) as $value => $hex ) {
			$hex = sanitize_hex_color( (string) $hex );
			if ( $hex ) {
				$swatches[ (string) $value ] = $hex;
			}
		}

		$clean[] = array(
			'id'       => (string) $axis['id'],
			'name'     => (string) $axis['name'],
			'type'     => ( isset( $axis['type'] ) && 'color' === $axis['type'] ) ? 'color' : 'text',
			'values'   => $values,
			'swatches' => $swatches,
		);
	}

	return $clean;
}

/**
 * The family a product belongs to, or 0.
 *
 * Uses get_the_terms so it reads from the object term cache that WooCommerce's
 * product queries already prime — no extra query per product in a list.
 *
 * @param int $product_id Product ID.
 * @return int
 */
function tcs_fam_product_family_id( $product_id ) {
	$terms = get_the_terms( $product_id, TCS_FAM_TAX );

	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return 0;
	}

	return (int) $terms[0]->term_id;
}

/**
 * A product's option values, keyed by axis ID.
 *
 * @param int $product_id Product ID.
 * @return array<string,string>
 */
function tcs_fam_product_values( $product_id ) {
	$values = get_post_meta( $product_id, TCS_FAM_VALUES_META, true );

	if ( ! is_array( $values ) ) {
		return array();
	}

	$clean = array();
	foreach ( $values as $axis_id => $value ) {
		$value = trim( (string) $value );
		if ( '' !== $value ) {
			$clean[ (string) $axis_id ] = $value;
		}
	}

	return $clean;
}

/**
 * Published members of a family, summarised for the storefront.
 *
 * Every product in a family carries the whole family in its REST response, so
 * this is cached per family and flushed whenever a member changes.
 *
 * @param int $term_id Family term ID.
 * @return array<int,array<string,mixed>>
 */
function tcs_fam_members( $term_id ) {
	static $memo = array();

	$term_id = (int) $term_id;
	if ( isset( $memo[ $term_id ] ) ) {
		return $memo[ $term_id ];
	}

	$cached = get_transient( 'tcs_fam_members_' . $term_id );
	if ( is_array( $cached ) ) {
		$memo[ $term_id ] = $cached;
		return $cached;
	}

	$ids = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'numberposts'    => 200,
			'fields'         => 'ids',
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
			'no_found_rows'  => true,
			'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy' => TCS_FAM_TAX,
					'field'    => 'term_id',
					'terms'    => $term_id,
				),
			),
		)
	);

	$members = array();
	foreach ( $ids as $id ) {
		$product = wc_get_product( $id );
		if ( ! $product ) {
			continue;
		}

		$image_id = $product->get_image_id();
		$image    = $image_id ? wp_get_attachment_image_url( $image_id, 'woocommerce_thumbnail' ) : '';

		$members[] = array(
			'id'            => $product->get_id(),
			'name'          => $product->get_name(),
			'slug'          => $product->get_slug(),
			'price'         => (string) $product->get_price(),
			'regular_price' => (string) $product->get_regular_price(),
			'stock_status'  => $product->get_stock_status(),
			'purchasable'   => $product->is_purchasable(),
			'image'         => $image ? $image : '',
			'values'        => tcs_fam_product_values( $id ),
		);
	}

	// Short TTL as a safety net; the hooks below flush it on every real change.
	set_transient( 'tcs_fam_members_' . $term_id, $members, 10 * MINUTE_IN_SECONDS );
	$memo[ $term_id ] = $members;

	return $members;
}

/**
 * Forget the cached members of a family.
 *
 * @param int $term_id Family term ID.
 */
function tcs_fam_flush( $term_id ) {
	$term_id = (int) $term_id;
	if ( $term_id > 0 ) {
		delete_transient( 'tcs_fam_members_' . $term_id );
	}
}

/**
 * Forget the cache of whichever family a product is in.
 *
 * @param int $product_id Product ID.
 */
function tcs_fam_flush_for_product( $product_id ) {
	// Read fresh rather than from the term cache, which may be stale mid-save.
	$terms = wp_get_object_terms( (int) $product_id, TCS_FAM_TAX, array( 'fields' => 'ids' ) );
	if ( is_wp_error( $terms ) ) {
		return;
	}
	foreach ( $terms as $term_id ) {
		tcs_fam_flush( (int) $term_id );
	}
}

/**
 * Match a typed value against the family's known values, ignoring case, so
 * "blue" and "Blue" don't become two different swatches.
 *
 * @param array  $axis    Axis definition.
 * @param string $value   Value as typed.
 * @param int    $term_id Family term ID.
 * @return string
 */
function tcs_fam_canonical_value( $axis, $value, $term_id ) {
	$known = $axis['values'];

	foreach ( tcs_fam_members( $term_id ) as $member ) {
		if ( isset( $member['values'][ $axis['id'] ] ) ) {
			$known[] = $member['values'][ $axis['id'] ];
		}
	}

	foreach ( $known as $candidate ) {
		if ( 0 === strcasecmp( $candidate, $value ) ) {
			return $candidate;
		}
	}

	return $value;
}

/**
 * The family payload the storefront renders for one product.
 *
 * @param int $product_id Product ID.
 * @return array|null Null when the product is not in a usable family.
 */
function tcs_fam_payload_for_product( $product_id ) {
	$term_id = tcs_fam_product_family_id( $product_id );
	if ( ! $term_id ) {
		return null;
	}

	$term = get_term( $term_id, TCS_FAM_TAX );
	if ( ! $term || is_wp_error( $term ) ) {
		return null;
	}

	$axes = tcs_fam_get_axes( $term_id );
	if ( empty( $axes ) ) {
		return null;
	}

	$members = tcs_fam_members( $term_id );

	$out_axes = array();
	foreach ( $axes as $axis ) {
		// Values the admin listed come first, in their order; anything a product
		// uses that wasn't listed is appended so it is never silently dropped.
		$order = $axis['values'];
		foreach ( $members as $member ) {
			$value = $member['values'][ $axis['id'] ] ?? '';
			if ( '' !== $value && ! in_array( $value, $order, true ) ) {
				$order[] = $value;
			}
		}

		$options = array();
		foreach ( $order as $value ) {
			$options[] = array(
				'value'  => $value,
				'swatch' => $axis['swatches'][ $value ] ?? '',
			);
		}

		$out_axes[] = array(
			'id'      => $axis['id'],
			'name'    => $axis['name'],
			'type'    => $axis['type'],
			'options' => $options,
		);
	}

	return array(
		'id'      => $term_id,
		'name'    => $term->name,
		'slug'    => $term->slug,
		'axes'    => $out_axes,
		'members' => $members,
	);
}

/* =========================================================================
 * Cache invalidation
 * ====================================================================== */

// Price, stock, title, image or slug changed through the admin or the API.
add_action( 'woocommerce_update_product', 'tcs_fam_flush_for_product' );
add_action( 'woocommerce_new_product', 'tcs_fam_flush_for_product' );

// Stock moved by an order, which does not go through a full product save.
add_action(
	'woocommerce_product_set_stock_status',
	function ( $product_id ) {
		tcs_fam_flush_for_product( $product_id );
	}
);

// Published, drafted, trashed or restored — all change who is a member.
add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( $post instanceof WP_Post && 'product' === $post->post_type && $new_status !== $old_status ) {
			tcs_fam_flush_for_product( $post->ID );
		}
	},
	10,
	3
);

add_action(
	'before_delete_post',
	function ( $post_id ) {
		if ( 'product' === get_post_type( $post_id ) ) {
			tcs_fam_flush_for_product( $post_id );
		}
	}
);

// A product joined or left a family by any route.
add_action(
	'set_object_terms',
	function ( $object_id, $terms, $tt_ids, $taxonomy, $append, $old_tt_ids ) {
		if ( TCS_FAM_TAX !== $taxonomy ) {
			return;
		}
		foreach ( array_unique( array_merge( (array) $tt_ids, (array) $old_tt_ids ) ) as $tt_id ) {
			$term = get_term_by( 'term_taxonomy_id', (int) $tt_id, TCS_FAM_TAX );
			if ( $term ) {
				tcs_fam_flush( $term->term_id );
			}
		}
	},
	10,
	6
);

add_action( 'edited_' . TCS_FAM_TAX, 'tcs_fam_flush' );
add_action( 'delete_' . TCS_FAM_TAX, 'tcs_fam_flush' );

/* =========================================================================
 * REST
 * ====================================================================== */

/**
 * Add the family to the WooCommerce product response the storefront already uses.
 *
 * @param WP_REST_Response $response Response.
 * @param WC_Product       $product  Product.
 * @return WP_REST_Response
 */
function tcs_fam_add_to_wc_response( $response, $product ) {
	if ( $product instanceof WC_Product ) {
		$response->data['tcs_family'] = tcs_fam_payload_for_product( $product->get_id() );
	}
	return $response;
}
add_filter( 'woocommerce_rest_prepare_product_object', 'tcs_fam_add_to_wc_response', 10, 2 );

/**
 * Keep page caches away from the product data the storefront reads.
 *
 * The storefront authenticates with keys in the query string, which LiteSpeed
 * Cache treats as a guest request and caches for up to 30 minutes. A family set
 * up after that copy was stored stayed invisible on the site — swatches never
 * appeared. Marking these responses uncacheable makes changes show at once.
 *
 * @param WP_HTTP_Response|WP_Error $response Response about to be sent.
 * @param WP_REST_Server            $server   Server.
 * @param WP_REST_Request           $request  Request.
 * @return WP_HTTP_Response|WP_Error
 */
function tcs_fam_no_cache_rest( $response, $server, $request ) {
	$route = $request->get_route();

	if ( 0 === strpos( $route, '/wc/v3/products' ) || 0 === strpos( $route, '/' . TCS_FAM_NS ) ) {
		if ( $response instanceof WP_HTTP_Response ) {
			$response->header( 'X-LiteSpeed-Cache-Control', 'no-cache' );
			$response->header( 'Cache-Control', 'no-store, private' );
		}
		// LiteSpeed Cache's own API; a no-op when that plugin is not installed.
		do_action( 'litespeed_control_set_nocache', 'tcs-families: storefront product data must stay fresh' );
	}

	return $response;
}
add_filter( 'rest_post_dispatch', 'tcs_fam_no_cache_rest', 10, 3 );

add_action( 'rest_api_init', 'tcs_fam_register_routes' );

function tcs_fam_register_routes() {
	register_rest_route(
		TCS_FAM_NS,
		'/product/(?P<key>[a-zA-Z0-9_-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'permission_callback' => '__return_true', // Read-only, published products only.
			'callback'            => 'tcs_fam_route_product',
		)
	);
}

/**
 * GET /tcsfam/v1/product/<id-or-slug>
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function tcs_fam_route_product( WP_REST_Request $request ) {
	$key = (string) $request->get_param( 'key' );

	if ( ctype_digit( $key ) ) {
		$post = get_post( (int) $key );
	} else {
		$found = get_posts(
			array(
				'name'        => sanitize_title( $key ),
				'post_type'   => 'product',
				'post_status' => 'publish',
				'numberposts' => 1,
			)
		);
		$post  = $found ? $found[0] : null;
	}

	if ( ! $post || 'product' !== $post->post_type || 'publish' !== $post->post_status ) {
		return new WP_Error( 'tcs_fam_not_found', __( 'Product not found.', 'tcs-families' ), array( 'status' => 404 ) );
	}

	return rest_ensure_response(
		array(
			'product_id' => $post->ID,
			'family'     => tcs_fam_payload_for_product( $post->ID ),
		)
	);
}

/* =========================================================================
 * Product edit screen
 * ====================================================================== */

add_action( 'add_meta_boxes_product', 'tcs_fam_add_product_box' );

function tcs_fam_add_product_box() {
	add_meta_box(
		'tcs_family_box',
		__( 'Product Family (colour / size)', 'tcs-families' ),
		'tcs_fam_render_product_box',
		'product',
		'side',
		'default'
	);
}

/**
 * Render the family picker on the product screen.
 *
 * @param WP_Post $post Product being edited.
 */
function tcs_fam_render_product_box( $post ) {
	wp_nonce_field( 'tcs_fam_save_product', 'tcs_fam_nonce' );

	$current_family = tcs_fam_product_family_id( $post->ID );
	$values         = tcs_fam_product_values( $post->ID );
	$terms          = get_terms(
		array(
			'taxonomy'   => TCS_FAM_TAX,
			'hide_empty' => false,
			'orderby'    => 'name',
		)
	);

	if ( is_wp_error( $terms ) ) {
		$terms = array();
	}

	// Everything the picker needs to redraw its fields without a page reload.
	$families = array();
	foreach ( $terms as $term ) {
		$axes    = tcs_fam_get_axes( $term->term_id );
		$members = tcs_fam_members( $term->term_id );
		$out     = array();

		foreach ( $axes as $axis ) {
			$suggestions = $axis['values'];
			foreach ( $members as $member ) {
				$value = $member['values'][ $axis['id'] ] ?? '';
				if ( '' !== $value && ! in_array( $value, $suggestions, true ) ) {
					$suggestions[] = $value;
				}
			}
			$out[] = array(
				'id'          => $axis['id'],
				'name'        => $axis['name'],
				'suggestions' => $suggestions,
			);
		}

		$families[ $term->term_id ] = array(
			'name' => $term->name,
			'edit' => get_edit_term_link( $term->term_id, TCS_FAM_TAX, 'product' ),
			'axes' => $out,
		);
	}

	$manage_url = admin_url( 'edit-tags.php?taxonomy=' . TCS_FAM_TAX . '&post_type=product' );
	?>
	<div class="tcs-fam-box">
		<p>
			<label for="tcs-fam-select"><strong><?php esc_html_e( 'Family', 'tcs-families' ); ?></strong></label>
			<select id="tcs-fam-select" name="tcs_family_id" class="widefat">
				<option value="0"><?php esc_html_e( '— Not in a family —', 'tcs-families' ); ?></option>
				<?php foreach ( $terms as $term ) : ?>
					<option value="<?php echo esc_attr( $term->term_id ); ?>" <?php selected( $current_family, $term->term_id ); ?>>
						<?php echo esc_html( $term->name ); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</p>

		<div id="tcs-fam-fields"></div>

		<p class="description">
			<?php
			printf(
				/* translators: %s: link to the Product Families screen. */
				esc_html__( 'Create families and their options under %s.', 'tcs-families' ),
				'<a href="' . esc_url( $manage_url ) . '">' . esc_html__( 'Products → Product Families', 'tcs-families' ) . '</a>'
			);
			?>
		</p>

		<?php
		// Siblings as saved, with a warning when this product duplicates one.
		if ( $current_family ) :
			$axes     = tcs_fam_get_axes( $current_family );
			$siblings = array_filter(
				tcs_fam_members( $current_family ),
				function ( $member ) use ( $post ) {
					return (int) $member['id'] !== (int) $post->ID;
				}
			);

			$describe = function ( $vals ) use ( $axes ) {
				$parts = array();
				foreach ( $axes as $axis ) {
					$parts[] = $vals[ $axis['id'] ] ?? '—';
				}
				return implode( ' / ', $parts );
			};

			$mine = $describe( $values );
			?>
			<?php if ( $siblings ) : ?>
				<p style="margin-bottom:4px"><strong><?php esc_html_e( 'Other products in this family', 'tcs-families' ); ?></strong></p>
				<ul class="tcs-fam-siblings">
					<?php foreach ( $siblings as $sibling ) : ?>
						<?php $theirs = $describe( $sibling['values'] ); ?>
						<li class="<?php echo $theirs === $mine ? 'tcs-fam-clash' : ''; ?>">
							<a href="<?php echo esc_url( get_edit_post_link( $sibling['id'] ) ); ?>"><?php echo esc_html( $theirs ); ?></a>
							<?php if ( $theirs === $mine ) : ?>
								<br /><em><?php esc_html_e( 'Same options as this product — change one of them.', 'tcs-families' ); ?></em>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		<?php endif; ?>
	</div>

	<style>
		.tcs-fam-box label { display: block; margin-bottom: 4px; }
		.tcs-fam-field { margin: 0 0 10px; }
		.tcs-fam-siblings { margin: 0; }
		.tcs-fam-siblings li { margin: 0 0 4px; padding: 3px 6px; border-radius: 3px; background: #f6f7f7; }
		.tcs-fam-siblings li.tcs-fam-clash { background: #fcf0f1; }
		.tcs-fam-siblings em { color: #b32d2e; font-size: 11px; }
	</style>

	<script>
	( function () {
		var FAMILIES = <?php echo wp_json_encode( $families, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?>;
		var VALUES   = <?php echo wp_json_encode( (object) $values, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?>;

		var select = document.getElementById( 'tcs-fam-select' );
		var box    = document.getElementById( 'tcs-fam-fields' );
		if ( ! select || ! box ) { return; }

		// Build the value inputs for the chosen family. DOM methods only, so
		// product-entered values can never be interpreted as markup.
		function render() {
			while ( box.firstChild ) { box.removeChild( box.firstChild ); }

			var family = FAMILIES[ select.value ];
			if ( ! family ) { return; }

			if ( ! family.axes.length ) {
				var p = document.createElement( 'p' );
				p.className = 'description';
				p.appendChild( document.createTextNode( 'This family has no options yet. ' ) );
				var a = document.createElement( 'a' );
				a.href = family.edit;
				a.textContent = 'Add options';
				p.appendChild( a );
				box.appendChild( p );
				return;
			}

			family.axes.forEach( function ( axis ) {
				var wrap  = document.createElement( 'p' );
				wrap.className = 'tcs-fam-field';

				var label = document.createElement( 'label' );
				label.htmlFor = 'tcs-fam-' + axis.id;
				label.textContent = axis.name;

				var input = document.createElement( 'input' );
				input.type = 'text';
				input.className = 'widefat';
				input.id = 'tcs-fam-' + axis.id;
				input.name = 'tcs_family_values[' + axis.id + ']';
				input.value = VALUES[ axis.id ] || '';
				input.placeholder = axis.suggestions.length ? 'e.g. ' + axis.suggestions[0] : '';
				input.setAttribute( 'list', 'tcs-fam-dl-' + axis.id );

				// Suggest the values the family already uses, to keep spelling consistent.
				var list = document.createElement( 'datalist' );
				list.id = 'tcs-fam-dl-' + axis.id;
				axis.suggestions.forEach( function ( value ) {
					var option = document.createElement( 'option' );
					option.value = value;
					list.appendChild( option );
				} );

				wrap.appendChild( label );
				wrap.appendChild( input );
				wrap.appendChild( list );
				box.appendChild( wrap );
			} );
		}

		select.addEventListener( 'change', render );
		render();
	} )();
	</script>
	<?php
}

add_action( 'save_post_product', 'tcs_fam_save_product', 20 );

/**
 * Save the family and this product's values within it.
 *
 * @param int $post_id Product ID.
 */
function tcs_fam_save_product( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}
	// Absent on quick edit, bulk edit and API saves — leave families alone there.
	if ( ! isset( $_POST['tcs_fam_nonce'] ) ) {
		return;
	}
	if ( ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['tcs_fam_nonce'] ) ), 'tcs_fam_save_product' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$old_family = tcs_fam_product_family_id( $post_id );
	$family_id  = isset( $_POST['tcs_family_id'] ) ? absint( $_POST['tcs_family_id'] ) : 0;

	if ( $family_id && ! term_exists( $family_id, TCS_FAM_TAX ) ) {
		$family_id = 0;
	}

	wp_set_object_terms( $post_id, $family_id ? array( $family_id ) : array(), TCS_FAM_TAX, false );

	if ( $family_id ) {
		$axes  = tcs_fam_get_axes( $family_id );
		$raw   = isset( $_POST['tcs_family_values'] ) && is_array( $_POST['tcs_family_values'] )
			? wp_unslash( $_POST['tcs_family_values'] ) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised per field below.
			: array();
		$clean = array();

		// Only values for options this family actually has are kept.
		foreach ( $axes as $axis ) {
			$value = isset( $raw[ $axis['id'] ] ) ? trim( sanitize_text_field( $raw[ $axis['id'] ] ) ) : '';
			if ( '' !== $value ) {
				$clean[ $axis['id'] ] = tcs_fam_canonical_value( $axis, $value, $family_id );
			}
		}

		if ( $clean ) {
			update_post_meta( $post_id, TCS_FAM_VALUES_META, $clean );
		} else {
			delete_post_meta( $post_id, TCS_FAM_VALUES_META );
		}
	} else {
		delete_post_meta( $post_id, TCS_FAM_VALUES_META );
	}

	tcs_fam_flush( $old_family );
	tcs_fam_flush( $family_id );
}

/* =========================================================================
 * Duplicate → new family member
 * ====================================================================== */

// WooCommerce's "Duplicate" does not copy custom taxonomies. Carry the family
// across so duplicating the Blue bag is the quickest way to start the Red one.
add_action(
	'woocommerce_product_duplicate',
	function ( $duplicate, $original ) {
		$family_id = tcs_fam_product_family_id( $original->get_id() );
		if ( $family_id ) {
			wp_set_object_terms( $duplicate->get_id(), array( $family_id ), TCS_FAM_TAX, false );
			tcs_fam_flush( $family_id );
		}
	},
	10,
	2
);

// …but not its values, or the copy would clash with the original straight away.
add_filter(
	'woocommerce_duplicate_product_exclude_meta',
	function ( $exclude ) {
		$exclude[] = TCS_FAM_VALUES_META;
		return $exclude;
	}
);

/* =========================================================================
 * Family screen (Products → Product Families)
 * ====================================================================== */

/**
 * The option editor shared by the add and edit forms.
 *
 * @param array $axes Existing axes.
 */
function tcs_fam_render_axes_editor( $axes ) {
	wp_nonce_field( 'tcs_fam_save_term', 'tcs_fam_term_nonce' );

	if ( empty( $axes ) ) {
		// A sensible starting point for a carry-goods shop.
		$axes = array(
			array(
				'id'       => 'ax_' . strtolower( wp_generate_password( 8, false, false ) ),
				'name'     => 'Colour',
				'type'     => 'color',
				'values'   => array(),
				'swatches' => array(),
			),
		);
	}
	?>
	<div class="tcs-axes" data-tcs-axes>
		<table class="widefat tcs-axes-table">
			<thead>
				<tr>
					<th style="width:22%"><?php esc_html_e( 'Option', 'tcs-families' ); ?></th>
					<th style="width:20%"><?php esc_html_e( 'Shown as', 'tcs-families' ); ?></th>
					<th><?php esc_html_e( 'Values, in the order to show them', 'tcs-families' ); ?></th>
					<th style="width:30px"></th>
				</tr>
			</thead>
			<tbody data-tcs-axes-body>
				<?php foreach ( $axes as $axis ) : ?>
					<?php tcs_fam_render_axis_row( $axis['id'], $axis ); ?>
				<?php endforeach; ?>
			</tbody>
		</table>

		<p>
			<button type="button" class="button" data-tcs-add-axis>+ <?php esc_html_e( 'Add option', 'tcs-families' ); ?></button>
		</p>

		<p class="description">
			<?php esc_html_e( 'Example: Colour → Blue, Black, Red.  Size → S, M, L, XL.  Values are separated by commas. Products can also use values not listed here; they are shown after the listed ones.', 'tcs-families' ); ?>
		</p>

		<template data-tcs-row-template>
			<?php
			tcs_fam_render_axis_row(
				'__ID__',
				array(
					'name'     => '',
					'type'     => 'text',
					'values'   => array(),
					'swatches' => array(),
				)
			);
			?>
		</template>
	</div>

	<style>
		.tcs-axes-table td { vertical-align: top; }
		.tcs-axes-table input[type="text"], .tcs-axes-table select { width: 100%; }
		.tcs-swatches { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 8px; }
		.tcs-swatches label { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
		.tcs-swatches input[type="color"] { width: 28px; height: 28px; padding: 0; border: 1px solid #c3c4c7; border-radius: 50%; cursor: pointer; }
		.tcs-swatches input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
		.tcs-swatches input[type="color"]::-webkit-color-swatch { border: 0; border-radius: 50%; }
	</style>

	<script>
	( function () {
		var root = document.querySelector( '[data-tcs-axes]' );
		if ( ! root ) { return; }

		var body     = root.querySelector( '[data-tcs-axes-body]' );
		var template = root.querySelector( '[data-tcs-row-template]' );

		// Rough starting colours for common names, so new swatches aren't all black.
		var GUESS = {
			black: '#1f1f1f', white: '#f5f5f5', red: '#c62828', blue: '#1e4fb0', navy: '#1b2a4a',
			green: '#2e7d32', olive: '#6b7033', yellow: '#f2c230', orange: '#ef7a22', pink: '#f4a6bd',
			purple: '#6a3d9a', lavender: '#b9a7d6', grey: '#8c8c8c', gray: '#8c8c8c', brown: '#7a4e2d',
			beige: '#d9c3a5', cream: '#f1e6d2', maroon: '#6d1a2a', gold: '#c9a227', silver: '#b8b8b8',
			teal: '#1f7a7a', mint: '#a8dcc5', peach: '#f6c3a4', tan: '#c8a47e', khaki: '#b7a97a'
		};

		function guess( value ) {
			var key = value.toLowerCase().replace( /[^a-z]/g, '' );
			return GUESS[ key ] || '#cccccc';
		}

		// Redraw the colour pickers for one row from its values field, keeping
		// any colours already picked.
		function drawSwatches( row ) {
			var type   = row.querySelector( '[data-type]' ).value;
			var holder = row.querySelector( '[data-swatches]' );
			var id     = row.getAttribute( 'data-axis-id' );

			var chosen = {};
			try { chosen = JSON.parse( holder.getAttribute( 'data-initial' ) || '{}' ); } catch ( e ) {}
			holder.querySelectorAll( 'label' ).forEach( function ( label ) {
				chosen[ label.getAttribute( 'data-value' ) ] = label.querySelector( 'input[type="color"]' ).value;
			} );

			while ( holder.firstChild ) { holder.removeChild( holder.firstChild ); }
			holder.setAttribute( 'data-initial', JSON.stringify( chosen ) );

			if ( 'color' !== type ) { return; }

			var values = row.querySelector( '[data-values]' ).value.split( ',' )
				.map( function ( v ) { return v.trim(); } )
				.filter( function ( v ) { return v.length; } );

			values.forEach( function ( value ) {
				var label = document.createElement( 'label' );
				label.setAttribute( 'data-value', value );

				var color = document.createElement( 'input' );
				color.type  = 'color';
				color.name  = 'tcs_axes[' + id + '][swatch_hex][]';
				color.value = chosen[ value ] || guess( value );

				var hidden = document.createElement( 'input' );
				hidden.type  = 'hidden';
				hidden.name  = 'tcs_axes[' + id + '][swatch_values][]';
				hidden.value = value;

				label.appendChild( color );
				label.appendChild( hidden );
				label.appendChild( document.createTextNode( value ) );
				holder.appendChild( label );
			} );
		}

		function wire( row ) {
			row.querySelector( '[data-values]' ).addEventListener( 'input', function () { drawSwatches( row ); } );
			row.querySelector( '[data-type]' ).addEventListener( 'change', function () { drawSwatches( row ); } );
			row.querySelector( '[data-remove]' ).addEventListener( 'click', function () { row.parentNode.removeChild( row ); } );
			drawSwatches( row );
		}

		body.querySelectorAll( '[data-axis-row]' ).forEach( wire );

		root.querySelector( '[data-tcs-add-axis]' ).addEventListener( 'click', function () {
			var id   = 'ax_' + Math.random().toString( 36 ).slice( 2, 10 );
			var html = template.innerHTML.split( '__ID__' ).join( id );
			var tmp  = document.createElement( 'tbody' );
			tmp.innerHTML = html;
			var row = tmp.querySelector( '[data-axis-row]' );
			body.appendChild( row );
			wire( row );
			row.querySelector( 'input[type="text"]' ).focus();
		} );
	} )();
	</script>
	<?php
}

/**
 * One option row in the editor.
 *
 * @param string $id   Axis ID, or a template placeholder.
 * @param array  $axis Axis data.
 */
function tcs_fam_render_axis_row( $id, $axis ) {
	?>
	<tr data-axis-row data-axis-id="<?php echo esc_attr( $id ); ?>">
		<td>
			<input type="text" name="tcs_axes[<?php echo esc_attr( $id ); ?>][name]"
				value="<?php echo esc_attr( $axis['name'] ); ?>"
				placeholder="<?php esc_attr_e( 'Colour', 'tcs-families' ); ?>" />
		</td>
		<td>
			<select name="tcs_axes[<?php echo esc_attr( $id ); ?>][type]" data-type>
				<option value="color" <?php selected( $axis['type'], 'color' ); ?>><?php esc_html_e( 'Colour swatch', 'tcs-families' ); ?></option>
				<option value="text" <?php selected( $axis['type'], 'text' ); ?>><?php esc_html_e( 'Text button', 'tcs-families' ); ?></option>
			</select>
		</td>
		<td>
			<input type="text" data-values name="tcs_axes[<?php echo esc_attr( $id ); ?>][values]"
				value="<?php echo esc_attr( implode( ', ', $axis['values'] ) ); ?>"
				placeholder="<?php esc_attr_e( 'Blue, Black, Red', 'tcs-families' ); ?>" />
			<div class="tcs-swatches" data-swatches
				data-initial="<?php echo esc_attr( wp_json_encode( (object) $axis['swatches'] ) ); ?>"></div>
		</td>
		<td>
			<button type="button" class="button-link button-link-delete" data-remove
				aria-label="<?php esc_attr_e( 'Remove option', 'tcs-families' ); ?>">&times;</button>
		</td>
	</tr>
	<?php
}

add_action(
	TCS_FAM_TAX . '_add_form_fields',
	function () {
		?>
		<div class="form-field">
			<label><?php esc_html_e( 'Options', 'tcs-families' ); ?></label>
			<?php tcs_fam_render_axes_editor( array() ); ?>
		</div>
		<?php
	}
);

add_action(
	TCS_FAM_TAX . '_edit_form_fields',
	function ( $term ) {
		$axes = tcs_fam_get_axes( $term->term_id );
		?>
		<tr class="form-field">
			<th scope="row"><?php esc_html_e( 'Options', 'tcs-families' ); ?></th>
			<td><?php tcs_fam_render_axes_editor( $axes ); ?></td>
		</tr>
		<tr class="form-field">
			<th scope="row"><?php esc_html_e( 'Products in this family', 'tcs-families' ); ?></th>
			<td><?php tcs_fam_render_members_table( $term->term_id, $axes ); ?></td>
		</tr>
		<?php
	}
);

/**
 * Every product in the family, including drafts, with problems flagged.
 *
 * @param int   $term_id Family term ID.
 * @param array $axes    Family axes.
 */
function tcs_fam_render_members_table( $term_id, $axes ) {
	$posts = get_posts(
		array(
			'post_type'   => 'product',
			'post_status' => array( 'publish', 'draft', 'pending', 'private' ),
			'numberposts' => 200,
			'orderby'     => 'menu_order title',
			'order'       => 'ASC',
			'tax_query'   => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy' => TCS_FAM_TAX,
					'field'    => 'term_id',
					'terms'    => $term_id,
				),
			),
		)
	);

	if ( ! $posts ) {
		echo '<p class="description">' . esc_html__( 'No products yet. Open a product and choose this family in its "Product Family" box.', 'tcs-families' ) . '</p>';
		return;
	}

	// Find combinations used by more than one published product.
	$seen = array();
	foreach ( $posts as $post ) {
		if ( 'publish' !== $post->post_status ) {
			continue;
		}
		$values = tcs_fam_product_values( $post->ID );
		$key    = array();
		foreach ( $axes as $axis ) {
			$key[] = strtolower( $values[ $axis['id'] ] ?? '' );
		}
		$key          = implode( '|', $key );
		$seen[ $key ] = ( $seen[ $key ] ?? 0 ) + 1;
	}
	?>
	<table class="widefat striped">
		<thead>
			<tr>
				<th><?php esc_html_e( 'Product', 'tcs-families' ); ?></th>
				<?php foreach ( $axes as $axis ) : ?>
					<th><?php echo esc_html( $axis['name'] ); ?></th>
				<?php endforeach; ?>
				<th><?php esc_html_e( 'Price', 'tcs-families' ); ?></th>
				<th><?php esc_html_e( 'Stock', 'tcs-families' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $posts as $post ) : ?>
				<?php
				$product = wc_get_product( $post->ID );
				$values  = tcs_fam_product_values( $post->ID );
				$key     = array();
				$missing = false;
				foreach ( $axes as $axis ) {
					$key[] = strtolower( $values[ $axis['id'] ] ?? '' );
					if ( empty( $values[ $axis['id'] ] ) ) {
						$missing = true;
					}
				}
				$clash = 'publish' === $post->post_status && ( $seen[ implode( '|', $key ) ] ?? 0 ) > 1;
				?>
				<tr>
					<td>
						<a href="<?php echo esc_url( get_edit_post_link( $post->ID ) ); ?>"><strong><?php echo esc_html( get_the_title( $post ) ); ?></strong></a>
						<?php if ( 'publish' !== $post->post_status ) : ?>
							<span class="description">(<?php echo esc_html( $post->post_status ); ?> — <?php esc_html_e( 'not shown on the site', 'tcs-families' ); ?>)</span>
						<?php endif; ?>
						<?php if ( $missing ) : ?>
							<br /><span style="color:#8a5c00"><?php esc_html_e( 'Some options are not filled in.', 'tcs-families' ); ?></span>
						<?php endif; ?>
						<?php if ( $clash ) : ?>
							<br /><span style="color:#b32d2e"><?php esc_html_e( 'Another product has exactly the same options.', 'tcs-families' ); ?></span>
						<?php endif; ?>
					</td>
					<?php foreach ( $axes as $axis ) : ?>
						<td><?php echo esc_html( $values[ $axis['id'] ] ?? '—' ); ?></td>
					<?php endforeach; ?>
					<td>
						<?php
						if ( $product && '' !== $product->get_price() ) {
							echo wp_kses_post( wc_price( $product->get_price() ) );
						} else {
							echo '<span style="color:#b32d2e">' . esc_html__( 'No price', 'tcs-families' ) . '</span>';
						}
						?>
					</td>
					<td><?php echo $product ? esc_html( wc_get_stock_html( $product ) ? wp_strip_all_tags( wc_get_stock_html( $product ) ) : ucfirst( $product->get_stock_status() ) ) : '—'; ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<?php
}

add_action( 'created_' . TCS_FAM_TAX, 'tcs_fam_save_term' );
add_action( 'edited_' . TCS_FAM_TAX, 'tcs_fam_save_term' );

/**
 * Save a family's options.
 *
 * @param int $term_id Family term ID.
 */
function tcs_fam_save_term( $term_id ) {
	if ( ! isset( $_POST['tcs_fam_term_nonce'] ) ) {
		return;
	}
	if ( ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['tcs_fam_term_nonce'] ) ), 'tcs_fam_save_term' ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_product_terms' ) ) {
		return;
	}

	$raw = isset( $_POST['tcs_axes'] ) && is_array( $_POST['tcs_axes'] )
		? wp_unslash( $_POST['tcs_axes'] ) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised per field below.
		: array();

	$axes  = array();
	$names = array();

	foreach ( $raw as $id => $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$name = trim( sanitize_text_field( $row['name'] ?? '' ) );
		if ( '' === $name || isset( $names[ strtolower( $name ) ] ) ) {
			continue;
		}
		$names[ strtolower( $name ) ] = true;

		// IDs are what product values are keyed by, so renaming an option keeps
		// every product's choice. Anything malformed gets a fresh one.
		$id = (string) $id;
		if ( ! preg_match( '/^ax_[a-z0-9]{4,20}$/', $id ) ) {
			$id = 'ax_' . strtolower( wp_generate_password( 8, false, false ) );
		}

		$values = array();
		foreach ( explode( ',', (string) ( $row['values'] ?? '' ) ) as $value ) {
			$value = trim( sanitize_text_field( $value ) );
			if ( '' !== $value && ! in_array( $value, $values, true ) ) {
				$values[] = $value;
			}
		}

		$swatches    = array();
		$swatch_vals = (array) ( $row['swatch_values'] ?? array() );
		$swatch_hex  = (array) ( $row['swatch_hex'] ?? array() );
		foreach ( $swatch_vals as $index => $value ) {
			$value = trim( sanitize_text_field( $value ) );
			$hex   = sanitize_hex_color( (string) ( $swatch_hex[ $index ] ?? '' ) );
			if ( '' !== $value && $hex ) {
				$swatches[ $value ] = $hex;
			}
		}

		$axes[] = array(
			'id'       => $id,
			'name'     => $name,
			'type'     => ( isset( $row['type'] ) && 'color' === $row['type'] ) ? 'color' : 'text',
			'values'   => $values,
			'swatches' => $swatches,
		);
	}

	update_term_meta( $term_id, TCS_FAM_AXES_META, $axes );
	tcs_fam_flush( $term_id );
}

/* =========================================================================
 * Products list: filter by family
 * ====================================================================== */

add_action(
	'restrict_manage_posts',
	function ( $post_type ) {
		if ( 'product' !== $post_type ) {
			return;
		}
		wp_dropdown_categories(
			array(
				'show_option_all' => __( 'All families', 'tcs-families' ),
				'taxonomy'        => TCS_FAM_TAX,
				'name'            => TCS_FAM_TAX,
				'value_field'     => 'slug',
				'orderby'         => 'name',
				'hide_empty'      => false,
				'hierarchical'    => false,
				'selected'        => isset( $_GET[ TCS_FAM_TAX ] ) ? sanitize_title( wp_unslash( $_GET[ TCS_FAM_TAX ] ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			)
		);
	}
);

/* =========================================================================
 * Dependency notice
 * ====================================================================== */

add_action(
	'admin_notices',
	function () {
		if ( class_exists( 'WooCommerce' ) ) {
			return;
		}
		echo '<div class="notice notice-error"><p>';
		esc_html_e( 'The Curio Shelf — Product Families needs WooCommerce to be active.', 'tcs-families' );
		echo '</p></div>';
	}
);
