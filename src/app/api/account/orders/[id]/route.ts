// app/api/account/orders/[id]/route.ts — one order, with its timeline.
//
// Ownership is enforced by the plugin against the token, so a shopper cannot
// read another customer's order by guessing an id.

import { NextResponse } from 'next/server';
import { accounts, getSessionToken, errorResponse } from '../../../../../../lib/tcsAccounts';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Please sign in to continue.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { order } = await accounts.order(token, Number(id));
    return NextResponse.json({ success: true, order });
  } catch (err) {
    return errorResponse(err);
  }
}
