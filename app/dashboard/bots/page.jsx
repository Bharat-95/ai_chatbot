"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Plus, MoreVertical, Code } from "lucide-react";
import Link from "next/link";

const bots = [
  {
    id: 1,
    name: "Creative Cody",
    description: "Can do creative work like generating ads and slogans.",
    model: "GPT-4o Mini 32K",
    usefulness: "WAITING FOR VOTES",
    icon: "🤖",
  },
  {
    id: 2,
    name: "Factual Cody",
    description:
      "Only generates responses based on what it can find in its knowledge base.",
    model: "GPT-4o Mini 32K",
    usefulness: "WAITING FOR VOTES",
    icon: "🟨",
  },
  
];

export default function Page() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold"></h1>

          <div className="flex items-center gap-4">
            {/* Search box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </span>
              <input
                placeholder="Search bots..."
                className="pl-10 pr-4 py-2 w-[380px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9966cc] focus:border-[#9966cc]"
              />
            </div>

            {/* New Bot Button */}
            <Link
             href='/dashboard/bots/create'
              className="inline-flex items-center gap-2 rounded-md bg-[#9966cc] hover:bg-[#bb93e3] text-white px-4 py-2 shadow"
            >
              <Plus size={16} />
              <span className="font-medium">New Bot</span>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm">
          <table className="min-w-full text-sm text-left text-gray-700">
            {/* Table Head */}
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3 w-[20%]">
                  NAME
                </th>
                <th scope="col" className="px-6 py-3 w-[30%]">
                  DESCRIPTION
                </th>
                <th scope="col" className="px-6 py-3 w-[20%]">
                  MODEL
                </th>
                <th scope="col" className="px-6 py-3 w-[20%] text-right">
                  USEFULNESS
                </th>
                <th scope="col" className="px-6 py-3 w-[10%] text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {bots.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all relative"
                >
                  {/* Name */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#f1f5f9] flex items-center justify-center text-xl">
                      {b.icon}
                    </div>
                    <span className="font-medium text-gray-900">{b.name}</span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-gray-600">{b.description}</td>

                  {/* Model */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 bg-[#eef6ff] text-[#0f172a] px-3 py-1 rounded-full font-medium text-sm">
                      <Code size={14} />
                      {b.model}
                    </span>
                  </td>

                  {/* Usefulness */}
                  <td className="px-6 py-4 text-right text-gray-400 text-xs uppercase tracking-wider">
                    {b.usefulness}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                        title="Share"
                      >
                        <span>&lt;/&gt;</span>
                        <span className="hidden md:inline">Share</span>
                      </button>

                      {/* More button */}
                      <button
                        onClick={() => toggleMenu(b.id)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="More"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Side menu */}
                      {openMenuId === b.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-10 z-50 w-48 bg-white rounded-md shadow-lg border-2"
                          style={{ borderColor: "#9966cc" }}
                        >
                          <ul className="py-2">
                            <li>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Edit Bot
                              </button>
                            </li>
                            <li>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Duplicate
                              </button>
                            </li>
                            <li>
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spacing bottom */}
        <div className="h-24" />
      </div>
    </div>
  );
}
