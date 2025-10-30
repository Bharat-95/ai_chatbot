"use client";
import React, { useEffect, useRef } from "react";

const HowToUsePage = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

  
    el.muted = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white py-10 px-4 md:px-12 lg:px-24 flex flex-col items-center space-y-12">
      {/* Header Section */}
      <section className="text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How to Use
        </h2>
        <p className="text-lg text-gray-700">
          Follow these simple steps to get started with your subscription and dashboard features.
        </p>
      </section>

      {/* Steps Section */}
      <section className="max-w-3xl w-full">
        <ol className="list-decimal list-inside space-y-6 text-gray-700 text-lg">
          <li>Step 1 - Sign up or log in to your account.</li>
          <li>Step 2 - Open your dashboard.</li>
          <li>Step 3 - Open chrome extension</li>
          <li>Step 4 - Open google sheet</li>
          <li>Step 5 - Take Subscription or start your free trail</li>
          <li>Step 6 - Add chrome extension & enter your id</li>
          <li>Step 7 - Start the bot and watch it sending messages to clients</li>
          <li>Step 8 - Watch Leads coming into your crm and google sheet with name, phone number and conversation</li>
        </ol>
      </section>

      {/* Video Section */}
      <section className="w-full flex justify-center">
        <div className="max-w-3xl w-full">
          <video
            ref={videoRef}
            className="w-full h-[50vh] rounded-xl shadow-lg border border-gray-200"
            controls
            src="/FB Marketplace Chatbot - Full Demo.mp4"
            poster="/video-poster.jpeg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>
    </div>
  );
};

export default HowToUsePage;
