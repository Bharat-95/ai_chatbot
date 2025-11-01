"use client";

import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
// keep your existing import if you have it; component will also fallback to dynamic import if undefined
import { supabaseBrowser as staticSupabase } from "../../../../lib/supabaseBrowser";

export default function StoredDocuments({
  folderId,
  onSelect = null,
  hideHeader = false,
  pageSize = 100,
}) {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId) {
      setDocs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDocs = async () => {
      setLoading(true);
      try {
        // prefer existing static import, but fallback to dynamic import if not available
        let supabase = staticSupabase || null;
        if (!supabase) {
          const mod = await import("../../../../lib/supabaseBrowser").catch(() => null);
          supabase = mod?.supabaseBrowser || null;
        }
        if (!supabase) throw new Error("Supabase client not available");

        const query = supabase
          .from("documents")
          .select("*")
          .eq("folder_id", folderId)
          .order("created_at", { ascending: false })
          .limit(pageSize);

        const { data, error } = await query;
        if (error) throw error;
        if (!cancelled) setDocs(data || []);
      } catch (err) {
        console.error("StoredDocuments: fetch error", err);
        if (!cancelled) setDocs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDocs();

    return () => {
      cancelled = true;
    };
  }, [folderId, pageSize]);

  // search by file_name (schema uses file_name)
  const filtered = docs.filter((d) =>
    (d.file_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const prettyDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="mt-10">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Stored Documents</h3>
            <p className="text-sm text-gray-500">
              These are all uploaded documents that the system can learn from.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search documents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      )}

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Edited On</th>
              <th className="py-3 px-4 font-medium">Created On</th>
              <th className="py-3 px-4 font-medium" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-500">
                  Loading documents...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400">
                  No documents found
                </td>
              </tr>
            ) : (
              filtered.map((doc) => {
                const id = doc.document_id ?? doc.id ?? JSON.stringify(doc);
                const status = (doc.processing_status || "N/A").toString();
                return (
                  <tr key={id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td
                      className="py-3 px-4 text-gray-800 font-medium cursor-pointer"
                      onClick={() => onSelect && onSelect(doc)}
                    >
                      {doc.file_name || "Untitled"}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          status.toLowerCase() === "done" || status.toLowerCase() === "learned"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {doc.updated_at ? prettyDate(doc.updated_at) : "N/A"}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {doc.created_at ? prettyDate(doc.created_at) : "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-gray-200"
                        title="More"
                        onClick={() => console.log("More menu for", doc)}
                      >
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
