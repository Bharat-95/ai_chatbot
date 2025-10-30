// app/components/FirebaseAnalyticsClient.jsx
"use client";
import { useEffect } from "react";
import { analytics } from "../..//lib/firebase";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalyticsClient() {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view"); // log initial pageview
    }
  }, []);

  return null;
}
