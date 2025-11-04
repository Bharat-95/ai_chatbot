"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, Send } from "lucide-react";
import { supabaseBrowser } from "../../../../../lib/supabaseBrowser";

export default function Page() {
  const params = useParams();
  const botId = params?.botId || null;
  const [userId, setUserId] = useState(null);
  const [bots, setBots] = useState([]);
  const [currentBot, setCurrentBot] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingBots, setLoadingBots] = useState(false);
  const [convQuery, setConvQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  // Fetch user ID
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (supabaseBrowser.auth?.getUser) {
          const r = await supabaseBrowser.auth.getUser();
          if (mounted) setUserId(r?.data?.user?.id ?? null);
        } else if (supabaseBrowser.auth?.user) {
          const u = supabaseBrowser.auth.user();
          if (mounted) setUserId(u?.id ?? null);
        }
      } catch {
        if (mounted) setUserId(null);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Load bots
  useEffect(() => {
    let mounted = true;
    const loadBots = async () => {
      setLoadingBots(true);
      try {
        if (!userId) return;
        const { data } = await supabaseBrowser
          .from("bots")
          .select("bot_id,name,description,prompt,created_at")
          .eq("created_by", userId)
          .order("created_at", { ascending: false });
        if (mounted) setBots(data || []);
      } catch {
        if (mounted) setBots([]);
      } finally {
        if (mounted) setLoadingBots(false);
      }
    };
    loadBots();
    return () => (mounted = false);
  }, [userId]);

  // Load conversations
  useEffect(() => {
    let mounted = true;
    const loadConversations = async () => {
      setLoadingConvos(true);
      try {
        if (!userId) return;
        const { data } = await supabaseBrowser
          .from("conversations")
          .select("id,title,bot_name,updated_at")
          .eq("created_by", userId)
          .order("updated_at", { ascending: false });
        if (mounted) setConversations(data || []);
      } catch {
        if (mounted) setConversations([]);
      } finally {
        if (mounted) setLoadingConvos(false);
      }
    };
    loadConversations();
    return () => (mounted = false);
  }, [userId]);

  // Match current bot
  useEffect(() => {
    if (!bots || !botId) {
      setCurrentBot(null);
      return;
    }
    const found = bots.find((b) => b.bot_id === botId) || null;
    setCurrentBot(found);
  }, [bots, botId]);

  // Load messages
  useEffect(() => {
    if (!botId) {
      setMessages([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabaseBrowser
          .from("messages")
          .select("id,role,content,created_at")
          .eq("bot_id", botId)
          .order("created_at", { ascending: true })
          .limit(200);
        if (mounted) setMessages(data || []);
      } catch {
        if (mounted) setMessages([]);
      }
    })();
    return () => (mounted = false);
  }, [botId]);

  // Auto-scroll to latest
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    const q = convQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.bot_name || "").toLowerCase().includes(q)
    );
  }, [convQuery, conversations]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !userId || !botId) return;
    setSending(true);
    const localMsg = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, localMsg]);
    setInput("");
    try {
      const { data, error } = await supabaseBrowser
        .from("messages")
        .insert([
          {
            bot_id: botId,
            created_by: userId,
            role: "user",
            content: localMsg.content,
          },
        ])
        .select()
        .single();
      if (!error && data) {
        setMessages((p) => p.map((m) => (m.id === localMsg.id ? data : m)));
      }
      const botReply = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content:
          "This is a demo reply. Replace with your assistant response integration.",
        created_at: new Date().toISOString(),
      };
      setMessages((p) => [...p, botReply]);
      await supabaseBrowser.from("messages").insert([
        {
          bot_id: botId,
          created_by: userId,
          role: "assistant",
          content: botReply.content,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // Press Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex bg-white min-h-[90vh]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-100 overflow-auto">
        <div className="p-4 border-t border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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

        <ul className="divide-y divide-gray-100">
          {loadingConvos &&
            Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="px-4 py-4">
                <div className="animate-pulse h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="animate-pulse h-3 w-1/2 bg-gray-200 rounded" />
              </li>
            ))}
          {!loadingConvos &&
            filteredConversations.map((c) => (
              <li key={c.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-lg">🤖</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{c.title}</div>
                      <div className="text-xs text-gray-500">{c.bot_name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {c.updated_at ? new Date(c.updated_at).toLocaleString() : ""}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-auto" ref={messagesRef}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <div className="text-lg font-semibold">
                {currentBot ? currentBot.name : "Select a bot to start"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {currentBot ? currentBot.description : ""}
              </div>
            </div>

            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                  No messages yet. Start the conversation below.
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-lg max-w-3xl ${
                    m.role === "user"
                      ? "bg-[#eef2ff] self-end ml-auto text-right"
                      : "bg-[#f3f4f6] text-left"
                  }`}
                >
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {m.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg flex items-center gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentBot ? `Ask ${currentBot.name}` : "Select a bot to chat"}
                rows={1}
                className="flex-1 resize-none px-3 py-2 rounded-md border border-gray-200 min-h-20 outline-none focus:ring-0 focus:border-gray-300"
              />

              <button
                onClick={sendMessage}
                disabled={sending || !input.trim() || !currentBot}
                className={`p-3 rounded-md flex items-center justify-center transition ${
                  sending || !input.trim() || !currentBot
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/80"
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
