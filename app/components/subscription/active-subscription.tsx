"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Settings, Lock, Trash2, Loader } from "lucide-react";
import { useSelector } from "react-redux";
import CurrentPlan from "./list/Current-plan";
import EmptySection from "./list/enpty-section";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import SubscriptionTable from "./list/subscription-table";

export default function SubscriptionPage() {
  const { user } = useSelector((state: any) => state?.user);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from("user_subscription")
          .select(
            `
    *,
    subscription(*)
  `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (error) {
          throw new Error("Some thing went wronge!");
        }
        setSubscriptionData(data);
      } catch (error: any) {
        console.log(error?.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDetails();
    }
  }, [user]);

  return (
    <>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="animate-spin h-8 w-8 text-black" />
        </div>
      ) : (
        <main className="bg-white text-[#111827] min-h-screen flex">
          <section className="flex-1 flex flex-col p-4 sm:px-8 sm:py-4 space-y-8 overflow-auto lg:w-full md:w-full w-[320px]  max-w-[1600px] mx-auto">
            {/* <h2 className="text-lg font-semibold text-gray-900">
              My Subscription
            </h2> */}

            {subscriptionData ? (
              <CurrentPlan subscriptionData={subscriptionData} />
            ) : (
              <EmptySection />
            )}
            {/* Subscription History */}
           <SubscriptionTable />
          </section>
        </main>
      )}
    </>
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
