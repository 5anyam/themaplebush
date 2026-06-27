import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

const CANCELABLE_STATUSES = ['pending', 'processing', 'on-hold'];

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Missing orderId or userId' }, { status: 400 });
    }

    const auth = wcAuth();

    // Fetch order and verify ownership
    const orderRes = await fetch(`${WC_BASE}/orders/${orderId}`, {
      headers: { Authorization: auth },
    });
    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = await orderRes.json();

    if (order.customer_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `This order cannot be cancelled (status: ${order.status}). Please contact support.` },
        { status: 400 }
      );
    }

    // Cancel the order
    const updateRes = await fetch(`${WC_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'cancelled',
        customer_note: 'Order cancelled by customer.',
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error('Failed to cancel order: ' + err);
    }

    const updated = await updateRes.json();
    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('[Orders] cancel error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
