import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = 'https://cms.thecurioshelf.com/wp-json/wc/v3';
const WP_BASE = 'https://cms.thecurioshelf.com/wp-json/custom-api/v1';
const CK = process.env.CONSUMER_KEY || 'ck_d192213ab2889dc1f8d5a03491a2b1af8b5d0ec8';
const CS = process.env.CONSUMER_SECRET || 'cs_545794f655a7bf793ff45df324118c96a8713af2';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');
}

// Try the site's existing custom login endpoint
async function tryCustomLogin(username: string, password: string) {
  try {
    const res = await fetch(`${WP_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json() as Record<string, unknown>;
    console.log('[login] custom-api/v1/login status:', res.status, '| data:', JSON.stringify(data));

    if (!res.ok) return null;

    // Format A: {success: true, data: {id, email, username, ...}}
    if (data.success === true && data.data && typeof data.data === 'object') {
      const d = data.data as Record<string, unknown>;
      return {
        id: Number(d.id) || 0,
        email: String(d.email || ''),
        username: String(d.username || d.user_login || ''),
        first_name: String(d.first_name || ''),
        last_name: String(d.last_name || ''),
        token: String(d.token || ''),
      };
    }

    // Format B: JWT Auth – {token, user_email, user_nicename, user_display_name}
    if (data.token && data.user_email) {
      return {
        id: Number(data.user_id) || 0,
        email: String(data.user_email),
        username: String(data.user_nicename || data.user_email),
        first_name: String(data.user_display_name || ''),
        last_name: '',
        token: String(data.token),
      };
    }

    // Format C: {success:true, token, user_id, user_email}
    if (data.success === true && data.token) {
      return {
        id: Number(data.user_id || data.id) || 0,
        email: String(data.user_email || data.email || ''),
        username: String(data.username || data.user_login || data.user_nicename || ''),
        first_name: String(data.first_name || data.display_name || ''),
        last_name: String(data.last_name || ''),
        token: String(data.token),
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Fallback: use the simpler verify-credentials endpoint + WC API for user data
async function tryVerifyCredentials(username: string, password: string) {
  try {
    const res = await fetch(`${WP_BASE}/verify-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json() as Record<string, unknown>;
    console.log('[login] verify-credentials status:', res.status, '| verified:', data?.verified);

    if (!res.ok || !data.verified) return null;

    return {
      id: Number(data.user_id) || 0,
      email: String(data.user_email || ''),
      username: String(data.user_login || username),
      first_name: String(data.first_name || data.display_name || ''),
      last_name: String(data.last_name || ''),
      token: '',
    };
  } catch {
    return null;
  }
}

// Enrich user data from WooCommerce (fills missing id, first_name, last_name, etc.)
async function enrichFromWC(user: {
  id: number; email: string; username: string;
  first_name: string; last_name: string; token: string;
}) {
  if (user.id && user.first_name) return user;
  try {
    const searchRes = await fetch(
      `${WC_BASE}/customers?email=${encodeURIComponent(user.email)}&per_page=1`,
      { headers: { Authorization: wcAuth() } }
    );
    if (!searchRes.ok) return user;
    const customers = await searchRes.json() as Array<{
      id?: number; username?: string; first_name?: string; last_name?: string;
    }>;
    if (!Array.isArray(customers) || customers.length === 0) return user;
    const c = customers[0];
    return {
      ...user,
      id: user.id || c.id || 0,
      username: user.username || c.username || user.username,
      first_name: user.first_name || c.first_name || '',
      last_name: user.last_name || c.last_name || '',
    };
  } catch {
    return user;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Please enter username/email and password.' }, { status: 400 });
    }

    // If email entered, resolve to WordPress username first
    let loginUsername = username;
    if (username.includes('@')) {
      try {
        const searchRes = await fetch(
          `${WC_BASE}/customers?email=${encodeURIComponent(username)}&per_page=1`,
          { headers: { Authorization: wcAuth() } }
        );
        if (searchRes.ok) {
          const customers = await searchRes.json() as Array<{ username?: string }>;
          if (Array.isArray(customers) && customers.length > 0 && customers[0].username) {
            loginUsername = customers[0].username;
            console.log('[login] email → username:', loginUsername);
          }
        }
      } catch { /* keep original */ }
    }

    // Try primary login endpoint first
    let user = await tryCustomLogin(loginUsername, password);

    // Fallback to verify-credentials (simpler WP endpoint, always works)
    if (!user) {
      user = await tryVerifyCredentials(loginUsername, password);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Login failed. Please check your username and password, then try again.' },
        { status: 401 }
      );
    }

    // Enrich with WC customer data if needed
    user = await enrichFromWC(user);

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (err) {
    console.error('[login] unexpected error:', err);
    return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 });
  }
}
