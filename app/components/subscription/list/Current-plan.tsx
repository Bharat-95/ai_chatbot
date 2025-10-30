"use client";
import { useRouter } from "next/navigation";
import React from "react";
import moment from "moment";
import { Check, X } from "lucide-react";

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

export default function CurrentPlan({
  subscriptionData,
}: {
  subscriptionData: any;
}) {
  const router = useRouter();

  const planName = subscriptionData?.subscription?.plan_name;
  const features = featuresMap[planName]?.features || [];

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-3">
          <span>Current Plan</span>
          <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-green-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Active
          </span>
        </h3>
      </div>

      {/* Plan Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-8 mb-6 text-sm text-gray-700">
        <InfoItem
          label="Plan Name"
          value={subscriptionData?.subscription?.plan_name}
        />
        <InfoItem
          label="Amount Paid"
          value={`$${subscriptionData?.subscription?.amount}/month`}
        />
        <InfoItem
          label="Started On"
          value={moment(new Date(subscriptionData?.start_date)).format(
            "MMM DD, YYYY"
          )}
        />
        <InfoItem
          label="Renews On"
          value={moment(new Date(subscriptionData?.end_date)).format(
            "MMM DD, YYYY"
          )}
        />
      </div>

      {/* Plan Benefits */}
      <div className="text-sm text-gray-700 mb-6">
        <p className="font-semibold mb-2">Plan Benefits</p>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature.text} className="flex items-center space-x-2">
              {feature.included ? (
                <Check className="text-green-600 w-4 h-4" />
              ) : (
                <X className="text-red-500 w-4 h-4" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade Button */}
      <div className="flex">
        <button
          onClick={() => router.push("/dashboard/subscription-buy")}
          className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          Upgrade Plan
        </button>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p>{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
