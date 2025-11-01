"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import StoredDocuments from "../../_components/StoredDocuments";
import { MoreVertical } from "lucide-react";

const BUCKET = "kb-files";
const MAX_FILES = 10;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".xlsx",
  ".xls",
];

function extFromName(name = "") {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}
function isAllowedFile(file) {
  const ext = extFromName(file.name);
  return ALLOWED_EXTENSIONS.includes(ext);
}
function uniqueFilePath(folderId, filename) {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 1000000);
  const safeName = filename.replace(/[^a-zA-Z0-9.\-_() ]/g, "");
  const prefix = folderId ? `${folderId}` : "public";
  return `${prefix}/${ts}_${rand}_${safeName}`;
}

export default function UploadAreaWithList({
  folderId = null,
  onUploaded = null,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [detailDoc, setDetailDoc] = useState(null);
  const [renameDocId, setRenameDocId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [changeFolderFor, setChangeFolderFor] = useState(null);
  const [listKey, setListKey] = useState(0);

  const fetchUser = async (sb) => {
    try {
      const { data, error } = await sb.auth.getUser();
      if (!error && data?.user) setUserId(data.user.id);
    } catch {}
  };

  const fetchDocuments = async (sb) => {
    if (!sb || !userId) return;
    try {
      const { data, error } = await sb
        .from("documents")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });
      if (!error && data) setDocuments(data);
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      let supabaseBrowser = null;
      try {
        const mod = await import("../../../lib/supabaseBrowser").catch(
          () => null
        );
        supabaseBrowser = mod?.supabaseBrowser || null;
      } catch {}
      if (supabaseBrowser) await fetchUser(supabaseBrowser);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let supabaseBrowser = null;
      try {
        const mod = await import("../../../lib/supabaseBrowser").catch(
          () => null
        );
        supabaseBrowser = mod?.supabaseBrowser || null;
      } catch {}
      if (supabaseBrowser && userId) await fetchDocuments(supabaseBrowser);
    })();
  }, [userId, folderId]);

  const addFiles = useCallback(
    (filesList) => {
      setGlobalError("");
      const files = Array.from(filesList || []);
      if (!files.length) return;
      if (items.length + files.length > MAX_FILES) {
        setGlobalError(`You can upload up to ${MAX_FILES} files.`);
        return;
      }
      const toAdd = files.map((f) => {
        const id = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        let error = null;
        if (!isAllowedFile(f)) error = "File type not supported";
        else if (f.size > MAX_FILE_BYTES)
          error = `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)} MB)`;
        return {
          id,
          file: f,
          name: f.name,
          size: f.size,
          status: error ? "error" : "ready",
          error,
          path: null,
          publicUrl: null,
          content: null,
        };
      });
      setItems((prev) => [...prev, ...toAdd]);
    },
    [items.length]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    addFiles(dt.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const openFileDialog = () => {
    fileInputRef.current && fileInputRef.current.click();
  };
  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };
  const clearAll = () => setItems([]);

  async function extractTextFromFile(file) {
    const ext = extFromName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (ext === ".txt") return await file.text();

      if (ext === ".pdf") {
        try {
          const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let txt = "";
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const pageText = content.items.map((i) => i.str || "").join(" ");
            txt += (p > 1 ? "\n\n" : "") + pageText;
          }
          if (txt && txt.trim().length > 10) return txt.trim();
        } catch (e) {}
        try {
          const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const { createWorker } = await import("tesseract.js");
          const worker = createWorker();
          await worker.load();
          await worker.loadLanguage("eng");
          await worker.initialize("eng");
          let ocrText = "";
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d");
            await page.render({ canvasContext: ctx, viewport }).promise;
            const { data } = await worker.recognize(canvas);
            ocrText += (data?.text || "") + "\n\n";
          }
          await worker.terminate();
          return ocrText.trim();
        } catch (ocrErr) {
          return "";
        }
      }

      if (ext === ".docx" || ext === ".doc") {
        try {
          const mammothModule = await import("mammoth").catch(() => null);
          const mammoth = mammothModule?.default || mammothModule;
          if (mammoth && typeof mammoth.extractRawText === "function") {
            const res = await mammoth.extractRawText({ arrayBuffer });
            return (res.value || "").trim();
          }
          if (mammoth && typeof mammoth.convertToHtml === "function") {
            const res = await mammoth.convertToHtml({ arrayBuffer });
            return (res.value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          }
        } catch (e) {}
        return "";
      }

      if (ext === ".xlsx" || ext === ".xls") {
        try {
          const XLSX = (await import("xlsx")).default;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          let text = "";
          workbook.SheetNames.forEach((name) => {
            const sheet = workbook.Sheets[name];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            text += csv + "\n\n";
          });
          return text.trim();
        } catch (e) {}
        return "";
      }

      if (ext === ".pptx" || ext === ".ppt") {
        try {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(arrayBuffer);
          const slidePaths = Object.keys(zip.files).filter((n) => n.startsWith("ppt/slides/slide") && n.endsWith(".xml"));
          slidePaths.sort();
          let all = "";
          for (const sp of slidePaths) {
            const xml = await zip.file(sp).async("string");
            const matches = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/gis)].map((m) => m[1]);
            if (matches.length) {
              all += matches.join(" ") + "\n\n";
            }
          }
          if (all.trim().length > 0) return all.trim();
        } catch (e) {}
        try {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(arrayBuffer);
          const slidePaths = Object.keys(zip.files).filter((n) => n.startsWith("ppt/slides/slide") && n.endsWith(".xml"));
          slidePaths.sort();
          const { createWorker } = await import("tesseract.js");
          const worker = createWorker();
          await worker.load();
          await worker.loadLanguage("eng");
          await worker.initialize("eng");
          let ocrAll = "";
          for (const sp of slidePaths) {
            const xml = await zip.file(sp).async("string");
            const matches = [...xml.matchAll(/<p:sp.*?>[\s\S]*?<\/p:sp>/gis)];
            if (matches.length) {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const textBlob = matches.map((m) => m[0]).join(" ");
              const blob = new Blob([textBlob], { type: "text/plain" });
              const img = document.createElement("img");
              const url = URL.createObjectURL(blob);
              img.src = url;
              await new Promise((res) => (img.onload = res));
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              const { data } = await worker.recognize(canvas);
              ocrAll += (data?.text || "") + "\n\n";
              URL.revokeObjectURL(url);
            }
          }
          await worker.terminate();
          return ocrAll.trim();
        } catch (e) {
          return "";
        }
      }

      return "";
    } catch (err) {
      return "";
    }
  }

  const uploadAll = async () => {
    setGlobalError("");
    if (!items.length) {
      setGlobalError("No files to upload.");
      return;
    }
    if (items.length > MAX_FILES) {
      setGlobalError(`You can upload up to ${MAX_FILES} files.`);
      return;
    }
    setBusy(true);
    const uploadedResults = [];
    let supabaseBrowser = null;
    try {
      const mod = await import("../../../lib/supabaseBrowser").catch(
        () => null
      );
      supabaseBrowser = mod?.supabaseBrowser || null;
    } catch {
      supabaseBrowser = null;
    }
    for (const it of items) {
      if (it.status === "done" || it.status === "error") {
        uploadedResults.push(it);
        continue;
      }
      setItems((prev) =>
        prev.map((p) => (p.id === it.id ? { ...p, status: "uploading", error: null } : p))
      );
      try {
        let publicUrl = null;
        let path = null;
        if (supabaseBrowser && supabaseBrowser.storage) {
          const p = uniqueFilePath(folderId, it.name);
          const { data: uploadData, error: uploadError } = await supabaseBrowser.storage.from(BUCKET).upload(p, it.file, { cacheControl: "3600", upsert: false });
          if (uploadError || !uploadData) throw uploadError || new Error("upload failed");
          path = uploadData.path;
          const { data: publicData } = supabaseBrowser.storage.from(BUCKET).getPublicUrl(path);
          publicUrl = publicData?.publicUrl || null;
        } else {
          publicUrl = URL.createObjectURL(it.file);
          path = `local/${it.name}`;
        }
        const contentText = await extractTextFromFile(it.file);
        const fileExt = extFromName(it.name).replace(".", "");
        const mimeType = it.file.type || null;
        const fileSize = it.size || null;
        if (supabaseBrowser && supabaseBrowser.from && userId) {
          try {
            const docPayload = {
              folder_id: folderId,
              user_id: userId,
              file_name: it.name,
              file_ext: fileExt,
              mime_type: mimeType,
              file_size: fileSize,
              file_path: path,
              public_url: publicUrl,
              converted_path: null,
              extracted_text: contentText,
              processing_status: "done",
              processed_at: new Date().toISOString(),
              meta: {},
            };
            const { data: insertData, error: insertError } = await supabaseBrowser.from("documents").insert([docPayload]).select().single();
            if (!insertError && insertData) setDocuments((prev) => [insertData, ...prev]);
          } catch (e) {}
        } else {
          const clientDoc = {
            document_id: `${Date.now()}_${Math.random()}`,
            folder_id: folderId,
            user_id: userId,
            file_name: it.name,
            file_ext: fileExt,
            mime_type: mimeType,
            file_size: fileSize,
            file_path: path,
            public_url: publicUrl,
            converted_path: null,
            extracted_text: contentText,
            processing_status: "done",
            processed_at: new Date().toISOString(),
            meta: {},
            created_at: new Date().toISOString(),
          };
          setDocuments((prev) => [clientDoc, ...prev]);
        }
        const updated = {
          ...it,
          status: "done",
          path,
          publicUrl,
          content: contentText,
        };
        setItems((prev) => prev.map((p) => (p.id === it.id ? updated : p)));
        uploadedResults.push(updated);
      } catch (err) {
        const message = err?.message || "Upload failed";
        setItems((prev) =>
          prev.map((p) =>
            p.id === it.id ? { ...p, status: "error", error: message } : p
          )
        );
        uploadedResults.push({ ...it, status: "error", error: message });
      }
    }
    setBusy(false);
    const success = uploadedResults.filter((r) => r.status === "done");
    setListKey((k) => k + 1);
    if (onUploaded) onUploaded(success);
  };

  const openMenu = (id) => setMenuOpenFor((s) => (s === id ? null : id));
  const openPreview = (doc) => {
    setMenuOpenFor(null);
    setDetailDoc(doc);
  };
  const startRename = (doc) => {
    setMenuOpenFor(null);
    setRenameDocId(doc.document_id || doc.id);
    setRenameValue(doc.file_name || "");
  };

  const submitRename = async () => {
    if (!renameDocId || !renameValue.trim()) return;
    let supabaseBrowser = null;
    try {
      const mod = await import("../../../lib/supabaseBrowser").catch(
        () => null
      );
      supabaseBrowser = mod?.supabaseBrowser || null;
    } catch {}
    try {
      if (supabaseBrowser && supabaseBrowser.from) {
        const { data, error } = await supabaseBrowser
          .from("documents")
          .update({ file_name: renameValue.trim() })
          .eq("document_id", renameDocId)
          .select()
          .single();
        if (!error && data) {
          setDocuments((prev) => prev.map((d) => (d.document_id === data.document_id ? data : d)));
          if (detailDoc && (detailDoc.document_id || detailDoc.document_id) === data.document_id) setDetailDoc(data);
        }
      } else {
        setDocuments((prev) => prev.map((d) => (d.document_id === renameDocId ? { ...d, file_name: renameValue } : d)));
        if (detailDoc && detailDoc.document_id === renameDocId) setDetailDoc({ ...detailDoc, file_name: renameValue });
      }
    } catch (e) {
    } finally {
      setRenameDocId(null);
      setRenameValue("");
    }
  };

  const startDelete = (id) => {
    setMenuOpenFor(null);
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    if (!id) return;
    let supabaseBrowser = null;
    try {
      const mod = await import("../../../lib/supabaseBrowser").catch(
        () => null
      );
      supabaseBrowser = mod?.supabaseBrowser || null;
    } catch {}
    try {
      if (supabaseBrowser && supabaseBrowser.from) {
        const { error } = await supabaseBrowser
          .from("documents")
          .delete()
          .eq("document_id", id);
        if (error) throw error;
        setDocuments((prev) => prev.filter((d) => d.document_id !== id));
      } else {
        setDocuments((prev) => prev.filter((d) => d.document_id !== id));
      }
      if (detailDoc && detailDoc.document_id === id) setDetailDoc(null);
    } catch (e) {
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const changeFolder = (doc) => {
    setMenuOpenFor(null);
    setChangeFolderFor(doc);
  };

  return (
    <div className="pt-4 px-10">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-10 text-center ${
          dragOver
            ? "border-blue-300 shadow-md bg-blue-50/20"
            : "border-gray-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(",")}
        />
        <div className="mx-auto w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3v12"
              stroke="#374151"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 8l5-5 5 5"
              stroke="#374151"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21H3"
              stroke="#374151"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-lg font-medium mb-1">
          <button onClick={openFileDialog} className="underline">
            Click to upload
          </button>{" "}
          or drag and drop
        </div>
        <div className="text-sm text-gray-500">
          Up to {MAX_FILES} files like word, powerpoint or PDF, and upto{" "}
          {MAX_FILE_BYTES / (1024 * 1024)} MB each.
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          {items.length} file(s) selected
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearAll}
            className="px-3 py-1 border rounded text-sm"
          >
            Clear
          </button>
          <button
            onClick={uploadAll}
            disabled={busy || items.length === 0}
            className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-60"
          >
            {busy ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {globalError && (
        <div className="text-sm text-red-600 mt-2">{globalError}</div>
      )}

      <div className="space-y-2 mt-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between gap-3 border rounded p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 text-sm text-gray-500">
                {extFromName(it.name).replace(".", "").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-900 truncate">{it.name}</div>
                <div className="text-xs text-gray-500">
                  {(it.size / 1024 / 1024).toFixed(2)} MB • {it.status}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {it.status === "error" && (
                <div className="text-sm text-red-600">{it.error}</div>
              )}
              {it.status === "uploading" && (
                <div className="text-sm text-gray-500">Uploading…</div>
              )}
              {it.status === "done" && it.publicUrl && (
                <>
                  <a
                    href={it.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => {
                      const w = window.open("", "_blank");
                      if (w) {
                        const contentHtml = `<pre style="white-space:pre-wrap;font-family:Inter,system-ui,Arial;padding:16px;">${(
                          it.content || ""
                        )
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")}</pre>`;
                        w.document.write(contentHtml);
                        w.document.title = it.name + " — extracted text";
                        w.document.close();
                      }
                    }}
                    className="px-2 py-1 rounded border text-sm"
                    title="View extracted text"
                  >
                    View Text
                  </button>
                </>
              )}
              <button
                onClick={() => removeItem(it.id)}
                className="px-2 py-1 rounded border text-sm"
                title="Remove file"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Stored Documents</h3>
        <p className="text-sm text-gray-500 mt-1">
          These are all uploaded documents that can be previewed or opened.
        </p>
        <StoredDocuments key={listKey} folderId={folderId} />
      </div>

      {detailDoc && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40">
          <div className="bg-white w-full max-w-5xl rounded shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <div className="text-lg font-semibold">
                  {detailDoc.file_name}
                </div>
                <div className="text-sm text-green-600">
                  Cody has learned this document successfully
                </div>
              </div>
              <div className="flex items-center gap-3">
                {detailDoc.public_url && (
                  <button
                    onClick={() => window.open(detailDoc.public_url, "_blank")}
                    className="px-3 py-2 border rounded text-sm"
                  >
                    View Original
                  </button>
                )}
                <button
                  onClick={() => {
                    setRenameDocId(detailDoc.document_id);
                    setRenameValue(detailDoc.file_name || "");
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmId(detailDoc.document_id);
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDetailDoc(null)}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ minHeight: 420 }} className="p-6">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {detailDoc.extracted_text ||
                  detailDoc.extracted_text ||
                  detailDoc.content ||
                  "No extracted text available."}
              </div>
            </div>
          </div>
        </div>
      )}

      {renameDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Rename Document</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="border rounded w-full px-3 py-2 outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRenameDocId(null);
                  setRenameValue("");
                }}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitRename}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {changeFolderFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Change Folder</h3>
            <p className="text-sm text-gray-500">
              Implement folder picker here. This is a stub to match UI.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setChangeFolderFor(null)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setChangeFolderFor(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
            <div className="rounded-md overflow-hidden">
              <div className="bg-red-50 px-4 py-3">
                <div className="text-red-800 font-semibold">Sure?</div>
              </div>
              <div className="flex justify-end gap-3 p-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
