"use client";

import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
// pages/payment-failed.tsx

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import SomethingWentWrong from "./subscription_not_found";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");


  useEffect(() => {
    // Log the subscription ID to the console for debugging
    const updatePaymentStatus = async () => {
      if (subscriptionId) {
        if (subscriptionId) {
          await supabaseBrowser
            .from("user_subscription")
            .update({
              status: "payment_failed", // e.g., "2025-07-05T15:41:23.123Z"
            })
            .eq("id", subscriptionId)
            .select()
            .single();
        }
      }
    };
    if (subscriptionId) {
      updatePaymentStatus();
    }
  }, [subscriptionId]);

  return (
    <>
      {subscriptionId ? (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 max-w-md w-full text-center">
            <XCircle className="text-red-500 mx-auto mb-4" size={60} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Oops! Something went wrong with your transaction. Please try again
              or contact support.
            </p>
            <Link
              href="/dashboard/subscription"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
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
