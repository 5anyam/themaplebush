import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const OTP_SECRET = process.env.OTP_JWT_SECRET || 'kdbookbazaar-otp-secret';
const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ phone, otp }, OTP_SECRET, { expiresIn: '10m' });

    // Send OTP via Fast2SMS
    const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: FAST2SMS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables_values: otp,
        route: 'otp',
        numbers: phone,
      }),
    });

    const smsData = await smsRes.json();

    if (!smsData.return) {
      console.error('[OTP] Fast2SMS error:', smsData);
      throw new Error(smsData.message?.[0] || 'Failed to send OTP. Please try again.');
    }

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('[OTP] send-otp error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
