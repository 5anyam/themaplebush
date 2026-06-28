import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CK = process.env.CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7';
const CS = process.env.CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, first_name, last_name } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const auth = Buffer.from(`${CK}:${CS}`).toString('base64');

    const res = await fetch(`${WC_BASE}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: first_name || '',
        last_name: last_name || '',
      }),
    });

    const data = await res.json();
    console.log('[register] WC response status:', res.status, '| code:', data?.code);

    if (!res.ok) {
      const code: string = data.code || '';
      if (code.includes('email-exists') || code.includes('email_exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please login instead.' }, { status: 409 });
      }
      if (code.includes('username-exists') || code.includes('username_exists')) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another.' }, { status: 409 });
      }
      // If WC customers endpoint fails, try custom plugin register endpoint
      if (res.status === 404 || code === 'rest_no_route') {
        return await registerViaPlugin({ username, email, password, first_name, last_name });
      }
      return NextResponse.json({ error: data.message || 'Registration failed. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        username: data.username,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      },
    });
  } catch (err) {
    console.error('[register] error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

async function registerViaPlugin(data: {
  username: string; email: string; password: string;
  first_name: string; last_name: string;
}) {
  try {
    const res = await fetch('https://cms.kdbookbazaar.com/wp-json/custom-api/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    console.log('[register] plugin fallback status:', res.status, result);

    if (!res.ok) {
      const code: string = result.code || '';
      if (code === 'email_exists') return NextResponse.json({ error: 'An account with this email already exists. Please login instead.' }, { status: 409 });
      if (code === 'username_exists') return NextResponse.json({ error: 'This username is already taken. Please choose another.' }, { status: 409 });
      return NextResponse.json({ error: result.message || 'Registration failed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.data?.id,
        email: result.data?.email || data.email,
        username: result.data?.username || data.username,
        first_name: result.data?.first_name || data.first_name,
        last_name: result.data?.last_name || data.last_name,
      },
    });
  } catch {
    return NextResponse.json({
      error: 'Registration is temporarily unavailable. Please contact support at support@kdbookbazaar.com',
    }, { status: 503 });
  }
}
