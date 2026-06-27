import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

const REFUNDABLE_STATUSES = ['completed', 'processing'];

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId, reason } = await req.json();

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

    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `Refund cannot be requested for this order (status: ${order.status}).` },
        { status: 400 }
      );
    }

    const noteText = `REFUND REQUEST\nCustomer requested a refund.\nReason: ${reason || 'Not specified'}\nOrder Total: ₹${order.total}`;

    // Add internal note to order
    const noteRes = await fetch(`${WC_BASE}/orders/${orderId}/notes`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: noteText,
        customer_note: false,
        added_by_user: false,
      }),
    });

    if (!noteRes.ok) {
      const err = await noteRes.text();
      throw new Error('Failed to submit refund request: ' + err);
    }

    // Add customer-visible note
    await fetch(`${WC_BASE}/orders/${orderId}/notes`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: 'Your refund request has been received. Our team will review it within 2-3 business days and contact you at your registered email/phone.',
        customer_note: true,
      }),
    });

    return NextResponse.json({ success: true, message: 'Refund request submitted successfully.' });
  } catch (error) {
    console.error('[Orders] refund error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit refund request' },
      { status: 500 }
    );
  }
}
