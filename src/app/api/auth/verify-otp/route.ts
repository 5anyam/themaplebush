import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_JWT_SECRET || 'kdbookbazaar-otp-secret';
const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

interface WCCustomer {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  billing?: { phone?: string };
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, token } = await req.json();

    if (!phone || !otp || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signed OTP token
    let payload: { phone: string; otp: string };
    try {
      payload = jwt.verify(token, OTP_SECRET) as { phone: string; otp: string };
    } catch {
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    if (payload.phone !== phone || payload.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    const auth = wcAuth();
    let customer: WCCustomer | null = null;

    // 1. Search customers by phone in billing meta
    const searchRes = await fetch(
      `${WC_BASE}/customers?search=${encodeURIComponent(phone)}&per_page=20`,
      { headers: { Authorization: auth } }
    );
    if (searchRes.ok) {
      const list: WCCustomer[] = await searchRes.json();
      customer = list.find((c) => c.billing?.phone === phone) || null;
    }

    // 2. If not found via search, look through recent orders by billing phone
    if (!customer) {
      const ordersRes = await fetch(
        `${WC_BASE}/orders?billing_phone=${encodeURIComponent(phone)}&per_page=5&orderby=date&order=desc`,
        { headers: { Authorization: auth } }
      );
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        for (const order of orders) {
          if (order.customer_id && order.customer_id > 0) {
            const custRes = await fetch(`${WC_BASE}/customers/${order.customer_id}`, {
              headers: { Authorization: auth },
            });
            if (custRes.ok) {
              customer = await custRes.json();
              break;
            }
          }
        }
      }
    }

    // 3. Create new WooCommerce customer if still not found
    if (!customer) {
      const generatedEmail = `${phone}@phone.kdbookbazaar.com`;
      const createRes = await fetch(`${WC_BASE}/customers`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: generatedEmail,
          username: `kdb_${phone}`,
          first_name: '',
          last_name: '',
          billing: { phone },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        // Could already exist — try fetching by that generated email
        if (errText.includes('registration-error-email-exists') || errText.includes('username-exists')) {
          const emailSearchRes = await fetch(
            `${WC_BASE}/customers?email=${encodeURIComponent(generatedEmail)}`,
            { headers: { Authorization: auth } }
          );
          if (emailSearchRes.ok) {
            const found: WCCustomer[] = await emailSearchRes.json();
            if (found.length > 0) customer = found[0];
          }
        }
        if (!customer) {
          throw new Error('Unable to create or find account. Please contact support.');
        }
      } else {
        customer = await createRes.json();
      }
    }

    if (!customer) {
      throw new Error('Unable to authenticate. Please try again.');
    }

    const isPhoneAccount = customer.email?.endsWith('@phone.kdbookbazaar.com');

    return NextResponse.json({
      success: true,
      user: {
        id: customer.id,
        email: isPhoneAccount ? '' : customer.email,
        username: customer.username,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone,
      },
    });
  } catch (error) {
    console.error('[OTP] verify-otp error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
