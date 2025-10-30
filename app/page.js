"use client";
import React, { useEffect, useState } from "react";
import How from "../app/components/AiPage/How";
import WhyChooseUs from "./components/AiPage/WhyChooseUs";
import Package from "../app/components/AiPage/Package";
import Testimonials from "../app/components/AiPage/Testimonials";
import Contact from "../app/components/AiPage/ContactUs";
import AiHero from "./components/AiPage/AiHero";
import Footer from "./components/AiPage/Footer";
import Header from "./components/AiPage/Header";
import { useRouter } from "next/navigation";
import HowToUsePage from "./components/AiPage/HowToUse";
import Hv from "./components/AiPage/Hv";

const AiPage = () => {
  const router = useRouter();

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              window.history.replaceState(null, "", `#${id}`);
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div>
      <Header />
      <div className="space-y-10">
        <section id="hero">
        <AiHero />
        </section>
        <section id="how-it-works">
          <How />
        </section>
        <section id="why-choose-us">
          <WhyChooseUs />
        </section>
        <section id="subscription">
          <Package />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="how">
          <HowToUsePage />
        </section>
        <section id="consultancy">
          <Hv />
        </section>
        <section id="contact-us">
          <Contact />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AiPage;
