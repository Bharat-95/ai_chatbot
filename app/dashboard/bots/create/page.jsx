"use client";

import React, { useEffect, useState } from "react";

const THEME = "#9966cc";

const MODELS = [
  { id: "gpt5", title: "GPT-5", desc: "Versatile model by OpenAI designed for advanced reasoning, extended context handling, and high-quality content generation.", credits: 2.5 },
  { id: "gpt5mini", title: "GPT-5 Mini", desc: "The latest fast and cheap model good for most use cases.", credits: 0.5 },
  { id: "gpt4o", title: "GPT-4o", desc: "Proven OpenAI model for complex reasoning, nuanced understanding, and high-quality results.", credits: 2.5 },
  { id: "gpt4omini", title: "GPT-4o Mini", desc: "The fastest and cheapest model good for most use cases.", credits: 0.25 },
  { id: "claude_sonnet4", title: "Claude Sonnet 4", desc: "Advance model by Anthropic AI. Has been superseded by Claude 4.5 Sonnet.", credits: 3 },
  { id: "claude_sonnet45", title: "Claude Sonnet 4.5", desc: "Advance model by Anthropic AI. Useful for advanced reasoning and creative tasks.", credits: 3.5 },
  { id: "claude_opus", title: "Claude Opus 4.1", desc: "Most powerful model by Anthropic AI. Useful for complex and creative tasks.", credits: 22, premium: true },
];

const PERSONALITIES = [
  { id: "factual", title: "Factual", emoji: "🔎", desc: "Provides precise responses using your knowledge base." },
  { id: "creative", title: "Creative", emoji: "🪄", desc: "Facilitates AI-driven creative content generation." },
  { id: "helpdesk", title: "Employee Help Desk", emoji: "📚", desc: "Assists in addressing employee inquiries and HR guidelines." },
  { id: "tech", title: "Technical Support", emoji: "💻", desc: "Provides technical support and offers troubleshooting aid." },
  { id: "customer", title: "Customer Support", emoji: "🌐", desc: "Delivers quick, effective solutions to customer inquiries." },
  { id: "marketing", title: "Marketing", emoji: "📣", desc: "Contributes in strategic planning and marketing content." },
  { id: "guided", title: "Guided", emoji: "🧭", desc: "Conducts comprehensive guided training sessions." },
  { id: "lead", title: "Lead Capture", emoji: "🎯", desc: "An AI assistant that facilitates lead interaction and data collection.", premium: true },
  { id: "base", title: "Base AI", emoji: "🤖", desc: "Utilize your preferred AI model without a knowledge base." },
];

