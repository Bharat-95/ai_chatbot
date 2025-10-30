// app/subscription/page.tsx
"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../../../lib/supabaseBrowser";
import { showToast } from "../../../../hooks/useToast";
import { useRouter } from "next/navigation";
import Loader from "../../../(auth)/callback/loading"

type PlanState = {
  id: string;
  plan_name: string;
  type: string;          
  duration?: string;
  
  _amount_usd?: string | null;
  _amount_ind?: string | null;

  amount?: string;
};

type Feature = { text: string; included: boolean };

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

export default function SubscriptionListPage({
  handleShowPayment,
}: {
  handleShowPayment: (plan: PlanState) => void;
}) {
  const [plans, setPlans] = useState<PlanState[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrialConfirm, setShowTrialConfirm] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState<PlanState | null>(null);
  const router = useRouter();
  const [trialUsed, setTrialUsed] = useState(false);
  const [processingTrial, setProcessingTrial] = useState(false);


const [isIndia, setIsIndia] = useState(false);
useEffect(() => {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
    const lang = (navigator.language || "").toLowerCase();
    const inTZ = tz === "asia/kolkata" || tz === "asia/calcutta";
    const inLang = lang.endsWith("-in");
    setIsIndia(inTZ || inLang);
  } catch {
    setIsIndia(false);
  }
}, []);

const currencySymbol = isIndia ? "₹" : "$";


const sanitizeAmount = (raw: string | number | null | undefined) => {
  if (raw == null) return "";
  const s = String(raw).trim();
  return s.replace(/[^0-9.]/g, "");
};


