"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { Search, Eye } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      const { data } = await supabaseBrowser
        .from("bots")
        .select("bot_id, name")
        .order("created_at", { ascending: false });
      setBots(data || []);
    };
    fetchBots();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      let query = supabaseBrowser
        .from("logs")
        .select("id, created_at, source, sentiment, conversation_title, bot_id, user_name, user_initials, bots(name)")
        .order("created_at", { ascending: false });

      if (selectedBot !== "All") query = query.eq("bot_id", selectedBot);
      if (sourceFilter !== "All") query = query.eq("source", sourceFilter);

      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [selectedBot, sourceFilter]);

  const formatDate = (ts) =>
    new Date(ts).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Logs</h2>
        <p className="text-sm text-gray-500">
          Conversations of the last 7 days
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Bot Filter */}
        <select
          value={selectedBot}
          onChange={(e) => setSelectedBot(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-0"
        >
          <option value="All">All Bots</option>
          {bots.map((b) => (
            <option key={b.bot_id} value={b.bot_id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Source Tabs */}
        <div className="flex items-center bg-gray-100 rounded-md overflow-hidden">
          {["All", "Chat", "Widget", "API"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSourceFilter(tab)}
              className={`px-4 py-2 text-sm font-medium ${
                sourceFilter === tab
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">DATETIME</th>
              <th className="px-4 py-3">SOURCE</th>
              <th className="px-4 py-3">SENTIMENT</th>
              <th className="px-4 py-3">CONVERSATION</th>
              <th className="px-4 py-3">BOT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                        {log.user_initials || "U"}
                      </div>
                      <span className="font-medium text-gray-800">
                        {log.user_name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.sentiment === "positive" ? (
                      <span>👍</span>
                    ) : log.sentiment === "negative" ? (
                      <span>👎</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-medium">
                    {log.conversation_title}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {log.bots?.name || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
