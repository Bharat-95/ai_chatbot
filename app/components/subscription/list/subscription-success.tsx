"use client";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import SomethingWentWrong from "./subscription_not_found";

const callWebhook = async (payload: any) => {
  try {

    console.log("payload", payload)
    const res = await fetch(
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_NEW_SUBSCRIPTION_WEBHOOK,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("Webhook call failed:", res.statusText);
    }
  } catch (err) {
    console.error("Error calling webhook:", err);
  }
};

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const ranOnce = useRef(false); // ensure effect runs only once

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!subscriptionId) return;

      try {
        // 1️⃣ Update subscription status
        const { data: subscriptionData, error: subscriptionError } =
          await supabaseBrowser
            .from("user_subscription")
            .update({
              is_active: true,
              status: "payment_successful",
            })
            .eq("id", subscriptionId)
            .select("*, subscription(*)")
            .single();

        if (subscriptionError || !subscriptionData) {
          console.error("Error updating subscription:", subscriptionError);
          return;
        }

        let expiryDate = new Date();

        if (subscriptionData.subscription?.plan_name === "Foundation Pack") {
          expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
        } else {
          expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month
        }

        await supabaseBrowser
          .from("users")
          .update({
            subscription: subscriptionData.subscription?.plan_name,
            fb_chatbot_subscription_name:
              subscriptionData.subscription?.plan_name,
            fb_chatbot_subscription_active: true,
            fb_chatbot_subscription_expiry_date: expiryDate.toISOString(),
            fb_chatbot_trail_start_date: null,
            fb_chatbot_trail_expiry_date: null,
            fb_chatbot_trail_active: false,
          })
          .eq("id", subscriptionData.user_id);

        await supabaseBrowser
          .from("user_subscription")
          .update({ is_active: false, status: "payment_failed" })
          .eq("user_id", subscriptionData.user_id)
          .neq("id", subscriptionData.id) // keep the new one active
          .eq("is_active", true);

        const { data: existingInvoice } = await supabaseBrowser
          .from("invoice")
          .select("*")
          .eq("invoiceId", subscriptionData.payment_id || subscriptionData.id)
          .maybeSingle();

        if (!existingInvoice) {
          const invoicePayload = {
            invoiceId: subscriptionData.payment_id || subscriptionData.id,
            dateOfSale: new Date().toISOString(),
            plan_name: subscriptionData.subscription?.plan_name,
            amount: subscriptionData.amount,
            salesName: subscriptionData.user_id,
          };

          const { data: invoiceData, error: invoiceError } =
            await supabaseBrowser
              .from("invoice")
              .insert([invoicePayload])
              .select("*")
              .single();

          if (invoiceError) {
            console.error("Error creating invoice:", invoiceError);
          } else {
            console.log("Invoice created:", invoiceData);

            const { data: subscriptionData, error: subscriptionError } =
              await supabaseBrowser
                .from("user_subscription")
                .update({
                  is_active: true,
                  status: "payment_successful",
                })
                .eq("id", subscriptionId)
                .select("*, subscription(*), users(*)")
                .single();

            await callWebhook({
              userId: subscriptionData.user_id,
              subscriptionId: subscriptionData.id,
              planId: subscriptionData.subscription_id,
              planName: subscriptionData.subscription?.plan_name,
              amount: subscriptionData.amount,
              startDate: subscriptionData.start_date,
              endDate: subscriptionData.end_date,
                user: subscriptionData.users, 
            });
          }
        } else {
          console.log("Invoice already exists for this subscription");
        }
      } catch (err) {
        console.error("PaymentSuccess Error:", err);
      }
    };

    if (!ranOnce.current) {
      ranOnce.current = true;
      updatePaymentStatus();
    }
  }, [subscriptionId]);

  return (
    <>
      {subscriptionId ? (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 max-w-md w-full text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={60} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Thank you for your purchase. Your transaction has been completed
              successfully.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Go to Home
            </Link>
          </div>
        </div>
      ) : (
        <SomethingWentWrong />
      )}
    </>
  );
}
