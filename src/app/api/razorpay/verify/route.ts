// app/api/razorpay/verify/route.ts
//
// Verifies that a payment callback really came from Razorpay before the
// WooCommerce order is marked as paid. Razorpay signs `order_id|payment_id`
// with the key secret, so recomputing the HMAC here is the only way to tell a
// genuine success callback apart from one a user typed into the console.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: NextRequest) {
  if (!KEY_SECRET) {
    console.error("[RZP] Missing RAZORPAY_KEY_SECRET");
    return NextResponse.json({ valid: false, error: "Payment gateway is not configured" }, { status: 500 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      (await request.json()) as VerifyBody;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ valid: false, error: "Incomplete payment details" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Both digests are hex of the same length, so a length mismatch here means
    // the signature was malformed rather than merely wrong.
    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(razorpay_signature, "utf8");
    const valid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!valid) {
      console.warn("[RZP] Signature mismatch for order", razorpay_order_id);
      return NextResponse.json({ valid: false, error: "Payment could not be verified" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[RZP] Verify error:", error);
    return NextResponse.json({ valid: false, error: "Payment could not be verified" }, { status: 500 });
  }
}
