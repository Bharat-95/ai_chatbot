// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

  const origin = req.headers.get("origin") || "http://localhost:3000";

  try {
    const { amount, user_id, plan_id } = await req.json();


    // Validate request body
    if (!amount || !user_id || !plan_id) {
      return NextResponse.json(
        { error: "Missing required fields: amount, user_id, or plan_id" },
        { status: 400 }
      );
    }

    // Get OAuth token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(`Failed to get PayPal token: ${tokenData.error_description || "Unknown error"}`);
    }

    // Create PayPal order
    const orderRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: parseFloat(amount).toFixed(2),
            },
            custom_id: `${user_id}_${plan_id}`,
          },
        ],
        application_context: {
          brand_name: "FB - MARKERPLACE-BOT",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${origin}/dashboard/subscription-buy/success?subscription_id=${plan_id}`,
          cancel_url: `${origin}/dashboard/subscription-buy/cancel?subscription_id=${plan_id}`,
        },
      }),
    });

    const orderData = await orderRes.json();


    if (!orderRes.ok) {
      throw new Error(`Failed to create PayPal order: ${orderData.details?.[0]?.description || "Unknown error"}`);
    }

    const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;
    const paymentId = orderData.id;

    console.log(paymentId)

    if (!approvalUrl) {
      throw new Error("No approval URL returned from PayPal");
    }

    return NextResponse.json({ approvalUrl, paymentId });
  } catch (err: any) {
    console.error("PayPal Error:", err);
    return NextResponse.json({ error: `Failed to create PayPal order: ${err.message}` }, { status: 500 });
  }
}