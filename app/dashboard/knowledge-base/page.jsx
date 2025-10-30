"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  MoreVertical,
  ArrowLeft,
  FolderPlus,
  X,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { LiaPenNibSolid } from "react-icons/lia";
import { PiUploadThin } from "react-icons/pi";
import { IoIosLink } from "react-icons/io";
// inline create document component (updated below)
import CreateDocumentInline from "../_components/CreateDocument";

export default function Page() {
  const sidebarRef = useRef(null);

  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState("User");
  const [showCreateDocument, setShowCreateDocument] = useState(false);

  // menu and inline-delete state
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [confirmDeleteFor, setConfirmDeleteFor] = useState(null);

  // rename modal
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameTargetRef = useRef(null);

  // delete modal fallback
  const [deletingModal, setDeletingModal] = useState(false);
  const deleteTargetRef = useRef(null);

  // documents search inside a folder
  const [docSearch, setDocSearch] = useState("");

  // get current user
  useEffect(() => {
    let mounted = true;
    const getUser = async () => {
      try {
        const { data, error } = await supabaseBrowser.auth.getUser();
        if (error) {
          console.error("getUser error:", error);
          return;
        }
        const user = data?.user ?? null;
        if (!mounted || !user) return;
        setUserId(user.id);
        const metaName =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          null;
        if (metaName) setUserDisplayName(metaName);
        else if (user.email) setUserDisplayName(user.email.split("@")[0]);
        else setUserDisplayName("User");
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch folders for user sorted by updated_at desc
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchFolders = async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from("knowledge_base")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching folders:", error);
        if (!cancelled) setFolders([]);
      } else {
        if (!cancelled) setFolders(data || []);
      }
      if (!cancelled) setLoading(false);
    };

    fetchFolders();

    // subscribe to realtime changes for user's folders (optional)
    const channel = supabaseBrowser
      .channel(`public:knowledge_base:user=${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_base",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabaseBrowser
            .from("knowledge_base")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false });
          setFolders(data || []);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabaseBrowser.removeChannel(channel);
    };
  }, [userId]);

  // close any open menus when clicking outside the sidebar/menu
  useEffect(() => {
    function onDocClick(e) {
      if (!sidebarRef.current) {
        setOpenMenuFor(null);
        setConfirmDeleteFor(null);
        return;
      }
      if (!sidebarRef.current.contains(e.target)) {
        setOpenMenuFor(null);
        setConfirmDeleteFor(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const openCreate = () => {
    setNewName("");
    setShowCreate(true);
  };

  const createFolder = async () => {
    if (!newName.trim() || !userId) return;
    setCreating(true);
    try {
      const payload = {
        user_id: userId,
        folder: newName.trim(),
      };
      const { data, error } = await supabaseBrowser
        .from("knowledge_base")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
      } else if (data) {
        setFolders((prev) => [data, ...prev]);
        setSelectedIdx(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
      setShowCreate(false);
    }
  };

  const openRename = (folder) => {
    setRenameValue(folder.folder || "");
    renameTargetRef.current = folder;
    setRenaming(true);
    setOpenMenuFor(null);
    setConfirmDeleteFor(null);
  };

  const doRename = async () => {
    if (!renameValue.trim() || !renameTargetRef.current) return;
    const target = renameTargetRef.current;
    try {
      const { data, error } = await supabaseBrowser
        .from("knowledge_base")
        .update({ folder: renameValue.trim() })
        .eq("folder_id", target.folder_id)
        .select()
        .single();

      if (error) {
        console.error("Rename error:", error);
      } else if (data) {
        setFolders((prev) =>
          prev.map((f) => (f.folder_id === data.folder_id ? data : f))
        );
        const idx = folders.findIndex((f) => f.folder_id === data.folder_id);
        if (idx >= 0) setSelectedIdx(idx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenaming(false);
      renameTargetRef.current = null;
    }
  };

  // inline delete: first click toggles "Sure?" prompt, second actually deletes
  const requestInlineDelete = (folder) => {
    setConfirmDeleteFor((cur) =>
      cur === folder.folder_id ? null : folder.folder_id
    );
    setOpenMenuFor(folder.folder_id);
  };

  const doDeleteInline = async (folder) => {
    if (!folder) return;
    try {
      const { error } = await supabaseBrowser
        .from("knowledge_base")
        .delete()
        .eq("folder_id", folder.folder_id);

      if (error) {
        console.error("Delete error:", error);
      } else {
        setFolders((prev) =>
          prev.filter((f) => f.folder_id !== folder.folder_id)
        );
        if (
          selectedIdx !== null &&
          folders[selectedIdx]?.folder_id === folder.folder_id
        ) {
          setSelectedIdx(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteFor(null);
      setOpenMenuFor(null);
    }
  };

  const filtered = folders.filter((f) =>
    (f.folder || "").toLowerCase().includes(query.toLowerCase())
  );

  // documents list placeholder (if you later implement separate documents table)
  const docsForSelected = [];
  const docsFiltered = docsForSelected.filter((d) =>
    d.name?.toLowerCase().includes(docSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Left Sidebar */}
      <div
        ref={sidebarRef}
        className="w-80 border-r border-gray-200 flex flex-col"
      >
        <div className="p-4">
          <button
            onClick={openCreate}
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            New Folder
          </button>
        </div>

        <div className="px-4 mb-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search folders..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Folder list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-3 px-4 py-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/5 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/5" />
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No folders found
            </div>
          ) : (
            filtered.map((folder, idx) => {
              const active = selectedIdx === idx;
              return (
                <div
                  key={folder.folder_id}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                    active ? "bg-purple-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1" onClick={() => setSelectedIdx(idx)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {folder.folder}
                        </p>
                        <p className="text-xs text-gray-500">
                          {folder.docs ?? 0} documents • {folder.bots ?? 0} bots
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 ml-3">
                        {/* optional right-side meta */}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setOpenMenuFor(
                          openMenuFor === folder.folder_id
                            ? null
                            : folder.folder_id
                        );
                        if (
                          confirmDeleteFor &&
                          confirmDeleteFor !== folder.folder_id
                        )
                          setConfirmDeleteFor(null);
                      }}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuFor === folder.folder_id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-30">
                        <button
                          onClick={() => openRename(folder)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                        >
                          <Edit3 size={16} className="text-gray-600" />
                          <span className="text-sm text-gray-700">Rename</span>
                        </button>

                        {confirmDeleteFor === folder.folder_id ? (
                          <button
                            onClick={() => doDeleteInline(folder)}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 bg-red-50 hover:bg-red-100"
                          >
                            <div className="text-red-600 text-sm font-semibold">
                              Sure?
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => requestInlineDelete(folder)}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                          >
                            <Trash2 size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Delete
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedIdx(null);
                setShowCreateDocument(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
            {selectedIdx === null ? (
              <h1 className="text-lg font-semibold text-gray-700">Folders</h1>
            ) : (
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {folders[selectedIdx]?.folder}
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <FolderPlus size={16} />
              Create
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {creating ? (
            <div className="animate-pulse w-full space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-48 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/5" />
            </div>
          ) : selectedIdx === null ? (
            <div className="flex items-center gap-4 text-black text-2xl font-medium">
              <ArrowLeft className="mr-2" size={36} />
              Select a folder
            </div>
          ) : (
            // if showCreateDocument true, show inline create document form
            <>
              {showCreateDocument ? (
                <CreateDocumentInline
                  folder={folders[selectedIdx]}
                  initialDocType="write"
                  onClose={() => setShowCreateDocument(false)}
                  onSaved={(updatedFolder) => {
                    if (updatedFolder) {
                      setFolders((prev) =>
                        prev.map((f) =>
                          f.folder_id === updatedFolder.folder_id ? updatedFolder : f
                        )
                      );
                    }
                    setShowCreateDocument(false);
                  }}
                />
              ) : (
                <div className="max-w-6xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-[17px] font-semibold">Create Documents</h2>
                    <p className="text-[14px] text-gray-500 mt-1">
                      You can create a new document in this folder by writing,
                      uploading an existing document or importing a webpage.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowCreateDocument(true)}
                      className="px-4 py-2 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <div>
                        <LiaPenNibSolid size={30} color="blue" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div>
                          <h3 className="font-semibold">Write</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Write or copy paste your document
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="px-4 py-2 border rounded-lg bg-purple-50 border-purple-200">
                      <div className="">
                        <PiUploadThin size={30} color="purple" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div>
                          <h3 className="font-semibold">Upload</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            PDF, Word or Powerpoint files
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2 border rounded-lg bg-green-50 border-green-200">
                      <div className="">
                        <IoIosLink size={30} color="green" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div>
                          <h3 className="font-semibold">Import Website</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Webpage with text content
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stored Documents area */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Stored Documents</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          These are all uploaded documents that the system can learn
                          from.
                        </p>
                      </div>

                      <div>
                        <input
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          placeholder="Search documents"
                          className="border rounded px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    {!folders[selectedIdx]?.docs ||
                    folders[selectedIdx]?.docs === 0 ? (
                      <div className="text-center py-20 border border-gray-50 rounded-lg mt-6">
                        <p className="text-gray-700 font-semibold">
                          Stored Documents
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          These are all uploaded documents that the system can learn
                          from.
                        </p>
                        <div className="mt-8 text-gray-500">NO DOCUMENTS</div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        {/* Replace this with real documents table when you implement documents table */}
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs text-gray-500">
                              <th className="py-2 pl-3">NAME</th>
                              <th className="py-2">STATUS</th>
                              <th className="py-2">EDITED ON</th>
                              <th className="py-2">CREATED ON</th>
                            </tr>
                          </thead>
                          <tbody>
                            {docsFiltered.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-12 text-center text-gray-500"
                                >
                                  NO DOCUMENTS
                                </td>
                              </tr>
                            ) : (
                              docsFiltered.map((d, i) => (
                                <tr key={i} className="border-t">
                                  <td className="py-3 pl-3">{d.name}</td>
                                  <td className="py-3">{d.status}</td>
                                  <td className="py-3">{d.edited_at}</td>
                                  <td className="py-3">{d.created_at}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold">Create Folder</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <label className="text-sm text-gray-600">Folder name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Enter folder name"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="px-4 py-2 rounded-lg bg-black text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRenaming(false)}
          />
          <div className="relative z-60 w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold">Rename Folder</h3>
              <button
                onClick={() => setRenaming(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <label className="text-sm text-gray-600">New name</label>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Enter new folder name"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setRenaming(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={doRename}
                  className="px-4 py-2 rounded-lg bg-black text-white"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal fallback */}
      {deletingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeletingModal(false)}
          />
          <div className="relative z-60 w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold">Delete folder?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete the folder and its documents. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingModal(false)}
                className="px-3 py-2 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteTargetRef.current)
                    await doDeleteInline(deleteTargetRef.current);
                  setDeletingModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
