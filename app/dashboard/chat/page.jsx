"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();
  const [convQuery, setConvQuery] = useState("");
  const [botQuery, setBotQuery] = useState("");
  const [conversations] = useState([
    { id: "c1", bot: "Arpan Demo", title: "Introduction and Assistance Inquiry", time: "2 minutes ago" },
    { id: "c2", bot: "Arpan Demo", title: "Conversation #5235679", time: "2 minutes ago" },
    { id: "c3", bot: "Arpan Demo", title: "Conversation #5235597", time: "1 hour ago" },
    { id: "c4", bot: "Arpan Demo", title: "Conversation #5233717", time: "11 hours ago" },
    { id: "c5", bot: "Arpan Demo", title: "Conversation #5224620", time: "4 days ago" },
    { id: "c6", bot: "Move Abroad", title: "Conversation #5212178", time: "last week" }
  ]);
  const [bots, setBots] = useState([]);
  const [loadingBots, setLoadingBots] = useState(false);


  const handleStartConversation = async (bot) => {
  try {
    // Get the current user
    const { data: userData } = await supabaseBrowser.auth.getUser();
    const user = userData?.user;

    // Insert into logs
    await supabaseBrowser.from("logs").insert([
      {
        bot_id: bot.bot_id,
        source: "Chat",
        sentiment: "neutral",
        conversation_title: `Started conversation with ${bot.name}`,
        user_name: user?.email || "Anonymous",
        user_initials: user?.email?.[0]?.toUpperCase() || "U",
      },
    ]);

    // Redirect to chat page
    router.push(`/dashboard/bots/${bot.bot_id}/chat`);
  } catch (error) {
    console.error("Error logging chat start:", error);
    router.push(`/dashboard/bots/${bot.bot_id}/chat`);
  }
};

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingBots(true);
      try {
        let uid = null;
        if (supabaseBrowser.auth?.getUser) {
          const r = await supabaseBrowser.auth.getUser();
          uid = r?.data?.user?.id ?? null;
        } else if (supabaseBrowser.auth?.user) {
          const u = supabaseBrowser.auth.user();
          uid = u?.id ?? null;
        }
        if (!uid) {
          if (mounted) setBots([]);
          return;
        }
        const { data, error } = await supabaseBrowser
          .from("bots")
          .select("bot_id,created_at,name,description,prompt")
          .eq("created_by", uid)
          .order("created_at", { ascending: false });
        if (error) {
          if (mounted) setBots([]);
        } else {
          if (mounted) setBots(data || []);
        }
      } catch (e) {
        if (mounted) setBots([]);
      } finally {
        if (mounted) setLoadingBots(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const q = convQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || c.bot.toLowerCase().includes(q)
    );
  }, [convQuery, conversations]);

  const filteredBots = useMemo(() => {
    const q = botQuery.trim().toLowerCase();
    if (!q) return bots;
    return bots.filter(
      (b) =>
        (b.name || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q) ||
        (b.prompt || "").toLowerCase().includes(q)
    );
  }, [botQuery, bots]);

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-96 border-r border-gray-100 h-screen overflow-auto">
        <div className="p-4 flex items-center">
          <div />
          <Link href="/chat/new" className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-md shadow">
            <Plus size={14} />
            <span className="text-sm">New Conversation</span>
          </Link>
        </div>

        {/* Conversation Search */}
        <div className="p-4 border-t border-b border-gray-100">
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              <Search size={14} />
            </span>
            <input
              value={convQuery}
              onChange={(e) => setConvQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 outline-none focus:ring-0 focus:border-gray-300"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ul className="divide-y divide-gray-100">
          {filteredConversations.map((c) => (
            <li key={c.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.bot}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{c.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT MAIN SECTION */}
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-2 text-center">Choose a bot for a new conversation</h2>

          <div className="mt-6">
            {/* Bot Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input
                value={botQuery}
                onChange={(e) => setBotQuery(e.target.value)}
                placeholder="Search bots..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 outline-none focus:ring-0 focus:border-gray-300"
              />
            </div>

            {/* Bot List */}
            <div className="mt-6 border-t border-gray-200">
              {loadingBots && (
                <>
                  <div className="py-6 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="py-6 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </>
              )}

              {!loadingBots && filteredBots.length === 0 && (
                <div className="py-6 text-center text-gray-500">No bots found.</div>
              )}

              {!loadingBots && filteredBots.map((b) => (
                <div
  key={b.bot_id}
  onClick={() => handleStartConversation(b)}
  className="py-6 border-b border-gray-100 flex items-start gap-4 hover:bg-gray-50 cursor-pointer"
>

                  <div className="py-6 border-b border-gray-100 flex items-start gap-4 hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-md bg-[#fff3cd] flex items-center justify-center text-xl">🤖</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">{b.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{b.description}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="py-6">
                <Link href="/dashboard/bots/create" className="inline-flex items-center gap-2 text-gray-800">
                  <span className="text-2xl">＋</span>
                  <span className="font-medium">Create Another Bot</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
