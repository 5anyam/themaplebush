// app/api/auth/forgot-password/route.ts
//
// Asks WordPress to send its reset email. The reply never reveals whether the
// address has an account.

import { NextRequest, NextResponse } from 'next/server';
import { accounts, errorResponse } from '../../../../../lib/tcsAccounts';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const data = await accounts.forgotPassword(String(email || '').trim());
    return NextResponse.json({ success: true, message: data.message });
  } catch (err) {
    return errorResponse(err);
  }
}
