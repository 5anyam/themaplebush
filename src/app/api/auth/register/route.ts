// app/api/auth/register/route.ts
//
// Creates the account and signs the shopper straight in.

import { NextRequest, NextResponse } from 'next/server';
import { accounts, setSessionCookie, errorResponse } from '../../../../../lib/tcsAccounts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { token, expires, user, linked_orders } = await accounts.register({
      email,
      password,
      first_name: String(body.first_name || '').trim(),
      last_name: String(body.last_name || '').trim(),
      phone: String(body.phone || '').trim(),
      username: String(body.username || '').trim() || undefined,
    });

    const res = NextResponse.json({ success: true, user, linked_orders });
    return setSessionCookie(res, token, expires);
  } catch (err) {
    return errorResponse(err);
  }
}
