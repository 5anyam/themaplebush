=== The Curio Shelf — Product Panel ===
Contributors: thecurioshelf
Tags: woocommerce, product, specifications, care instructions, headless
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Adds per-product Specifications and Care Instructions, exposed over the REST API
so the thecurioshelf.in storefront can render them on the product page.

== What it does ==

* Adds a "Curio Shelf — Specifications & Care" box to every product edit screen.
* Specifications are label/value rows (Material / Cotton canvas), reorderable by drag.
* Care instructions are one per line, shown as a bulleted list on the storefront.
* A "Curio Shelf" menu in the admin sidebar shows which products still need content
  and holds a site-wide default care list used by products that have none.
* Everything is exposed on the WooCommerce product REST response, so the storefront
  needs no extra API call.

== Installation ==

1. Zip the `the-curio-shelf-panel` folder (or use the provided zip).
2. In WP admin go to Plugins → Add New → Upload Plugin, choose the zip, install.
3. Activate it.
4. Open any product. The new box sits below the product data panel.

Alternatively, upload the `the-curio-shelf-panel` folder to `wp-content/plugins/`
over FTP/SFTP and activate it from the Plugins screen.

== Where the data appears ==

WooCommerce REST (already used by the storefront):

    GET /wp-json/wc/v3/products/<id>
    -> "tcs_specifications": [ { "label": "Material", "value": "Cotton canvas" } ]
    -> "tcs_care_instructions": [ "Wipe clean with a damp cloth" ]

Public read-only endpoint (no authentication, published products only):

    GET /wp-json/tcs/v1/product/<id-or-slug>

== Meta keys ==

* `_tcs_specifications`    — array of { label, value }
* `_tcs_care_instructions` — array of strings

Both are private meta keys (leading underscore) so they stay out of the default
custom fields box.

== Notes ==

* Care instructions fall back to the site-wide default when a product has none,
  so no product ships with an empty care section.
* Specifications never fall back; a product with no rows simply hides that section
  on the storefront.
* Uninstalling the plugin leaves the saved data in place, so deactivating and
  reactivating does not lose anything.

== Changelog ==

= 1.0.0 =
* First release: specifications, care instructions, control panel, REST exposure.
