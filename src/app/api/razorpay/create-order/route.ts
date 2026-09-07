// app/api/razorpay/create-order/route.ts
//
// Creates a Razorpay Order server-side. The browser must never see the key
// secret, so the amount is bound to an order id here and the checkout modal is
// opened against that id. Without an order id a payment cannot be verified
// afterwards, which is what makes the callback spoofable.

import { NextRequest, NextResponse } from "next/server";

const RAZORPAY_API = "https://api.razorpay.com/v1/orders";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

interface CreateOrderBody {
  /** Amount in rupees. Converted to paise here so the client cannot round it. */
  amount: number;
  /** Our own WooCommerce order id, used as the Razorpay receipt. */
  receipt?: string;
  notes?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  if (!KEY_ID || !KEY_SECRET) {
    console.error("[RZP] Missing NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
    return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 500 });
  }

  try {
    const body = (await request.json()) as CreateOrderBody;
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

    const response = await fetch(RAZORPAY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        // Razorpay works in paise, and rejects fractional values.
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: body.receipt ? String(body.receipt).slice(0, 40) : undefined,
        notes: body.notes ?? {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[RZP] Order creation failed:", data);
      return NextResponse.json(
        { error: data?.error?.description || "Could not start the payment" },
        { status: response.status }
      );
    }

    // Only the fields the browser actually needs.
    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    console.error("[RZP] Create order error:", error);
    return NextResponse.json({ error: "Could not start the payment" }, { status: 500 });
  }
}
