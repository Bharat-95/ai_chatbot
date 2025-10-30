import { NextResponse } from "next/server";
import Razorpay from "razorpay";


const ALLOWED_CURRENCIES = new Set(["INR", "USD"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "USD", receipt } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // 🔑 Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

       const currencyCode = String(currency).toUpperCase();
    if (!ALLOWED_CURRENCIES.has(currencyCode)) {
      return NextResponse.json(
        { error: `Unsupported currency: ${currencyCode}. Allowed: ${[...ALLOWED_CURRENCIES].join(", ")}` },
        { status: 400 }
      );
    }
 const major = Number.parseFloat(amount);
    const minorAmount = Math.round(major * 100); 
    // 🔹 Create an order
    const options = {
      amount: amount,
      currency: currencyCode,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("Razorpay Order Error:", err);
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}
