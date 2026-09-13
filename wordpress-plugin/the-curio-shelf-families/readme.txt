=== The Curio Shelf — Product Families ===
Contributors: thecurioshelf
Tags: woocommerce, swatches, colour, size, linked products, headless
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Group separate products into colour / size families. Every option is its own
product with its own page; the storefront links them with swatches.

== Why not WooCommerce variations? ==

A variable product puts every colour on one page. With families, the Blue bag
and the Red bag are two normal products:

* each has its own URL, so it can be shared, advertised and indexed on its own
* each has its own gallery, description, reviews, price and stock
* clicking a swatch on the storefront opens the sibling's page

Both approaches can be used side by side; a product can even be in a family and
be a variable product at the same time.

== Installation ==

1. Plugins → Add New → Upload Plugin, choose the zip, install, activate.
2. A new screen appears at Products → Product Families.

Requires WooCommerce.

== Setting up a family ==

1. Products → Product Families → add a family, e.g. "Checked Toiletries Bag".
2. Under Options, set what varies:
     Colour  — Colour swatch — Blue, Black, Red
     Size    — Text button   — S, M, L          (only if sizes differ)
   Pick a swatch colour for each colour value. Values are comma-separated and
   appear on the site in the order typed.
3. Open each product (the Blue one, the Black one, …). In the
   "Product Family (colour / size)" box on the right, choose the family and fill
   in its values. Existing values are suggested as you type, to keep spelling
   consistent.
4. Update the product. The family screen lists every member and flags two
   products with the same options, or options left empty.

Quickest way to add a new colour: WooCommerce's "Duplicate" on an existing
member. The copy stays in the family with its options cleared — set the new
colour, change the images and price, and publish.

== How the storefront chooses the page to open ==

Picking a value keeps the other options the same when such a product exists
(Blue M → Red M). If it does not, the closest product with that value opens,
preferring in-stock ones, and the option is drawn with a dashed border as a
hint. Values no product has are shown greyed out.

An option only one value long across the whole family ("One size" everywhere)
is not shown, since there is nothing to choose.

Only published products appear. Drafts are listed on the family screen but
never linked from the site.

== Data ==

* Taxonomy `tcs_family` (private, no public URLs)
* Term meta `tcs_family_axes`    — list of { id, name, type, values[], swatches{} }
* Post meta `_tcs_family_values` — { option id → value }

Option ids are stable, so renaming "Colour" to "Color" keeps every product's
choice.

== REST ==

Added to the WooCommerce product response as `tcs_family`, and available at:

    GET /wp-json/tcsfam/v1/product/<id-or-slug>

Each product's response carries the whole family (options plus a short summary
of every member: slug, price, stock, thumbnail, values). The member list is
cached per family and flushed whenever a member is saved, published, trashed,
restored, changes stock, or joins or leaves the family.

== Changelog ==

= 1.0.0 =
* First release: families, options with ordered values and colour swatches,
  per-product values, clash and missing-value warnings, products list filter,
  duplicate-into-family, REST exposure.
