// src/app/api/paypal/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAccessToken, PAYPAL_API } from "../../../../lib/paypal/paypal";

interface Item {
  price: number;
  description: string;
  email?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { item } = (await req.json()) as { item?: Item };

    if (!item?.price || !item.description) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    /* 1. OAuth token (throws if credentials wrong) */
    const accessToken = await getAccessToken();
    console.log("[paypal] token OK length =", accessToken.length);

    /* 2. Create order */
    const { data: order } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: item.price.toFixed(2) },
            description: item.description,
            custom_id: item.email ?? "NoEmail",
            invoice_id: `INV-${Date.now()}`,
            note_to_payee: item.notes ?? "",
          },
        ],
        application_context: {
          brand_name: "iTV",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paymentsuccess`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paymentfailed`,
        },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const approval = order.links?.find((l: any) => l.rel === "approve")?.href;
    if (!approval) {
      return NextResponse.json(
        { error: "Approve URL missing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: order.id, approvalUrl: approval });
  } catch (err: any) {
    console.error("PayPal create-order error:", err?.response?.data || err);
    return NextResponse.json(
      { error: err.message || "PayPal create-order failed" },
      { status: 500 }
    );
  }
}
