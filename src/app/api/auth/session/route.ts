// app/api/auth/session/route.ts
//
// Who is signed in? Identity comes from the signed token, never from anything
// the browser can edit, so this is the only trustworthy source for the client.

import { NextResponse } from 'next/server';
import { accounts, getSessionToken, clearSessionCookie } from '../../../../../lib/tcsAccounts';

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ user: null });

  try {
    const { user } = await accounts.me(token);
    return NextResponse.json({ user });
  } catch {
    // Expired or invalidated (e.g. after a password change) — drop the cookie
    // so the client stops thinking it has a session.
    return clearSessionCookie(NextResponse.json({ user: null }));
  }
}
