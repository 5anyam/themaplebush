// app/api/auth/login/route.ts
//
// Signs the shopper in against the Customer Accounts plugin and stores the
// returned token in an httpOnly cookie. The browser never sees the token.

import { NextRequest, NextResponse } from 'next/server';
import { accounts, setSessionCookie, errorResponse } from '../../../../../lib/tcsAccounts';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please enter your email and password.' },
        { status: 400 }
      );
    }

    const { token, expires, user } = await accounts.login(String(username), String(password));

    // Pick up any guest orders placed with this email before the account existed.
    try { await accounts.linkOrders(token); } catch { /* non-fatal */ }

    const res = NextResponse.json({ success: true, user });
    return setSessionCookie(res, token, expires);
  } catch (err) {
    return errorResponse(err);
  }
}
