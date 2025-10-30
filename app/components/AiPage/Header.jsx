"use client";

import { useState } from "react";
import { Bot, Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// This is a responsive header component built with React and Tailwind CSS.
// It includes a logo, a navigation menu, and a call-to-action button.
// The navigation links use anchor tags to scroll to sections on the same page.
// On mobile, the menu collapses into a hamburger icon.
export default function Header() {
  // State to manage the visibility of the mobile menu.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // An array of navigation items with their display text and corresponding anchor ID.
  const navItems = [
    { name: "How it work", href: "/#how-it-works" },
    { name: "Why choose us", href: "/#why-choose-us" },
    { name: "Subscription", href: "/#subscription" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Consultancy", href: "/#consultancy" },
    { name: "How to use", href: "/#how" },
    { name: "Contact Us", href: "/#contact-us" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-800"
          >
            <Image src='/bot.png' alt="No Logo Found" height={28} width={28} />
          Ai Chatbot
          </Link>

          {/* Desktop Navigation Menu and CTA Button */}
          {/* This div groups the nav links and the button to align them together on the right */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex gap-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-600 hover:text-black/50 transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            {/* Get Started Button */}
            <Link 
              href="/sign-in"
              className="bg-black text-white font-semibold py-2 px-6 rounded-full transition-shadow duration-200 hover:shadow-lg flex items-center gap-1"
            >
              Get Started
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Dropdown Menu (conditionally rendered) */}
      <div
        className={`lg:hidden transition-all ease-out duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center py-4 bg-white border-t border-gray-200">
          <ul className="space-y-4 text-center">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                  className="text-gray-600 hover:text-black/50  text-lg block"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#get-started"
            onClick={() => setIsMenuOpen(false)} // Close menu on click
            className="mt-6 w-1/2 bg-black text-white font-semibold py-2 px-6 rounded-full transition-shadow duration-200 hover:shadow-lg flex items-center justify-center gap-1"
          >
            Get Started
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
