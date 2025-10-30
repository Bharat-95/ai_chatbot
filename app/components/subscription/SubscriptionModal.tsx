"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

type planState = {
  id: string;
  plan_name: string;
  type: string; // "2" = trial | "week" | "month"
  duration: string;
  amount: string; // RESOLVED amount for this user (USD or INR)
  amount_usd?: string | null; // raw from DB
  amount_ind?: string | null; // raw from DB
};

type Feature = { text: string; included: boolean };

// Static features mapped to plan names
const featuresMap: Record<string, { features: Feature[] }> = {
  "Trial Run": {
    features: [
      { text: "2 Days Free Trail", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Messages", included: true },
      { text: "Simple Reply", included: true },
      { text: "Google Sheet Integration", included: true },
      { text: "Advanced Prompt with AI", included: false },
      { text: "Custom Prompt with AI", included: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", included: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", included: false },
    ],
  },
  "Foundation Pack": {
    features: [
      { text: "One Week Subscription", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Messages", included: true },
      { text: "Simple Reply", included: true },
      { text: "Google Sheet Integration", included: true },
      { text: "Advanced Prompt with AI", included: false },
      { text: "Custom Prompt with AI", included: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", included: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", included: false },
    ],
  },
  "Growth Engine": {
    features: [
      { text: "One Month Subscription", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Messages", included: true },
      { text: "Simple Reply", included: true },
      { text: "Google Sheet Integration", included: true },
      { text: "Advanced Prompt with AI", included: false },
      { text: "Custom Prompt with AI", included: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", included: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", included: false },
    ],
  },
  "Ultimate Advantage": {
    features: [
      { text: "One Month Subscription", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Messages", included: true },
      { text: "Advanced Chatbot", included: true },
      { text: "Google Sheet Integration", included: true },
      { text: "Advanced Prompt with AI", included: true },
      { text: "Custom Prompt with AI", included: true },
      { text: "AI Calling Setup (Extra 1,000 USD)", included: true },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", included: true },
    ],
  },
};

export const SubscriptionDialog = ({
  setShowModal,
  setPaymentMethod,
  setSelectedSubscription,
}: {
  setShowModal: (val: boolean) => void;
  setPaymentMethod: (val: boolean) => void;
  setSelectedSubscription: (plan: planState) => void;
}) => {
  const [plans, setPlans] = useState<planState[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true); // fetch state
  const [trialUsed, setTrialUsed] = useState(false);

  const [showTrialConfirm, setShowTrialConfirm] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState<planState | null>(null);
  const [processingTrial, setProcessingTrial] = useState(false);
  const router = useRouter();

  // --- Region detection ---
  const [isIndia, setIsIndia] = useState(false);
  const [regionReady, setRegionReady] = useState(false); // 👈 ensure we know region before fetching

  useEffect(() => {
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
      const lang = (navigator.language || "").toLowerCase();
      const inTZ = tz === "asia/kolkata" || tz === "asia/calcutta";
      const inLang = lang.endsWith("-in");
      setIsIndia(inTZ || inLang);
    } catch {
      setIsIndia(false);
    } finally {
      setRegionReady(true);
    }
  }, []);

  // Currency symbol: if user is in India -> INR, else USD for all other countries
  const currencySymbol = isIndia ? "₹" : "$";

  // sanitize numbers like "USD 10.00" -> "10.00"
  const sanitizeAmount = (raw: string | null | undefined) =>
    raw == null ? "" : String(raw).replace(/[^(\d.)]/g, "");

  // Resolve amount according to region: if india => prefer amount_ind then fallback to amount_usd
  // otherwise (non-India) => prefer amount_usd then fallback to amount_ind
  const resolveAmount = (row: { amount_usd?: any; amount_ind?: any }) => {
    const primary = isIndia ? row.amount_ind : row.amount_usd;
    const fallback = isIndia ? row.amount_usd : row.amount_ind;
    const cleaned = sanitizeAmount(primary ?? fallback);
    return cleaned === "" ? "0" : cleaned;
  };

  const callWebhook = async (payload: any) => {
    const NewSubWebhook = process.env.NEXT_PUBLIC_NEW_SUBSCRIPTION_WEBHOOK;
    try {
      if (!NewSubWebhook) return;
      const res = await fetch(NewSubWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await res.text();
      if (!res.ok) console.error("Webhook call failed:", res.statusText);
    } catch (err) {
      console.error("❌ Error calling webhook:", err);
    }
  };

  // Fetch plans AFTER region is known to avoid USD→INR flicker
  useEffect(() => {
    if (!regionReady) return;

    let cancelled = false;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseBrowser
          .from("subscription")
          .select("id, plan_name, amount_usd, amount_ind, type, sort_order")
          .order("sort_order", { ascending: true });

        if (error) throw error;

        const formattedPlans: planState[] = (data as any[]).map((plan) => ({
          id: plan.id,
          plan_name: plan.plan_name,
          type: plan.type,
          duration:
            plan.type === "2"
              ? "For 2 days"
              : plan.type === "week"
              ? "For 1 week"
              : "For 1 month",
          amount: resolveAmount(plan), // resolved for this user
          amount_usd: plan.amount_usd ?? null,
          amount_ind: plan.amount_ind ?? null,
        }));

        if (!cancelled) setPlans(formattedPlans);
      } catch (err) {
        console.error("[SubscriptionDialog] Error fetching plans:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlans();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionReady, isIndia]);

  useEffect(() => {
    const checkTrial = async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;
      const { data } = await supabaseBrowser
        .from("users")
        .select("trial_used")
        .eq("id", user.id)
        .single();
      if (data?.trial_used) setTrialUsed(true);
    };
    checkTrial();
  }, []);

  // 🔔 Confirm trial logic
  const handleConfirmTrial = async () => {
    if (!selectedTrialPlan || processingTrial) return;

    setProcessingTrial(true);

    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      // ✅ Update user row
      await supabaseBrowser
        .from("users")
        .update({
          fb_chatbot_trail_start_date: startDate.toISOString(),
          fb_chatbot_trail_expiry_date: endDate.toISOString(),
          fb_chatbot_trail_active: true,
          trial_used: true,
          fb_chatbot_subscription_name: selectedTrialPlan.plan_name,
          subscription: selectedTrialPlan.plan_name,
          fb_chatbot_subscription_active: true,
          fb_chatbot_subscription_expiry_date: endDate.toISOString(),
        })
        .eq("id", user.id);

      const { data: subscriptionRow, error: subError } = await supabaseBrowser
        .from("user_subscription")
        .insert({
          user_id: user.id,
          subscription_id: selectedTrialPlan.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "payment_successful",
          is_active: true,
          amount: 0,
        })
        .select("*")
        .single();

      if (subError) {
        console.error("Error inserting user_subscription:", subError);
        return;
      }

      const { data: fullUser, error: userDetailsError } = await supabaseBrowser
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userDetailsError) {
        console.error("Error fetching full user details:", userDetailsError);
      }

      await callWebhook({
        user: fullUser,
        userId: user.id,
        subscriptionId: subscriptionRow.id,
        planId: selectedTrialPlan.id,
        planName: selectedTrialPlan.plan_name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        amount: 0,
        trial: true,
      });

      const { data: existingInvoice } = await supabaseBrowser
        .from("invoice")
        .select("*")
        .eq("invoiceId", subscriptionRow.id)
        .maybeSingle();

      if (!existingInvoice) {
        await supabaseBrowser.from("invoice").insert([
          {
            invoiceId: subscriptionRow.id,
            dateOfSale: new Date().toISOString(),
            plan_name: selectedTrialPlan.plan_name,
            amount: 0,
            salesName: user.id,
          },
        ]);
      }

      setShowTrialConfirm(false);
      setSelectedTrialPlan(null);
      setActivePlanId(selectedTrialPlan.id);
      setTrialUsed(true);
      setShowModal(false);
      router.push("/dashboard/subscription");
    } catch (error) {
      console.error("❌ Error starting trial:", error);
    } finally {
      setProcessingTrial(false);
    }
  };

  const handlePlanSelect = async (plan: planState) => {
    if (plan.type === "2") {
      if (trialUsed) return;
      setSelectedTrialPlan(plan);
      setShowTrialConfirm(true);
    } else {
      // ensure we pass the resolved amount & raw amounts
      setActivePlanId(plan.id);
      setSelectedSubscription({
        ...plan,
        amount: plan.amount ?? "0",
      });
      setShowModal(false);
      setPaymentMethod(true);
    }
  };

  const getButtonText = (planName: string) => {
    switch (planName) {
      case "Trial Run":
        return "Start Trial";
      case "Foundation Pack":
      case "Growth Engine":
      case "Ultimate Advantage":
        return "Buy Now";
      default:
        return "Subscribe";
    }
  };

  // Show skeleton until region is known AND plans are fetched
  const showSkeleton = loading || !regionReady;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[90%] p-6 overflow-y-auto lg:max-h-[90vh] md:max-h-[90vh] max-h-[140vh] relative">
        {/* Close Button */}
        <button
          className="absolute lg:text-2xl md:text-3xl text-4xl top-2 right-2 pr-2 text-gray-500 hover:text-gray-800"
          onClick={() => setShowModal(false)}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
          Thank you for creating your account.
          <br />
          Please subscribe to a subscription plan.
        </h2>

        <main className="p-4">
          {showSkeleton ? (
            // Skeleton Loader (also covers region detection)
           <section className="py-10 px-4 md:px-12 lg:px-24 text-white">
    
      <div className="flex items-center justify-center py-20">
        {/* Inline SVG loader (converted to JSX) */}
        <svg
          width="161px"
          height="161px"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="#00bfd8"
            strokeWidth="6"
            strokeDasharray="133.42624267578125 123.162685546875"
            d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
            strokeLinecap="round"
            style={{ transform: "scale(0.88)", transformOrigin: "50px 50px" }}
          >
            <animate
              attributeName="stroke-dashoffset"
              repeatCount="indefinite"
              dur="1.6949152542372883s"
              keyTimes="0;1"
              values="0;256.58892822265625"
            />
          </path>
        </svg>
      </div>
    </section>
          ) : plans.length === 0 ? (
            <p className="text-center text-gray-600">No subscription plans available.</p>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  aria-label={`${plan.plan_name} plan ${isIndia ? "₹" : "$"}${plan.amount} ${plan.duration}`}
                  className={`border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    activePlanId === plan.id
                      ? "bg-[#9966cc] text-white border-[#9966cc]"
                      : "bg-white text-gray-900 border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="inline-block text-xs font-semibold rounded-full px-3 py-1 select-none text-[#9966cc] border border-[#9966cc]">
                        {plan.plan_name}
                      </span>
                      <span className="text-sm font-normal text-right select-none">{plan.duration}</span>
                    </div>

                    <div className="flex justify-end items-baseline gap-1 mt-2">
                      <span className="text-xl font-extrabold select-none">
                        {currencySymbol}
                        {plan.amount}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {featuresMap[plan.plan_name as keyof typeof featuresMap]?.features.map(
                        (feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            {feature.included ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-rose-800" />}
                            <span>{feature.text}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={plan.type === "2" && trialUsed}
                    className={`cursor-pointer mt-6 w-full font-semibold text-sm border rounded-md py-2 transition-colors duration-200
                      ${
                        plan.type === "2" && trialUsed
                          ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                          : "text-white border-[#9966cc] bg-[#9966cc] hover:bg-[#bd93e6]"
                      }`}
                  >
                    {getButtonText(plan.plan_name)}
                  </button>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>

      {/* 🔔 Trial confirmation modal */}
      {showTrialConfirm && selectedTrialPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[60]">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Start Free Trial?</h2>
            <p className="text-sm text-gray-600 mb-6">
              You are about to start your free trial for <span className="font-bold">{selectedTrialPlan.plan_name}</span>. Do you want to continue?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowTrialConfirm(false);
                  setSelectedTrialPlan(null);
                }}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTrial}
                disabled={processingTrial}
                className={`px-4 py-2 rounded-md ${
                  processingTrial ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {processingTrial ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDialog;
