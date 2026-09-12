// app/api/account/orders/route.ts — the signed-in customer's orders.

import { NextRequest, NextResponse } from 'next/server';
import { accounts, getSessionToken, errorResponse } from '../../../../../lib/tcsAccounts';

export async function GET(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Please sign in to continue.' }, { status: 401 });
  }

  try {
    const page = Number(req.nextUrl.searchParams.get('page') || 1);
    const data = await accounts.orders(token, Number.isFinite(page) && page > 0 ? page : 1);
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return errorResponse(err);
  }
}
