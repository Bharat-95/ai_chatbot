"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";

type PlanRow = {
  id: string;
  plan_name: string;
  amount_usd?: string | null;
  amount_ind?: string | null;
  type?: string | null;
  sort_order?: number | null;
};

export default function Subscriptions() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<
    {
      id: string;
      title: string;
      price: string;
      raw_usd?: string | null;
      raw_ind?: string | null;
      features: { text: string; available: boolean }[];
      buttonText: string;
      type: string;
    }[]
  >([]);
  const [user, setUser] = useState<any | null>(null);
  const [regionReady, setRegionReady] = useState(false);
  const [isIndia, setIsIndia] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);

  const featuresMap: Record<string, { text: string; available: boolean }[]> = {
    "Trial Run": [
      { text: "2 Days Free Trail", available: true },
      { text: "Unlimted Leads", available: true },
      { text: "Unlimted Messages", available: true },
      { text: "Simple Replies", available: true },
      { text: "Google Sheet Integration", available: true },
      { text: "Advanced Prompt with AI", available: false },
      { text: "Custom Prompt with AI", available: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", available: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", available: false },
    ],
    "Foundation Pack": [
      { text: "1 Week Subscription", available: true },
      { text: "Unlimted Leads", available: true },
      { text: "Unlimted Messages", available: true },
      { text: "Simple Replies", available: true },
      { text: "Google Sheet Integration", available: true },
      { text: "Advanced Prompt with AI", available: false },
      { text: "Custom Prompt with AI", available: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", available: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", available: false },
    ],
    "Growth Engine": [
      { text: "1 Month Subscription", available: true },
      { text: "Unlimted Leads", available: true },
      { text: "Unlimted Messages", available: true },
      { text: "Simple Replies", available: true },
      { text: "Google Sheet Integration", available: true },
      { text: "Advanced Prompt with AI", available: false },
      { text: "Custom Prompt with AI", available: false },
      { text: "AI Calling Setup (Extra 1,000 USD)", available: false },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", available: false },
    ],
    "Ultimate Advantage": [
      { text: "1 Month Subscription", available: true },
      { text: "Unlimted Leads", available: true },
      { text: "Unlimted Messages", available: true },
      { text: "Simple Replies", available: true },
      { text: "Google Sheet Integration", available: true },
      { text: "Advanced Prompt with AI", available: true },
      { text: "Custom Prompt with AI", available: true },
      { text: "AI Calling Setup (Extra 1,000 USD)", available: true },
      { text: "Lead Nurturing Automations (Extra 1,000 USD)", available: true },
    ],
  };

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

  const sanitizeAmount = (raw: string | null | undefined) =>
    raw == null ? "" : String(raw).replace(/[^\d.]/g, "");

  const formatPrice = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "0.00";

    if (isIndia) {
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    } else {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  const resolveAmount = (row: PlanRow) => {
    const primary = isIndia ? row.amount_ind : row.amount_usd;
    const fallback = isIndia ? row.amount_usd : row.amount_ind;
    const cleaned = sanitizeAmount(primary ?? fallback);
    return cleaned === "" ? "0.00" : formatPrice(cleaned);
  };

  useEffect(() => {
    const initUser = async () => {
      try {
        const { data, error } = await supabaseBrowser.auth.getUser();
        if (!error && data?.user) {
          setUser(data.user);
          const { data: uData, error: uErr } = await supabaseBrowser
            .from("users")
            .select("trial_used")
            .eq("id", data.user.id)
            .single();
          if (!uErr && uData?.trial_used) setTrialUsed(true);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setUser(null);
      }
    };
    initUser();
  }, []);

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

        if (error) {
          console.error("Error fetching subscription plans:", error);
          setPlans([]);
          setLoading(false);
          return;
        }

        const formatted = (data ?? []).map((row: PlanRow) => {
          const price = resolveAmount(row);
          const title = row.plan_name ?? "Plan";
          const btnText = row.type === "2" ? "Start Trial" : "Buy Now";
          const features = featuresMap[title] ?? featuresMap["Foundation Pack"];
          return {
            id: row.id,
            title,
            price,
            raw_usd: row.amount_usd ?? null,
            raw_ind: row.amount_ind ?? null,
            features,
            buttonText: btnText,
            type: row.type ?? "unknown",
          };
        });

        if (!cancelled) {
          setPlans(formatted);
        }
      } catch (err) {
        console.error("Unexpected error fetching plans:", err);
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, [regionReady, isIndia]);

  const handleClick = async (plan: any) => {
    if (plan.type === "2") {
      if (!user) {
        router.push("/sign-in");
        return;
      }
      if (trialUsed) {
        alert("You have already used your trial.");
        return;
      }
      router.push(`/dashboard/subscription-buy?plan=${encodeURIComponent(plan.id)}&trial=1`);
      return;
    }
    if (user) {
      router.push(`/dashboard/subscription-buy?plan=${encodeURIComponent(plan.id)}`);
    } else {
      router.push("/sign-in");
    }
  };

if (loading || !regionReady) {
  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 text-white">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-black">Subscriptions</h2>
        <p className="text-lg text-black mt-3">So What Does It Cost? – Be A Part Of Us!</p>
      </div>

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
    </section>
  );
}

  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 text-white">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-black">Subscriptions</h2>
        <p className="text-lg text-black mt-3">So What Does It Cost? – Be A Part Of Us!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="relative rounded-2xl p-8 shadow-md bg-white">
            <div className="pt-6 pb-4 text-center">
              <h3 className="text-md font-semibold text-black">{plan.title}</h3>
              <p className="text-4xl font-bold mt-2 text-black">
                {isIndia ? "₹" : "$"}
                {plan.price}
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-black">
              {plan.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-center gap-3 text-sm">
                  {feature.available ? (
                    <Check className="text-green-400 w-4 h-4 flex-shrink-0" />
                  ) : (
                    <X className="text-rose-800 w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                onClick={() => handleClick(plan)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-black text-white font-semibold text-sm hover:opacity-90 transition
                  ${plan.type === "2" && trialUsed ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={plan.type === "2" && trialUsed}
              >
                {plan.type === "2" && trialUsed ? "Trial used" : plan.buttonText || "Buy Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
