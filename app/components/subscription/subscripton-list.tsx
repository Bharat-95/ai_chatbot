// app/subscription-List
"use client";

import React, { useState } from "react";
import SubscriptionListPage from "./list/subscripton-list";
import SubscriptionPayment from "./list/subscription-payment";

type planState = {
  plan_name: string;
  id: string;
  type: string;
  amount: string;
  duration: string;
  basic_amount?: string;
  commission?: string;
  hst_tax?: string;
};

export default function SubscriptionListMainPage() {
  const [selectedSubscription, setSelectedSubscription] =
    useState<planState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<boolean>(false);

  const handleCancelPayment = () => {
    setSelectedSubscription(null);
    setPaymentMethod(false);
  };

  const handleShowPayment = (plan: planState) => {
    setSelectedSubscription(plan);
    setPaymentMethod(true);
  };

  return (
    <>
      {paymentMethod ? (
        <SubscriptionPayment
          selectedSubscription={selectedSubscription}
          handleCancelPayment={handleCancelPayment}
          setPaymentMethod={setPaymentMethod}
        />
      ) : (
        <SubscriptionListPage handleShowPayment={handleShowPayment} />
      )}
    </>
  );
}
