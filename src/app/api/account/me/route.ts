// app/api/account/me/route.ts — read and update the signed-in customer.

import { NextRequest, NextResponse } from 'next/server';
import { accounts, getSessionToken, errorResponse } from '../../../../../lib/tcsAccounts';

const UNAUTHENTICATED = NextResponse.json(
  { success: false, message: 'Please sign in to continue.' },
  { status: 401 }
);

export async function GET() {
  const token = await getSessionToken();
  if (!token) return UNAUTHENTICATED;

  try {
    const { user } = await accounts.me(token);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return UNAUTHENTICATED;

  try {
    const body = await req.json();

    // Only these fields are accepted; the account email is intentionally not
    // editable, since it decides which guest orders the account can claim.
    const allowed = [
      'first_name', 'last_name', 'company',
      'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone',
    ] as const;

    const payload: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) payload[key] = String(body[key]);
    }

    const { user } = await accounts.updateMe(token, payload);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return errorResponse(err);
  }
}
