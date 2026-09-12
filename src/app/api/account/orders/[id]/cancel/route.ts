// app/api/account/orders/[id]/cancel/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { accounts, getSessionToken, errorResponse } from '../../../../../../../lib/tcsAccounts';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Please sign in to continue.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    let reason = '';
    try {
      const body = await req.json();
      reason = String(body?.reason || '');
    } catch { /* body is optional */ }

    const { order } = await accounts.cancelOrder(token, Number(id), reason);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    return errorResponse(err);
  }
}
