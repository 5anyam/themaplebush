// app/api/products/[id]/variations/route.ts
//
// Proxies WooCommerce product variations.
//
// The browser used to call WooCommerce directly for these. Two problems with
// that: the request carried the consumer key and secret in the query string
// (visible in devtools, proxy logs and the site's access logs), and it set a
// Content-Type header on a GET, which makes it a non-simple CORS request. The
// site answers the resulting OPTIONS preflight with no access-control headers,
// so the browser discarded every response and the variation selector always
// came up empty.
//
// Fetching from the server side-steps both: same-origin for the browser, and
// the credentials never leave this process.

import { NextResponse } from 'next/server';

const WC_BASE = (process.env.API_BASE || 'https://cms.thecurioshelf.com/wp-json/wc/v3').replace(/\/$/, '');
const CK = process.env.CONSUMER_KEY || process.env.NEXT_PUBLIC_CONSUMER_KEY || '';
const CS = process.env.CONSUMER_SECRET || process.env.NEXT_PUBLIC_CONSUMER_SECRET || '';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  // No credentials means the deployment is missing its env vars. Say so plainly
  // instead of passing empty auth to WooCommerce and surfacing a bare 401.
  if (!CK || !CS) {
    console.error('[variations] CONSUMER_KEY / CONSUMER_SECRET are not set in this environment');
    return NextResponse.json(
      { error: 'Store credentials are not configured on the server' },
      { status: 503 }
    );
  }

  try {
    const url = `${WC_BASE}/products/${productId}/variations?per_page=100`;
    const res = await fetch(url, {
      headers: { Authorization: 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64') },
      // Variations change with stock, so don't serve a stale list for long.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // A simple product has no variations endpoint; an empty list is the
      // right answer for the caller rather than an error.
      if (res.status === 404) return NextResponse.json([]);
      if (res.status === 401) {
        console.error('[variations] WooCommerce rejected the credentials (401). Check CONSUMER_KEY / CONSUMER_SECRET.');
        return NextResponse.json({ error: 'Store credentials were rejected' }, { status: 503 });
      }
      console.error('[variations] WooCommerce returned', res.status, 'for product', productId);
      return NextResponse.json({ error: 'Could not load options' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('[variations] fetch failed:', error);
    return NextResponse.json({ error: 'Could not load options' }, { status: 502 });
  }
}
