=== The Curio Shelf — Customer Accounts ===
Contributors: thecurioshelf
Tags: woocommerce, headless, rest api, customer accounts, orders
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Token-authenticated REST endpoints so the headless storefront can offer sign-in,
order history with a delivery timeline, and customer-initiated cancellation.

== Why this plugin exists ==

Before it, the storefront dashboard read orders straight from the browser using
WooCommerce admin keys plus a `customer=<id>` filter, where the id came from a
plain cookie. Anyone could edit that cookie and read another customer's orders,
addresses and phone numbers.

Every endpoint here works out who is calling from a signed token, so a caller
can only reach their own data. No WooCommerce keys are needed in the browser.

== Installation ==

1. Plugins → Add New → Upload Plugin, choose the zip, install, activate.
2. Nothing to configure. A signing secret is generated on activation.
3. Set NEXT_PUBLIC_WORDPRESS_URL in the storefront's .env to this site's URL.

Requires WooCommerce. No JWT plugin is needed — signing is built in.

== Endpoints ==

All under `/wp-json/tcsauth/v1`. Authenticated calls take `Authorization: Bearer <token>`
(or `X-TCS-Token: <token>` on hosts that strip the Authorization header).

    POST /register              email, password, first_name, last_name, phone
    POST /login                 username-or-email, password   -> token + user
    POST /forgot-password       email -> sends WordPress's reset email
    GET  /me                    current user + billing address
    POST /me                    update name and billing address
    GET  /orders                this customer's orders, paginated
    GET  /orders/<id>           one order: line items, addresses, timeline
    POST /orders/<id>/cancel    cancel, optional reason
    POST /link-orders           claim guest orders placed with the account email

== Security notes ==

* Tokens are HMAC-SHA256 signed and valid for 14 days.
* A token embeds a fingerprint of the password hash, so changing or resetting
  the password invalidates every token issued before it.
* Signature comparison is constant-time.
* Sign-in failures are throttled per IP: 10 failures locks that IP out for 15
  minutes.
* Password-reset requests are throttled per IP too (5 per 15 minutes), and the
  reply is identical whether or not the email has an account.
* Login returns one message for every failure mode, so the endpoint cannot be
  used to discover which emails have accounts.
* Requesting an order that belongs to someone else returns 404, identical to a
  non-existent order, so order ids cannot be probed.
* Deleting the `tcs_auth_signing_secret` option signs everybody out at once.

== Order timeline ==

Built from the order's own dated milestones (placed, paid, completed) merged
with customer-visible order notes, sorted oldest first. To add an update the
shopper can see, add a note to the order in WooCommerce and choose
"Note to customer" — for example a courier name and tracking number.

== Cancellation ==

Customers may cancel while an order is pending, on-hold or processing. The
allowed list can be changed with the `tcs_auth_cancellable_statuses` filter.
Cancelling records an order note with the reason and fires
`tcs_auth_order_cancelled` for any follow-up (refund automation, alerts).

Cancelling does not refund automatically — refunds stay a manual decision in
WooCommerce or Razorpay.

== Changelog ==

= 1.0.0 =
* First release: register, login, password reset, profile, orders, order
  timeline, cancellation, guest-order linking.
