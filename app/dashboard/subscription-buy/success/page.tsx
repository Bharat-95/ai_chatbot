"use client"
import React from 'react'
import dynamic from "next/dynamic";

const PaymentSuccess = dynamic(
  () => import("../../../../app/components/subscription/list/subscription-success"), 
  { ssr: false }
);

export default function Page() {
  return (
   <PaymentSuccess />
  )
}
