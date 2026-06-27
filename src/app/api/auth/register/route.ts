import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.kdbookbazaar.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.CONSUMER_KEY || process.env.NEXT_PUBLIC_CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET || process.env.NEXT_PUBLIC_CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, first_name, last_name } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Create customer in WooCommerce — this creates a real WordPress user
    const res = await fetch(`${WC_BASE}/customers`, {
      method: 'POST',
      headers: {
        Authorization: wcAuth(),
        'Content-Type': 'application/json',
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

    if (!res.ok) {
      // Map WooCommerce error codes to friendly messages
      const code: string = data.code || '';
      if (code === 'registration-error-email-exists' || code.includes('email-exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please login instead.' }, { status: 409 });
      }
      if (code === 'registration-error-username-exists' || code.includes('username-exists')) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another one.' }, { status: 409 });
      }
      return NextResponse.json({ error: data.message || 'Registration failed. Please try again.' }, { status: 400 });
    }

    // Auto-login using custom WordPress plugin endpoint
    const loginRes = await fetch('https://cms.kdbookbazaar.com/wp-json/custom-api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok || !loginData.success) {
      // Account was created but auto-login failed — still a success, user can login manually
      return NextResponse.json({
        success: true,
        user: {
          id: data.id,
          email: data.email,
          username: data.username,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        },
        token: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: loginData.data.id,
        email: loginData.data.email,
        username: loginData.data.username,
        first_name: loginData.data.first_name || '',
        last_name: loginData.data.last_name || '',
      },
      token: loginData.data.token,
    });
  } catch (error) {
    console.error('[Auth] register error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
