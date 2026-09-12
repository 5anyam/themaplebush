// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '../../../../../lib/tcsAccounts';

export async function POST() {
  return clearSessionCookie(NextResponse.json({ success: true }));
}
