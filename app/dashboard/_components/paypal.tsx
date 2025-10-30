"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import axios from "axios";

interface PayNowProps {
  /** Amount in USD, e.g. 19.99 */
  price: number;
  /** Human-readable item description shown in PayPal UI */
  description: string;
}

export default function PayNow({ price, description }: PayNowProps) {
  const [paid, setPaid]     = useState(false);
  const [error, setError]   = useState("");
  const [isBusy, setBusy]   = useState(false);

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, 
        currency: "USD",
      }}
    >
      {paid ? (
        <p className="text-green-600">✅ Thanks — payment completed!</p>
      ) : (
        <PayPalButtons
          style={{ layout: "horizontal" }}
          disabled={isBusy}
          createOrder={async () => {
            setBusy(true);
            try {
              const { data } = await axios.post<{ id: string }>("/api/paypal/payment", {
                item: { price, description },
              });
              return data.id; // orderID
            } catch (err) {
              setError("Could not create PayPal order");
              console.error(err);
              throw err;
            } finally {
              setBusy(false);
            }
          }}
          onApprove={async ({ orderID }) => {
            try {
              await axios.post("/api/paypal/get-session", { orderID });
              setPaid(true);
            } catch (err) {
              setError("Payment capture failed");
              console.error(err);
            }
          }}
          onError={(err) => {
            console.error(err);
            setError("Payment error — check console");
          }}
          onCancel={() => setError("Payment cancelled")}
        />
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </PayPalScriptProvider>
  );
}
