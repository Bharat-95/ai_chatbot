// pages/api/paypal/get-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// ─────────────────────────────────────────────────────────
// ENV + constants
// ─────────────────────────────────────────────────────────
const PAYPAL_CLIENT_ID  = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Switch between live & sandbox:
export const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ─────────────────────────────────────────────────────────
// Utility: fetch OAuth2 token
// ─────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post<{ access_token: string }>(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data.access_token;
}

// ─────────────────────────────────────────────────────────
// API handler
// ─────────────────────────────────────────────────────────
interface SuccessResp {
  success: true;
  orderDetails: unknown;     // ⚠️ replace “unknown” with your own type if desired
  orderStatus: string;
}
interface ErrorResp {
  success: false;
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResp | ErrorResp>
) {
  if (req.method !== "POST") return res.status(405).end();

  const { orderID } = req.body as { orderID?: string };

  if (!orderID)
    return res.status(400).json({ success: false, error: "Missing order ID" });

  try {
    const accessToken = await getAccessToken();

    // ─ Step 1: Get Order Details
    const { data: orderDetails } = await axios.get(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return res.status(200).json({
      success: true,
      orderDetails,
      orderStatus: orderDetails.status,
    });
  } catch (error: any) {
    console.error(
      "PayPal Get Order Error:",
      error?.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve order details",
    });
  }
}
