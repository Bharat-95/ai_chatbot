"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";



const BUCKET = "documents"; 
const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function UploadDocumentInline({ folder, onClose, onSaved }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addFiles = useCallback(
    (incomingFiles) => {
      const arr = Array.from(incomingFiles || []);
      if (!arr.length) return;
      const allowed = arr.slice(0, Math.max(0, MAX_FILES - files.length));
      const validated = [];
      const errors = [];
      for (const f of allowed) {
        if (f.size > MAX_FILE_SIZE) {
          errors.push(`${f.name} is larger than 100 MB and was skipped.`);
          continue;
        }
        validated.push(f);
      }
      if (errors.length) {
        // eslint-disable-next-line no-alert
        alert(errors.join("\n"));
      }
      if (validated.length === 0) return;
      setFiles((prev) => [...prev, ...validated]);
    },
    [files.length]
  );

  const onInputChange = (e) => {
    const f = e.target.files;
    addFiles(f);
    e.currentTarget.value = null;
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // upload helper: returns array of { file, key, publicUrl }
  const uploadAll = async () => {
    if (!files.length) {
      // eslint-disable-next-line no-alert
      alert("Please select at least one file to upload.");
      return null;
    }
    if (!folder || !folder.folder_id) {
      // eslint-disable-next-line no-alert
      alert("No folder selected.");
      return null;
    }

    setUploading(true);
    const uploaded = [];
    try {
      for (const file of files) {
        // unique path: folder-{folder_id}/{timestamp}-{random}-{filename}
        const timestamp = Date.now();
        const rnd = Math.floor(Math.random() * 1e6);
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `folder-${folder.folder_id}/${timestamp}-${rnd}-${safeName}`;

        // Supabase JS doesn't provide granular progress callbacks for browser upload out of the box.
        // We'll update simple indeterminate progress for UI and set to 100% on success.
        setProgressMap((p) => ({ ...p, [file.name]: 10 }));

        const { data, error } = await supabaseBrowser.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          // continue with other files but show a message
          // eslint-disable-next-line no-alert
          alert(`Failed to upload ${file.name}: ${error.message}`);
          setProgressMap((p) => ({ ...p, [file.name]: 0 }));
          continue;
        }

        setProgressMap((p) => ({ ...p, [file.name]: 90 }));

        // get public url (if bucket is public) or create signed url (expires 1 day)
        let publicUrl = null;
        try {
          const { data: urlData, error: urlErr } =
            await supabaseBrowser.storage.from(BUCKET).getPublicUrl(data.path);
          if (!urlErr && urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
          } else {
            // fallback: create signed URL 24h
            const { data: signed, error: signedErr } =
              await supabaseBrowser.storage
                .from(BUCKET)
                .createSignedUrl(data.path, 60 * 60 * 24);
            if (!signedErr && signed?.signedURL) publicUrl = signed.signedURL;
          }
        } catch (e) {
          console.warn("get url failed", e);
        }

        uploaded.push({ file, path: data.path, publicUrl });
        setProgressMap((p) => ({ ...p, [file.name]: 100 }));
      }

      // update docs count on folder row
      try {
        const increment = uploaded.length;
        const newCount = (folder.docs ?? 0) + increment;
        const { data: updatedFolder, error: updateError } =
          await supabaseBrowser
            .from("knowledge_base")
            .update({ docs: newCount })
            .eq("folder_id", folder.folder_id)
            .select()
            .single();

        if (updateError) {
          console.error("folder docs update error:", updateError);
        } else if (updatedFolder) {
          // pass updated folder back to parent
          onSaved && onSaved(updatedFolder);
        }
      } catch (e) {
        console.error("update docs error:", e);
      }

      // success
      return uploaded;
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };

  const handleUploadClick = async () => {
    const result = await uploadAll();
    if (result && result.length > 0) {
      // eslint-disable-next-line no-alert
      alert(`Uploaded ${result.length} file(s) successfully.`);
      setFiles([]);
      setProgressMap({});
      onClose && onClose();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Upload Documents</h2>
          <p className="text-sm text-gray-500 mt-1">
            Up to {MAX_FILES} files like Word, PowerPoint or PDF, and up to 100 MB
            each.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gray-100 p-3 rounded-full">
              <UploadCloud size={24} />
            </div>
          </div>
          <div className="mb-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
              disabled={uploading}
            >
              Choose files
            </button>
          </div>
          <div className="text-sm text-gray-500 mb-3">
            or drag and drop files here
          </div>
          <div className="text-xs text-gray-400">
            {files.length}/{MAX_FILES} selected
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onInputChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          />
        </div>
      </div>

      {/* Selected files list */}
      <div className="mt-4">
        {files.length === 0 ? (
          <div className="text-sm text-gray-500">No files selected</div>
        ) : (
          <ul className="space-y-3">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-3 border rounded p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-gray-500">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            progressMap[f.name] ?? 0
                          )}%`,
                        }}
                        className="h-full bg-green-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => removeFile(i)}
                    disabled={uploading}
                    className="text-sm px-3 py-1 rounded bg-red-50 text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setFiles([]);
            setProgressMap({});
          }}
          className="px-3 py-2 rounded-lg border border-gray-200"
          disabled={uploading || files.length === 0}
        >
          Clear
        </button>
        <button
          onClick={handleUploadClick}
          disabled={uploading || files.length === 0}
          className={`px-4 py-2 rounded-lg text-white ${
            uploading || files.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
