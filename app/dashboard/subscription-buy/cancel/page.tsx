"use client"
import React from 'react'
import dynamic from "next/dynamic";

const PaymentFailed = dynamic(
  () => import("../../../../app/components/subscription/list/subscription-cancel"), 
  { ssr: false }
);

export default function Page() {
  return (
    <PaymentFailed />
  )
}
