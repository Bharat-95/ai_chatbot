"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { showToast } from "../../../hooks/useToast";
import FloatingActionButton from "../../components/FloatingActionButton";
import { Loader } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

    const WEBHOOK_URL = process.env.NEXT_PUBLIC_CONTACT_US_FORM_WEBHOOK;

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchUser = async () => {
      setFetchingUser(true);
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        const { data: profile } = await supabaseBrowser
          .from("users")
          .select("name, email, phone")
          .eq("id", user.id)
          .single();

        if (profile) {
          setForm((prev) => ({
            ...prev,
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
          }));
        }
      }
      setFetchingUser(false);
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      showToast({
        title: "Verification required",
        description: "Please complete the reCAPTCHA before submitting.",
      });
      return;
    }

    setLoading(true);

    try {
     
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        throw new Error("User not logged in");
      }

      // Supabase payload
      const supabasePayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      };

      // Webhook payload
      const webhookPayload = {
        userId: user.id,
        ...supabasePayload,
      };

      // Save to Supabase
      const { error } = await supabaseBrowser
        .from("contact_us_messages")
        .insert([supabasePayload]);

      if (error) {
        console.error("❌ Supabase insert error:", error);
        throw new Error("Failed to save message in database");
      }

      // Send to Webhook
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "DriveXAuth",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!res.ok) {
        throw new Error("Webhook submission failed");
      }

      showToast({
        title: "Success",
        description: "Message sent successfully!",
      });

      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("❌ Contact form error:", err);
      showToast({
        title: "Error",
        description: "Something went wrong while sending the message!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setIsVerified(!!value);
  };

  if (fetchingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pt-10">
      <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Textarea
            name="message"
            placeholder="Your message..."
            value={form.message}
            onChange={handleChange}
            required
          />
          <div className="flex items-center justify-center">
            <ReCAPTCHA
              sitekey="6LeKvK4rAAAAAFcZTubCktMqh3yywQ-67DE_sJqc"
              onChange={handleCaptchaChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white flex justify-center items-center"
            disabled={loading || !isVerified}
          >
            {loading && (
              <Loader className="h-5 w-5 mr-2 animate-spin text-white" />
            )}
            {loading ? "Sending..." : "Request Meeting"}
          </Button>
        </form>
      </div>
      <FloatingActionButton />
    </div>
  );
}