export default function NewBotPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [tokenBudget, setTokenBudget] = useState(8000); // 8K default
  const [selectedPersonality, setSelectedPersonality] = useState("factual");

  // Reset token budget to default when model changes (so display updates immediately)
  useEffect(() => {
    setTokenBudget(8000);
  }, [selectedModel]);

  const creditsForTokens = (tokens) => {
    if (tokens === 8000) return 2.5;
    if (tokens === 16000) return 5;
    if (tokens === 24000) return 7.5;
    if (tokens === 32000) return 10;
    return (tokens / 8000) * 2.5;
  };

  const handleCreate = () => {
    const payload = {
      name,
      desc,
      model: selectedModel,
      tokenBudget,
      personality: selectedPersonality,
    };
    console.log("Create bot payload:", payload);
    alert("Bot created (demo). Check console for payload.");
  };

  const selectedModelObj = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
  const isPremiumModel = !!selectedModelObj.premium; // Claude Opus flagged premium

  return (
    <div className="min-h-screen bg-white py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        {/* General */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-1">General</h2>
          <p className="text-gray-500 mb-6">Your bot's basic settings.</p>

          <label className="block mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Bot Name <span className="text-red-500">*</span></span>
            </div>
            <div className="text-gray-500 mb-2">Give your bot a name to identify it on this platform.</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give this bot a name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
              style={{ boxShadow: "none", borderColor: "#e6e9ee" }}
            />
          </label>

          <label className="block mb-6">
            <div className="mb-2">
              <span className="font-medium text-gray-900">Bot Description</span>
            </div>
            <div className="text-gray-500 mb-2">Leave empty to auto-generate an apt description.</div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder=""
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
              style={{ borderColor: "#e6e9ee" }}
            />
          </label>
        </section>

        {/* Model */}
        <section className="mb-10">
          <h3 className="text-lg font-medium mb-3">Model</h3>

          <div className="space-y-4">
            {MODELS.map((m) => {
              const selected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors flex justify-between items-start ${selected ? "bg-gradient-to-r from-[#faf6ff] to-[#fbf8ff]" : "bg-white"}`}
                  style={{
                    borderWidth: "2px",
                    borderColor: selected ? THEME : "#e6eaef",
                    boxShadow: selected ? `0 6px 20px rgba(153,102,204,0.08)` : "none",
                    borderRadius: 10,
                  }}
                >
                  <div className="max-w-[70%]">
                    <div className="text-purple-800 font-semibold mb-1">{m.title}</div>
                    <div className="text-gray-500 text-sm">{m.desc}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-sm" style={{ color: selected ? THEME : "#0f172a" }}>
                      {m.credits} credits
                    </div>
                    <div className="text-gray-400 text-xs mt-1">/ 8K tokens</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Token Budget */}
        <section className="mb-10">
          <h3 className="text-lg font-medium mb-3">Token Budget</h3>
          <p className="text-gray-500 mb-4">
            Choose the maximum amount of tokens the bot can spend for one request. Bigger budgets allow longer inputs and replies. Billing is for actual usage, rounded up to the next 8K tokens.
          </p>

          {/* If premium model (Claude Opus), show subscribe notice */}
          {isPremiumModel ? (
            <div className="mt-4">
              <div className="rounded-lg border-2 border-orange-400/90 bg-orange-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="text-orange-500 text-2xl">⚠️</div>
                  <div>
                    <div className="text-orange-700 mb-4">You must subscribe to a paid plan to use this model.</div>
                    <button
                      onClick={() => alert("Subscribe flow (demo)")}
                      className="text-orange-600 font-semibold"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic tokens + credits text based on selected model (defaults to 8K) */}
              <div className="mb-3 text-sm text-gray-700">
                <strong>{(tokenBudget / 1000).toLocaleString()}K tokens</strong> • {selectedModelObj.credits} credits usage
              </div>

              <div className="w-full">
                <input
                  type="range"
                  min={8000}
                  max={32000}
                  step={8000}
                  value={tokenBudget}
                  onChange={(e) => setTokenBudget(Number(e.target.value))}
                  className="w-full h-2 appearance-none rounded-lg"
                  style={{
                    background:
                      "linear-gradient(90deg, #3B82F6 " + ((tokenBudget - 8000) / (32000 - 8000)) * 100 + "%, #e6e9ee 0%)",
                    outline: "none",
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>8K</span>
                  <span>32K</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="rounded-lg border-2 border-orange-400/80 bg-orange-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-500 text-2xl">⚠️</div>
                    <div className="text-orange-700">
                      <strong>For stronger memory and accuracy, choose 24K+ tokens.</strong> Go lower only if your knowledge base is tiny.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Personality */}
        <section className="mb-14">
          <h3 className="text-lg font-medium mb-3">Personality</h3>
          <p className="text-gray-500 mb-6">Configure your bot's behaviour.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERSONALITIES.map((p) => {
              const selected = selectedPersonality === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonality(p.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col justify-between ${selected ? "bg-white" : "bg-white"}`}
                  style={{
                    borderColor: selected ? THEME : "#e6eaef",
                    boxShadow: selected ? `0 8px 24px rgba(153,102,204,0.06)` : "none",
                    borderWidth: 2,
                    minHeight: 120,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{p.emoji}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{p.title} {p.premium ? <span className="text-sm text-purple-600 ml-2">Premium</span> : null}</div>
                      <div className="text-gray-500 text-sm mt-1">{p.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer actions */}
        <div className="border-t pt-6 pb-8 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.history.back();
            }}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={isPremiumModel}
            className={`px-6 py-2 rounded-md text-white shadow ${isPremiumModel ? "bg-gray-300 cursor-not-allowed" : ""}`}
            style={{ backgroundColor: isPremiumModel ? undefined : THEME }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
