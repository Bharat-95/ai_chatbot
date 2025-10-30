"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import "react-phone-input-2/lib/style.css";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { showToast } from "../../../hooks/useToast";
import PhoneInput from "react-phone-input-2";
import ReCAPTCHA from "react-google-recaptcha";

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const clientWebhookOne = process.env.NEXT_PUBLIC_CONTACT_US_FORM_WEBHOOK;

  const onSubmit = async (data) => {
    if (!isVerified) {
      showToast({
        title: "Verification required",
        description: "Please complete the reCAPTCHA before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Save to Supabase
      const { error } = await supabaseBrowser
        .from("contact_us_messages")
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
          },
        ]);

      if (error) throw new Error(error.message);

      // 2️⃣ Send to webhook
      const payload = {
        id: "",
        ...data,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(clientWebhookOne, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "DriveXAuth",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Webhook submission failed");
      }

      // ✅ Success toast
      showToast({
        title: "Success",
        description: "Message submitted successfully",
      });

      reset();
    } catch (err) {
      console.error("❌ Contact form error:", err);
      showToast({
        title: "Failed",
        description: "Error sending the message",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (value) => {
    setIsVerified(!!value);
  };

  return (
    <section className="py-10 px-4 md:px-12 lg:px-24 text-black bg-white">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          Have questions? Need support? We’re here to help you succeed <br />
          with MarketplaceBot
        </p>
      </div>

      <div className="mx-auto bg-white rounded-lg p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <input
                        type="text"
                        placeholder="Your Name"
                        {...field}
                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black focus:outline-none"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        type="email"
                        placeholder="Your Email"
                        {...field}
                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black focus:outline-none"
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Phone number is required" }}
                  render={({ field }) => (
                    <PhoneInput
                      country="us"
                      {...field}
                      enableSearch
                      inputStyle={{
                        width: "100%",
                        height: "45px",
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: "6px",
                        paddingLeft: "50px",
                        fontSize: "15px",
                      }}
                      buttonStyle={{
                        backgroundColor: "#fff",
                        color: "#000",
                        marginRight: "5px",
                        borderRadius: "6px",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: "6px",
                        border: "1px solid #555b75",
                        overflow: "hidden",
                      }}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Controller
                  name="message"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Message is required" }}
                  render={({ field }) => (
                    <textarea
                      rows={6}
                      placeholder="Your Message"
                      {...field}
                      className="w-full px-4 py-2 border border-gray-200 rounded-md  resize-none focus:ring-1 focus:ring-black focus:outline-none"
                    />
                  )}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center">
                <ReCAPTCHA
                  sitekey="6LeKvK4rAAAAAFcZTubCktMqh3yywQ-67DE_sJqc"
                  onChange={handleCaptchaChange}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isVerified}
                className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-black/70 transition-colors duration-200"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right Column: Other Ways */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Other Ways to Reach Us
            </h2>
            <div className="space-y-6">
              <div className="flex items-start p-4 rounded-lg">
                <div className="bg-black/10 p-2 rounded-full mr-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">E-Mail Support</h3>
                  <p className="text-gray-600">info@fbmarketplacebots.com</p>
                  <p className="text-gray-500 text-sm">
                    We reply within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start p-4 rounded-lg">
                <div className="bg-black/10 p-2 rounded-full mr-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Phone Support</h3>
                  <p className="text-gray-600">+1 (469) 214-6349</p>
                  <p className="text-gray-600">+91 9773603818</p>
                  {/* <p className="text-gray-500 text-sm">
                    Mon-Fri, 09:00am-06:00pm
                  </p> */}
                </div>
              </div>
              <div className="flex items-start p-4 rounded-lg">
                <div className="bg-black/10 p-2 rounded-full mr-4">
                  <MessageSquare className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Live Chat Available</h3>
                  <p className="text-gray-600">Available 24/7</p>
                  <p className="text-gray-500 text-sm">Chat with bot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
