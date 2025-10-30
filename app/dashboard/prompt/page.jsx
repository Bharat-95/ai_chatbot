"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Textarea } from "../../components/ui/textarea";
import { Loader } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function PromptPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError || !user) {
        console.error("Error getting logged-in user:", authError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseBrowser
        .from("users")
        .select("id, fb_chatbot_prompt, subscription")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
      } else if (data) {
        setUserData(data);
        setPrompt(data.fb_chatbot_prompt || "");
        setOriginalPrompt(data.fb_chatbot_prompt || "");
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  const plan = userData?.subscription;
  const isEditable = plan?.trim() === "Ultimate Advantage";
  const hasChanges = prompt !== originalPrompt;

  const handleSave = async () => {
    if (!userData?.id) return;
    setSaving(true);

    const { error } = await supabaseBrowser
      .from("users")
      .update({ fb_chatbot_prompt: prompt })
      .eq("id", userData.id);

    if (error) {
      console.error("Error saving prompt:", error.message);
    } else {
      setOriginalPrompt(prompt); // ✅ update reference so cancel works correctly
    }

    setSaving(false);
  };

  const handleCancel = () => {
    setPrompt(originalPrompt); // ✅ revert to saved value
  };

  return (
    <div className="flex flex-col items-center pt-20 min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-semibold mb-4">Prompt</h1>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        className="w-full max-w-2xl min-h-[150px]"
        readOnly={!isEditable}
      />

      {isEditable && hasChanges && (
        <div className="flex gap-3 mt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white">
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}

      {!isEditable && (
        <p className="mt-3 text-sm text-gray-500">
          Your current plan (
          <span className="font-medium">{plan || "Unknown"}</span>) does not allow
          editing this prompt.
        </p>
      )}
    </div>
  );
}
