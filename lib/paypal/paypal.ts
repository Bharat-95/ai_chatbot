// lib/paypal.ts
import axios from "axios";

export const PAYPAL_API =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"; // ← sandbox by default

// --------------------------------------------------------------------------------
// OAuth helper – returns a bearer token
// --------------------------------------------------------------------------------
export async function getAccessToken(): Promise<string> {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials missing in env");
  }

  // Basic-auth string
  const credentials = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  // Typed response: { access_token: string; token_type: "Bearer"; expires_in: number; … }
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

  return data.access_token;           // <— strongly typed string
}
