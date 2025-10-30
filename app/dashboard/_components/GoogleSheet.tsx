"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Button } from "../../components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { showToast } from "../../../hooks/useToast";

export default function SheetPage() {
  const [sheetLink, setSheetLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // loader state when link not ready
  const toastShown = useRef(false);

  useEffect(() => {
    const fetchLink = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        console.error("No user found:", userError);
        return;
      }

      const { data, error } = await supabaseBrowser
        .from("users")
        .select("fb_chatbot_leads_gs_link")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching sheet link:", error.message);
        return;
      }

      if (!data?.fb_chatbot_leads_gs_link) {
      
        setTimeout(fetchLink, 1000);
        return;
      }

      setSheetLink(data.fb_chatbot_leads_gs_link);
      setIsLoading(false); // stop loader once link is fetched
    };

    fetchLink();
  }, []);

  const handleOpen = () => {
    if (!sheetLink) {
      if (!toastShown.current) {
        showToast({
          title: "Please wait",
          description: "Please wait for 2 mins or refresh the page and click again.",
          type: "info",
        });
        toastShown.current = true;
      }
      setIsLoading(true); // show loader while waiting
      return;
    }

    // link is ready, open it
    window.open(sheetLink, "_blank");
  };

  const handleCopy = async () => {
    if (!sheetLink) return;
    try {
      await navigator.clipboard.writeText(sheetLink);
      showToast({
        title: "Copied!",
        description: "Google Sheet link copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast({
        title: "Error",
        description: "Failed to copy link.",
      });
    }
  };

  return (
    <div className="flex gap-3 px-2 items-center">
      <span className="text-md font-medium">Google Sheet for Leads :</span>

      <button onClick={handleOpen} className="focus:outline-none">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        ) : (
          <Image
            src="/sheets.png"
            alt="Open Google Sheet"
            width={40}
            height={40}
            className="cursor-pointer hover:scale-105 transition-transform"
          />
        )}
      </button>

      <Button onClick={handleCopy} className="bg-blue-600">
        <Copy className="text-white" />
      </Button>
    </div>
  );
}
