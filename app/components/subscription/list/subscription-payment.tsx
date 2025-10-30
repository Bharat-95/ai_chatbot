"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { showToast } from "../../../../hooks/useToast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubscriptionPayment({
  selectedSubscription,
  handleCancelPayment,
  setPaymentMethod,
}: {
  selectedSubscription: any;
  handleCancelPayment: () => void;
  setPaymentMethod: (value: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>();
  const { user } = useSelector((state: any) => state?.user);
  const [promoCode, setPromoCode] = useState("");
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);

  const [isIndia, setIsIndia] = useState(false);
  useEffect(() => {
    try {
      const tz = (
        Intl.DateTimeFormat().resolvedOptions().timeZone || ""
      ).toLowerCase();
      const lang = (navigator.language || "").toLowerCase();
      const inTZ = tz === "asia/kolkata" || tz === "asia/calcutta";
      const inLang = lang.endsWith("-in");
      setIsIndia(inTZ || inLang);
    } catch {
      setIsIndia(false);
    }
  }, []);
  const currencyCode = (
    selectedSubscription?.currency ?? (isIndia ? "INR" : "USD")
  ).toUpperCase();
  const currencySymbol = currencyCode === "INR" ? "₹" : "$";

  const baseAmount = useMemo(() => {
    const n = Number(selectedSubscription?.amount ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [selectedSubscription?.amount]);

  const discountPct = typeof discount === "number" ? discount : 0;
  const discountAmount = Number(((baseAmount * discountPct) / 100).toFixed(2));
  const discountedAmount = Number((baseAmount - discountAmount).toFixed(2));

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      return setMessage("Please enter a promo code.");
    }

    const { data, error } = await supabaseBrowser
      .from("promos")
      .select("*")
      .eq("code", promoCode.trim())
      .maybeSingle();

    if (error || !data) {
      return setMessage("Invalid or expired promo code.");
    }

    const validDate = data.valid_date;
    const validTime = data.valid_time;
    const combinedDateTimeStr = `${validDate}T${convertTo24HourFormat(
      validTime
    )}`;
    const validUntil = new Date(combinedDateTimeStr);
    const now = new Date();

    if (now > validUntil) {
      return setMessage("Promo code has expired.");
    }

    setDiscount(data.discount);
    setMessage(`Promo applied! Discount: ${data.discount}%`);
  };

  function convertTo24HourFormat(timeStr: string) {
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:00`;
    }
    return timeStr;
  }

  // helper: insert invoice record
  const insertInvoice = async (
    invoiceId: string | null,
    amount: string | number,
    provider: "paypal" | "razorpay"
  ) => {
    try {
      await supabaseBrowser.from("invoice").insert([
        {
          invoiceId: invoiceId ?? null,
          dateOfSale: new Date().toISOString(),
          plan_name: selectedSubscription?.plan_name ?? null,
          amount: String(amount ?? discountedAmount.toFixed(2)),
          salesName: user?.id ?? null,
          payment_provider: provider,
        },
      ]);
    } catch (err) {
      console.error("Failed to insert invoice:", err);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const start_date = new Date();
      const endDate = new Date(start_date);

      if (selectedSubscription?.plan_name === "Foundation Pack") {
        endDate.setDate(endDate.getDate() + 7);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const payload = {
        user_id: user?.id,
        subscription_id: selectedSubscription?.id,
        start_date: start_date.toISOString(),
        end_date: endDate.toISOString(),
        status: "payment_pending",
        amount: discountedAmount,
      };

      const { data, error } = await supabaseBrowser
        .from("user_subscription")
        .insert([payload])
        .select("*");

      if (error) {
        console.error("[user_subscription insert] error:", error);
        showToast({
          title: "Error",
          description: "Supabase insert failed.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const subscriptionRow = data?.[0];

      // ---------- PAYPAL ----------
      if (selected === "paypal") {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: subscriptionRow?.id,
            amount: discountedAmount.toFixed(2),
            currency: currencyCode,
            user_id: user?.id,
            name: user?.user_metadata?.full_name,
            email: user?.email,
          }),
        });

        const Subdata = await res.json();

        // If provider returned a payment id we update our DB and create invoice
        if (Subdata?.paymentId) {
          try {
            await supabaseBrowser
              .from("user_subscription")
              .update({
                payment_id: Subdata.paymentId,
                status: "payment_successful",
                is_active: true,
              })
              .eq("id", subscriptionRow?.id);

            // insert invoice
          await insertInvoice(Subdata.paymentId, discountedAmount.toFixed(2), "paypal");

          } catch (err) {
            console.error(
              "Error updating subscription / inserting invoice (PayPal):",
              err
            );
          }
        }

        if (Subdata?.approvalUrl) {
          // Redirect user to PayPal approval
          window.location.href = Subdata.approvalUrl;
        } else {
          showToast({
            title: "Error",
            description: "Error creating PayPal order.",
            type: "error",
          });
          setLoading(false);
        }
      }

      // ---------- RAZORPAY ----------
      if (selected === "razorpay") {
        const amountInMinor = Math.round(discountedAmount * 100);

        const res = await fetch("/api/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: subscriptionRow?.id,
            amount: amountInMinor,
            currency: currencyCode,
            user_id: user?.id,
            name: user?.user_metadata?.full_name,
            email: user?.email,
          }),
        });

        const Subdata = await res.json();

        if (!Subdata?.order?.id) {
          showToast({
            title: "Error",
            description: "Error creating Razorpay order.",
            type: "error",
          });
          setLoading(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Subdata.order.amount,
          currency: Subdata.order.currency,
          name: selectedSubscription?.plan_name || "Subscription",
          description:
            selectedSubscription?.plan_name || "Subscription purchase",
          order_id: Subdata.order.id,
          handler: async function (response: any) {
            try {
              const paymentId =
                response?.razorpay_payment_id ||
                response?.razorpay_paymentid ||
                null;

              if (paymentId) {
                // update user_subscription and insert invoice (same behavior as PayPal)
                await supabaseBrowser
                  .from("user_subscription")
                  .update({
                    payment_id: paymentId,
                    status: "payment_successful",
                    is_active: true,
                  })
                  .eq("id", subscriptionRow?.id);

              await insertInvoice(paymentId, discountedAmount.toFixed(2), "razorpay");


                showToast({
                  title: "Success",
                  description: "Payment successful! Subscription activated.",
                  type: "success",
                });

                setLoading(false);

                // Redirect to dashboard
                router.push("/dashboard/subscription");
              } else {
                // no payment id returned
                await supabaseBrowser
                  .from("user_subscription")
                  .update({ status: "payment_pending" })
                  .eq("id", subscriptionRow?.id);

                showToast({
                  title: "Warning",
                  description:
                    "Payment attempted but no payment id returned. Please contact support.",
                  type: "warning",
                });
                setLoading(false);
              }
            } catch (err) {
              console.error("Razorpay handler error:", err);
              showToast({
                title: "Error",
                description: "Error recording payment.",
                type: "error",
              });
              setLoading(false);
            }
          },
          prefill: {
            name: user?.user_metadata?.full_name,
            email: user?.email,
          },
          theme: { color: "#3399cc" },
          modal: {
            ondismiss: function () {
              setLoading(false);
              showToast({
                title: "Info",
                description: "Payment cancelled by user.",
                type: "info",
              });
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      showToast({
        title: "Error",
        description: "Error creating session.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const ALL_OPTIONS = [
    {
      id: "paypal",
      label: "PayPal",
      img: "https://www.paypalobjects.com/webstatic/icon/pp258.png",
      alt: "PayPal logo",
    },
    {
      id: "razorpay",
      label: "Razorpay",
      img: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
      alt: "Razorpay logo",
    },
  ] as const;

  const visibleOptions = isIndia
    ? ALL_OPTIONS.filter((o) => o.id === "razorpay")
    : ALL_OPTIONS;

  useEffect(() => {
    if (isIndia && selected === "paypal") {
      setSelected("razorpay");
    }
  }, [isIndia, selected]);

  return (
    <main className="bg-white text-[#111827] min-h-screen flex flex-col px-4 sm:px-8 py-6">
      <nav className="text-sm text-gray-500 mb-4 select-none">
        <Link
          href="/dashboard/subscription"
          className="hover:text-[#9966cc] cursor-pointer hover:underline"
        >
          <ArrowLeft
            className="inline-block cursor-pointer mr-2"
            size={20}
            onClick={() => setPaymentMethod(false)}
          />
          Subscription
        </Link>
        <span className="mx-2">&gt;</span>
        <Link
          href="/dashboard/subscription-buy"
          className="hover:text-[#9966cc] cursor-pointer hover:underline"
          onClick={() => setPaymentMethod(false)}
        >
          Plan
        </Link>
        <span className="mx-2">&gt;</span>
        <a href="#" className="text-[#9966cc] font-semibold hover:underline">
          Payment
        </a>
      </nav>

      <section className="max-w-2xl w-full mx-auto">
        <h2 className="text-gray-900 font-semibold text-lg mb-4 select-none">
          Choose Payment Method
        </h2>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
            <tbody>
              <tr className="border-b border-b-gray-300 hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-700">
                  Selected Plan
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {selectedSubscription?.plan_name}
                </td>
              </tr>
              <tr className="border-b border-b-gray-300 hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-700">
                  Amount to Pay
                </td>
                <td className="px-6 py-4 text-right text-[#9966cc] font-bold text-lg">
                  {currencySymbol}
                  {Number(selectedSubscription?.amount ?? 0).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b border-b-gray-300 hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-700">
                  Amount to Pay
                </td>
                <td className="px-6 py-4 text-right text-[#9966cc] font-bold text-lg">
                  {currencySymbol}
                  {baseAmount.toFixed(2)}
                </td>
              </tr>

              {discountPct > 0 && (
                <tr className="border-b border-b-gray-300 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-700">
                    Discount{" "}
                    {promoCode
                      ? `(${promoCode} - ${discountPct}%)`
                      : `(${discountPct}%)`}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-semibold">
                    -{currencySymbol}
                    {discountAmount.toFixed(2)}
                  </td>
                </tr>
              )}

              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-700">Total</td>
                <td className="px-6 py-4 text-right text-[#9966cc] font-extrabold text-xl">
                  {currencySymbol}
                  {discountedAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center gap-2 m-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc] w-full"
            />
            <div
              onClick={() => {
                setDiscount(0);
                setPromoCode("");
                setMessage("");
              }}
              className="border-2 border-[#9966cc] hover:bg-gray-200 cursor-pointer px-4 py-2 text-sm rounded-md"
            >
              Cancel
            </div>
            <div
              onClick={handleApplyPromo}
              className="bg-[#9966cc] cursor-pointer hover:bg-[#ba98dd] text-white px-4 py-2 text-sm rounded-md"
            >
              Apply
            </div>
          </div>
          {message && (
            <p
              className={`${
                !message.includes("Discount") ? "text-red-500" : "text-[#9966cc]"
              } mt-2`}
            >
              {message}
            </p>
          )}
        </div>

        <h3 className="text-gray-900 font-semibold text-base mb-4 select-none">
          Select Payment Method
        </h3>

        <form>
          <fieldset className="flex flex-col gap-4">
            {visibleOptions.map((option: any) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex items-center gap-4 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  id={option.id}
                  name="payment"
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                  className="w-4 h-4 text-[#9966cc] border-gray-200 focus:ring-[#9966cc]"
                />
                <img
                  src={option.img}
                  alt={option.alt}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-md border border-gray-200 bg-white p-1"
                />
                <span
                  className={`text-gray-900 text-sm ${
                    option.bold ? "font-semibold" : ""
                  }`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mt-12 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => handleCancelPayment()}
              disabled={loading}
              className="cursor-pointer px-6 py-2 border border-red-600 text-red-600 rounded-md text-sm font-normal hover:bg-red-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(event) => handlePayment(event)}
              disabled={loading}
              className={`cursor-pointer px-6 py-2 rounded-md text-sm font-normal flex items-center gap-2 ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#9966cc] text-white hover:bg-[#ba95df]"
              }`}
            >
              {loading ? "Processing..." : " Proceed to Payment"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
