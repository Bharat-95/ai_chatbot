"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function EmptySection() {
  const router = useRouter();

  return (
    <section className="bg-white rounded-lg p-4 sm:p-6 flex flex-col items-center text-center space-y-6">
      <div className="w-[120px] h-[120px] relative">
        <img
          src="https://storage.googleapis.com/a1aa/image/a3f664e5-6c8f-4782-6e0c-970d90e4a6e1.jpg"
          alt="Subscription illustration"
          width={120}
          height={120}
          className="rounded"
        />
      </div>

      <h3 className="font-semibold text-base text-[#111827]">
        No Active Subscription
      </h3>

      <p className="text-xs text-[#111827] max-w-md">
        You haven't subscribed to any plan yet. Choose a plan to unlock access
        to leads, coaching, and commission earnings.
      </p>

      <button
        onClick={() => router?.push("/dashboard/subscription-buy")}
        className="cursor-pointer bg-black text-white rounded-md px-6 py-2 text-sm hover:bg-black/70 transition-colors"
      >
        Subscribe Now
      </button>
    </section>
  );
}
