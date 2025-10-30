"use client";


import { getSubscriptionDetails } from "../../../lib/data";
import { selectCurrentUser } from "../../../store/reducers/userSlice";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import PayNow from "../_components/paypal";
import ActiveSubscriptionPage from "../../../app/components/subscription/active-subscription";

export default function SubscriptionPage() {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const [showPayPal, setShowPayPal] = useState(false);

  const { price: subscriptionPrice, rate: commissionRate } =
    getSubscriptionDetails(user?.subscriptionPlan || "basic");

  return <ActiveSubscriptionPage />;
}
