// components/PhoneInputWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const PhoneInput = dynamic(() => import("react-phone-input-2"), {
  ssr: false,
});

export default PhoneInput;