const getDisplayAmount = (p: PlanState) => {
  const primary = isIndia ? p._amount_ind : p._amount_usd;
  const fallback = isIndia ? p._amount_usd : p._amount_ind;

  const cleanedPrimary = sanitizeAmount(primary);
  if (cleanedPrimary !== "") return cleanedPrimary;

  const cleanedFallback = sanitizeAmount(fallback);
  if (cleanedFallback !== "") return cleanedFallback;

  return "0";
};


  const callWebhook = async (payload: any) => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_NEW_SUBSCRIPTION_WEBHOOK;
      if (!webhookUrl) {
        console.error("❌ Webhook URL is not set in .env");
        return;
      }
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("Webhook call failed:", res.statusText);
      }
    } catch (err) {
      console.error("Error calling webhook:", err);
    }
  };

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      try {
        // Fetch plans with both currency fields
        const { data: plansData, error: plansError } = await supabaseBrowser
          .from("subscription")
          .select("id, plan_name, amount_usd, amount_ind, type, sort_order")
          .order("sort_order", { ascending: true });

        if (plansError) throw plansError;

        const formattedPlans: PlanState[] = (plansData as any[]).map((plan) => ({
          id: plan.id,
          plan_name: plan.plan_name,
          type: plan.type,
          duration:
            plan.type === "2"
              ? "For 2 days"
              : plan.type === "week"
              ? "For 1 week"
              : "For 1 month",
          _amount_usd: plan.amount_usd ?? null,
          _amount_ind: plan.amount_ind ?? null,
        }));

        setPlans(formattedPlans);

        // Fetch active subscription & trial flag
        const { data: userData } = await supabaseBrowser.auth.getUser();
        if (userData?.user) {
          const { data: subscriptionData, error: subscriptionError } =
            await supabaseBrowser
              .from("user_subscription")
              .select("subscription_id")
              .eq("user_id", userData.user.id)
              .eq("is_active", true)
              .limit(1);

          if (subscriptionError) throw subscriptionError;
          if (subscriptionData && subscriptionData.length > 0) {
            setActivePlanId(subscriptionData[0].subscription_id);
          }

          const { data: userRow, error: userError } = await supabaseBrowser
            .from("users")
            .select("trial_used")
            .eq("id", userData.user.id)
            .single();

          if (!userError && userRow) {
            setTrialUsed(userRow.trial_used === true);
          }
        }
      } catch (error: any) {
        console.error("[SubscriptionListPage] Error:", error);
        showToast({
          type:"error",
          title: "Error",
          description: "Failed to load subscription plans or active subscription.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlansAndSubscription();
  }, []);

  const checkActiveSubscription = async (
    userId: string
  ): Promise<{ hasActive: boolean; planName?: string }> => {
    try {
      const { data, error } = await supabaseBrowser
        .from("user_subscription")
        .select("id, subscription:subscription_id(plan_name)")
        .eq("user_id", userId)
        .eq("is_active", true)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        return { hasActive: true, planName: (data[0] as any).subscription.plan_name };
      }
      return { hasActive: false };
    } catch (error: any) {
      console.error("[SubscriptionListPage] Error checking active subscription:", error);
      showToast({
        title: "Error",
        description: "Failed to check existing subscriptions.",
      });
      return { hasActive: false };
    }
  };

  const checkPreviousFreeTrial = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabaseBrowser
        .from("user_subscription")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "payment_successful")
        .limit(1);

      if (error) throw error;

      return !!data && data.length > 0;
    } catch (error: any) {
      console.error("[SubscriptionListPage] Error checking previous free trial:", error);
      showToast({
        title: "Error",
        description: "Failed to check previous free trials.",
      });
      return false;
    }
  };

  const handlePlanSelect = async (plan: PlanState, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const {
      data: { user },
      error: userError,
    } = await supabaseBrowser.auth.getUser();
    if (userError || !user) {
      showToast({
        title: "Error",
        description: "You must be logged in to select a plan.",
        type: "error",
      });
      return;
    }

    const { hasActive, planName: activePlanName } = await checkActiveSubscription(user.id);

    // Compare using resolved numbers (same currency for both)
    const activePlan = plans.find((p) => p.plan_name === activePlanName);
    const selectedAmt = Number(getDisplayAmount(plan));
    const activeAmt = Number(activePlan ? getDisplayAmount(activePlan) : "0");
    const isNumericAmount = !isNaN(selectedAmt) && !isNaN(activeAmt);

    if (hasActive && isNumericAmount) {
      if (selectedAmt <= activeAmt) {
        showToast({
          title: "Error",
          description: `You already have an active subscription: ${activePlanName}. Please cancel it first to select this plan.`,
          type: "error",
        });
        return;
      }
      // allow upgrading otherwise
    }

    // Trial plan
    if (plan.type === "2") {
      const hasPreviousFreeTrial = await checkPreviousFreeTrial(user.id);
      if (hasPreviousFreeTrial) {
        showToast({
          title: "Error",
          description: "You already used your free trial. Please choose a paid plan.",
          type: "error",
        });
        return;
      }

      setSelectedTrialPlan(plan);
      setShowTrialConfirm(true);
      return;
    }


    const resolved = getDisplayAmount(plan);
    handleShowPayment({
      ...plan,
      amount: resolved,
    });
  };

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

      if (selectedTrialPlan.plan_name === "Foundation Pack") {
        endDate.setDate(endDate.getDate() + 7);
      } else {
        endDate.setDate(endDate.getDate() + 2);
      }

      // Update user trial details
      await supabaseBrowser
        .from("users")
        .update({
          fb_chatbot_trail_start_date: startDate.toISOString(),
          fb_chatbot_trail_expiry_date: endDate.toISOString(),
          fb_chatbot_trail_active: true,
          trial_used: true,
          fb_chatbot_subscription_name: selectedTrialPlan?.plan_name,
          subscription: selectedTrialPlan?.plan_name,
          fb_chatbot_subscription_active: true,
          fb_chatbot_subscription_expiry_date: endDate.toISOString(),
        })
        .eq("id", user.id);

      // Insert trial subscription
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

      // Fetch full user details
      const { data: fullUser, error: userDetailsError } = await supabaseBrowser
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userDetailsError) {
        console.error("Error fetching full user details:", userDetailsError);
      }

      // Call webhook
      await callWebhook({
        user: fullUser,
        subscriptionId: subscriptionRow.id,
        planId: selectedTrialPlan.id,
        planName: selectedTrialPlan.plan_name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        amount: 0,
        trial: true,
      });

      // Insert invoice if missing
      const { data: existingInvoice } = await supabaseBrowser
        .from("invoice")
        .select("*")
        .eq("invoiceId", subscriptionRow.id)
        .maybeSingle();

      if (!existingInvoice) {
        const invoicePayload = {
          invoiceId: subscriptionRow.id,
          dateOfSale: new Date().toISOString(),
          plan_name: selectedTrialPlan.plan_name,
          amount: 0,
          salesName: user.id,
        };

        const { error: invoiceError } = await supabaseBrowser
          .from("invoice")
          .insert([invoicePayload]);

        if (invoiceError) {
          console.error("Error inserting invoice:", invoiceError);
        }
      }

      showToast({
        title: "Success",
        description: "Your free trial has been activated 🎉",
      });

      setShowTrialConfirm(false);
      setSelectedTrialPlan(null);
      setActivePlanId(selectedTrialPlan.id);
      router.push("/dashboard/subscription");
    } catch (error: any) {
      console.error("Error starting trial:", error);
      showToast({
        title: "Error",
        description: "Failed to activate trial.",
      });
    } finally {
      setProcessingTrial(false);
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

  return (
    <div className="bg-white text-gray-700 min-h-screen flex">
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="mb-4 text-sm text-gray-600 select-none">
          <Link href="/dashboard/subscription">
            <ArrowLeft className="inline-block cursor-pointer mr-2" size={20} />
          </Link>
          <Link
            href="/dashboard/subscription"
            className="hover:text-black cursor-pointer hover:underline"
          >
            Subscription
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-black font-semibold hover:underline">
            Plan
          </span>
        </div>

        <h1 className="text-gray-900 font-bold text-lg mb-6 select-none mt-6">
          Choose a New Plan
        </h1>

        {loading ? (
          <div><section className="py-10 px-4 md:px-12 lg:px-24 text-white">
    
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
            stroke="black"
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
    </section></div>
        ) : plans.length === 0 ? (
          <div className="text-center text-gray-600">
            No subscription plans available.
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
            {plans.map((plan) => {
              const planFeatures = featuresMap[plan.plan_name]?.features;
              const activePlan = plans.find((p) => p.id === activePlanId);

              const selectedAmt = Number(getDisplayAmount(plan));
              const activeAmt = Number(activePlan ? getDisplayAmount(activePlan) : "0");
              const isNumericAmount = !isNaN(selectedAmt) && !isNaN(activeAmt);

              const shouldDisable =
                !!activePlan &&
                (plan.id === activePlanId ||
                  (isNumericAmount && selectedAmt < activeAmt));

              const displayAmount = getDisplayAmount(plan);

              return (
                <article
                  key={plan.id}
                  aria-label={`${plan.plan_name} plan ${currencySymbol}${displayAmount} ${plan.duration}`}
                  className={`border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    activePlanId === plan.id ? "border-black" : ""
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`inline-block text-xs font-semibold rounded-full px-3 py-1 select-none ${
                          activePlanId === plan.id
                            ? "text-black border border-black"
                            : "text-gray-600 border border-gray-200"
                        }`}
                      >
                        {plan.plan_name}
                      </span>
                      <span className="text-sm font-normal text-right select-none">
                        {plan.duration}
                      </span>
                    </div>
                    <div className="flex justify-end items-baseline gap-1 mt-2">
                      <span className="text-xl font-extrabold select-none">
                        {currencySymbol} {displayAmount}
                      </span>
                    </div>

                    {planFeatures && (
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        {planFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <X className="w-4 h-4 text-rose-800" />
                            )}
                            <span>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handlePlanSelect(plan, e)}
                    disabled={shouldDisable || (trialUsed && plan.type === "2")}
                    className={`mt-6 w-full font-semibold text-sm border rounded-md py-2 transition-colors duration-200 ${
                      shouldDisable || (trialUsed && plan.type === "2")
                        ? "bg-gray-300 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "text-white border-black bg-black hover:bg-black/70"
                    }`}
                  >
                    {getButtonText(plan.plan_name)}
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Trial confirmation modal */}
      {showTrialConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Start Free Trial?</h2>
            <p className="text-sm text-gray-600 mb-6">
              You are about to start your free trial for{" "}
              <span className="font-bold">{selectedTrialPlan?.plan_name}</span>.
              Do you want to continue?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowTrialConfirm(false)}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTrial}
                disabled={processingTrial}
                className={`px-4 py-2 rounded-md ${
                  processingTrial
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/70"
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
}
