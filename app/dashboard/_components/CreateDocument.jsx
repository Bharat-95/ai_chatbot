"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  RotateCcw,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Video,
  Type,
  Italic,
  Bold as BoldIcon,
  Underline as UnderlineIcon,
  CornerDownRight,
  Code as CodeIcon,
  List as ListIcon, // kept for compatibility if used elsewhere
  ListOrdered as ListOrderedIcon,
} from "lucide-react";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import { PiPencilLineBold } from "react-icons/pi";

import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Blockquote from "@tiptap/extension-blockquote";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";

/* New extensions for color / background highlight */
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import { offset } from "@floating-ui/dom";

/* New list controls component (moved logic) */
import ListControls from "./ListControls";

export default function CreateDocumentInline({
  folder,
  onClose,
  onSaved,
  initialDocType = "write",
}) {
  const [step, setStep] = useState("choose");
  const [docType, setDocType] = useState("write");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [hoveredFormatSection, setHoveredFormatSection] = useState("Headings");
  const formatMenuRef = useRef(null);

  // small local UI toggles (including list/popover state)
  // list dropdown states moved to ListControls; keep other toggles here
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  useEffect(() => {
    function onDocClick(e) {
      if (!formatMenuRef.current) return;
      if (!formatMenuRef.current.contains(e.target)) {
        setShowFormatMenu(false);
        setHoveredFormatSection("Headings");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (initialDocType) {
      setDocType(initialDocType);
      setStep("form");
      setTitle("");
    }
  }, [initialDocType]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      CodeBlock,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Superscript,
      Subscript,
      Blockquote,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: "" }),

      /* color/highlight helpers */
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
    ],
    content: `<p style="color:#111827;"></p>`,
    autofocus: false,
    editable: true,
    immediatelyRender: false,
  });

  /* ---------- Helpers ---------- */
  const applyHeading = (level) => {
    if (!editor) return;
    editor.chain().focus().setNode("heading", { level }).run();
    setShowFormatMenu(false);
    setHoveredFormatSection("Headings");
  };

  const applyInline = (type) => {
    if (!editor) return;
    switch (type) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "superscript":
        editor.chain().focus().toggleSuperscript().run();
        break;
      case "subscript":
        editor.chain().focus().toggleSubscript().run();
        break;
      case "code":
        editor.chain().focus().toggleCode().run();
        break;
      default:
        break;
    }
    setShowFormatMenu(false);
    setHoveredFormatSection("Headings");
  };

  const applyBlock = (type) => {
    if (!editor) return;
    switch (type) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "pre":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "div":
        editor
          .chain()
          .focus()
          .insertContent(
            `<div class="cody-div" data-placeholder="Div block">Your div content...</div>`
          )
          .run();
        break;
      default:
        break;
    }
    setShowFormatMenu(false);
    setHoveredFormatSection("Headings");
  };

  const applyAlign = (side) => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(side).run();
    setShowFormatMenu(false);
    setHoveredFormatSection("Headings");
  };

  const insertImage = async () => {
    if (!editor) return;
    const url = prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertVideo = async () => {
    if (!editor) return;
    const url = prompt("Video URL (embeddable URL)");
    if (!url) return;
    const iframe = `<p><iframe src="${url}" frameborder="0" allowfullscreen style="max-width:100%;height:320px;"></iframe></p>`;
    editor.chain().focus().insertContent(iframe).run();
  };

  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();

  const saveDocument = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const htmlContent = editor ? editor.getHTML() : "";
    try {
      const { data, error } = await supabaseBrowser
        .from("knowledge_base")
        .update({ docs: (folder.docs ?? 0) + 1 })
        .eq("folder_id", folder.folder_id)
        .select()
        .single();
      if (error) throw error;
      onSaved && onSaved({ ...data, lastSavedHtml: htmlContent });
      onClose && onClose();
    } catch (err) {
      console.error("saveDocument error:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Active checks & small utils ---------- */
  const isHeadingActive = (lvl) => editor?.isActive("heading", { level: lvl });
  const isInlineActive = (type) => {
    if (!editor) return false;
    switch (type) {
      case "bold":
        return editor.isActive("bold");
      case "italic":
        return editor.isActive("italic");
      case "underline":
        return editor.isActive("underline");
      case "strike":
        return editor.isActive("strike");
      case "superscript":
        return editor.isActive("superscript");
      case "subscript":
        return editor.isActive("subscript");
      case "code":
        return editor.isActive("code");
      default:
        return false;
    }
  };
  const isBlockActive = (type) => {
    if (!editor) return false;
    switch (type) {
      case "paragraph":
        return editor.isActive("paragraph");
      case "blockquote":
        return editor.isActive("blockquote");
      case "pre":
        return editor.isActive("codeBlock");
      default:
        return false;
    }
  };
  const isAlignActive = (align) => {
    try {
      return editor?.isActive({ textAlign: align });
    } catch {
      return false;
    }
  };
  const Check = () => <span className="ml-2 text-green-600 font-bold">✓</span>;

  /* ---------- Toolbar UI (MenuBar) ---------- */
  const MenuBar = ({ editor }) => {
    if (!editor) return null;
    const currentBlockLabel = () => {
      const a = editor.getAttributes("heading");
      if (a && a.level) return `Heading ${a.level}`;
      if (editor.isActive("paragraph")) return "Paragraph";
      return "Paragraph";
    };

    const colorPalette = [
      "#000000",
      "#0f172a",
      "#ef4444",
      "#f97316",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#7c3aed",
      "#ec4899",
      "#06b6d4",
    ];

    return (
      <div className="flex items-center gap-1 px-2 bg-white border-b border-gray-300">
        <button onClick={undo} title="Undo" className="p-2 hover:bg-gray-100">
          <RotateCcw size={16} />
        </button>
        <button onClick={redo} title="Redo" className="p-2 hover:bg-gray-100">
          <RotateCw size={16} />
        </button>

        {/* Paragraph dropdown */}
        <div className="relative" ref={formatMenuRef}>
          <button
            onClick={() => {
              setShowFormatMenu((s) => !s);
              setHoveredFormatSection("Headings");
            }}
            className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 rounded"
            title="Format"
          >
            <span className="text-sm">{currentBlockLabel()}</span>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              className="inline-block"
              aria-hidden
            >
              <path
                d="M1 1l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          {showFormatMenu && (
            <div className="format-dropdown" role="menu" aria-label="Formatting menu">
              <div className="format-left" role="presentation">
                <button
                  onMouseEnter={() => setHoveredFormatSection("Headings")}
                  className={`format-left-item ${
                    hoveredFormatSection === "Headings" ? "active" : ""
                  }`}
                >
                  Headings
                </button>
                <button
                  onMouseEnter={() => setHoveredFormatSection("Inline")}
                  className={`format-left-item ${
                    hoveredFormatSection === "Inline" ? "active" : ""
                  }`}
                >
                  Inline
                </button>
                <button
                  onMouseEnter={() => setHoveredFormatSection("Blocks")}
                  className={`format-left-item ${
                    hoveredFormatSection === "Blocks" ? "active" : ""
                  }`}
                >
                  Blocks
                </button>
                <button
                  onMouseEnter={() => setHoveredFormatSection("Align")}
                  className={`format-left-item ${
                    hoveredFormatSection === "Align" ? "active" : ""
                  }`}
                >
                  Align
                </button>
              </div>

              <div className="format-right" role="presentation">
                {hoveredFormatSection === "Headings" && (
                  <div className="format-right-inner">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => applyHeading(n)}
                        className="format-right-row"
                        title={`Heading ${n}`}
                      >
                        <span className={`format-heading preview-h${n}`}>
                          Heading {n}
                        </span>
                        {isHeadingActive(n) ? <Check /> : null}
                      </button>
                    ))}
                  </div>
                )}

                {hoveredFormatSection === "Inline" && (
                  <div className="format-right-inner">
                    <button
                      onClick={() => applyInline("bold")}
                      className="format-right-row"
                    >
                      <strong>Bold</strong>
                      {isInlineActive("bold") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("italic")}
                      className="format-right-row"
                    >
                      <em>Italic</em>
                      {isInlineActive("italic") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("underline")}
                      className="format-right-row"
                    >
                      Underline
                      {isInlineActive("underline") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("strike")}
                      className="format-right-row"
                    >
                      <s>Strikethrough</s>
                      {isInlineActive("strike") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("superscript")}
                      className="format-right-row"
                    >
                      Superscript
                      {isInlineActive("superscript") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("subscript")}
                      className="format-right-row"
                    >
                      Subscript
                      {isInlineActive("subscript") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("code")}
                      className="format-right-row"
                    >
                      Code
                      {isInlineActive("code") ? <Check /> : null}
                    </button>
                  </div>
                )}

                {hoveredFormatSection === "Blocks" && (
                  <div className="format-right-inner">
                    <button
                      onClick={() => applyBlock("paragraph")}
                      className="format-right-row"
                    >
                      Paragraph
                      {isBlockActive("paragraph") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyBlock("blockquote")}
                      className="format-right-row"
                    >
                      Blockquote
                      {isBlockActive("blockquote") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyBlock("div")}
                      className="format-right-row"
                    >
                      Div
                    </button>
                    <button
                      onClick={() => applyBlock("pre")}
                      className="format-right-row"
                    >
                      Pre (Code block)
                      {isBlockActive("pre") ? <Check /> : null}
                    </button>
                  </div>
                )}

                {hoveredFormatSection === "Align" && (
                  <div className="format-right-inner">
                    <button
                      onClick={() => applyAlign("left")}
                      className="format-right-row"
                    >
                      Left
                      {isAlignActive("left") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("center")}
                      className="format-right-row"
                    >
                      Center
                      {isAlignActive("center") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("right")}
                      className="format-right-row"
                    >
                      Right
                      {isAlignActive("right") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("justify")}
                      className="format-right-row"
                    >
                      Justify
                      {isAlignActive("justify") ? <Check /> : null}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Move list UI into ListControls component (keeps same UI/markup) ===== */}
        <ListControls editor={editor} />

        <div className="ml-auto flex items-center gap-1 relative">
          <div className="relative">
            <button
              onClick={() => {
                setShowTextColorPicker((s) => !s);
                setShowBgColorPicker(false);
              }}
              title="Text color"
              className="p-2 hover:bg-gray-100"
            >
              A
            </button>
            {showTextColorPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 grid grid-cols-5 gap-2 w-40">
                {[
                  "#000000",
                  "#0f172a",
                  "#ef4444",
                  "#f97316",
                  "#f59e0b",
                  "#10b981",
                  "#3b82f6",
                  "#7c3aed",
                  "#ec4899",
                  "#06b6d4",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => editor.chain().focus().setColor(c).run()}
                    style={{ background: c }}
                    className="h-6 w-6 rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowBgColorPicker((s) => !s);
                setShowTextColorPicker(false);
              }}
              title="Text background"
              className="p-2 hover:bg-gray-100"
            >
              <PiPencilLineBold />
            </button>
            {showBgColorPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 grid grid-cols-5 gap-2 w-40">
                {[
                  "#000000",
                  "#0f172a",
                  "#ef4444",
                  "#f97316",
                  "#f59e0b",
                  "#10b981",
                  "#3b82f6",
                  "#7c3aed",
                  "#ec4899",
                  "#06b6d4",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                    style={{ background: c }}
                    className="h-6 w-6 rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* blockquote icon */}
        <div className="px-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 hover:bg-gray-100 ${editor.isActive("blockquote") ? "bg-gray-100" : ""}`}
            title="Blockquote"
          >
            <CornerDownRight size={16} />
          </button>
        </div>

        {/* image / video / clear */}
        <div className="px-2">
          <button onClick={insertImage} title="Insert image" className="p-2 hover:bg-gray-100">
            <ImageIcon size={16} />
          </button>
          <button onClick={insertVideo} title="Insert video" className="p-2 hover:bg-gray-100">
            <Video size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear formatting"
            className="p-2 hover:bg-gray-100"
          >
            <Type size={16} />
          </button>
        </div>
      </div>
    );
  };

  /* ---------- Render & scoped editor CSS ---------- */
  return (
    <div className="w-full max-w-4xl mx-auto">
      <style jsx global>{`
        /* Editor box: leaner height */
        .tiptap-editor .ProseMirror {
          min-height: 260px;
          padding: 12px;
          outline: none;
          font-size: 16px;
          line-height: 1.6;
        }

        /* explicit heading sizes */
        .tiptap-editor .ProseMirror h1 {
          font-size: 32px !important;
          margin: 0 0 0.5em !important;
        }
        .tiptap-editor .ProseMirror h2 {
          font-size: 26px !important;
          margin: 0 0 0.45em !important;
        }
        .tiptap-editor .ProseMirror h3 {
          font-size: 22px !important;
          margin: 0 0 0.4em !important;
        }
        .tiptap-editor .ProseMirror h4 {
          font-size: 18px !important;
          margin: 0 0 0.35em !important;
        }
        .tiptap-editor .ProseMirror h5 {
          font-size: 16px !important;
          margin: 0 0 0.3em !important;
        }
        .tiptap-editor .ProseMirror h6 {
          font-size: 14px !important;
          margin: 0 0 0.25em !important;
        }

        /* Lists inside editor */
        .tiptap-editor .ProseMirror ul {
          list-style: disc;
          margin-left: 1.2rem !important;
          padding-left: 0.6rem !important;
        }
        .tiptap-editor .ProseMirror ol {
          list-style: decimal;
          margin-left: 1.2rem !important;
          padding-left: 0.6rem !important;
        }
        .tiptap-editor .ProseMirror li {
          margin: 0.12rem 0 !important;
        }

        /* Blockquote style */
        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #c7d2fe;
          background: linear-gradient(90deg, rgba(243,244,246,0.8), rgba(255,255,255,0));
          padding: 12px 16px;
          margin: 0.5rem 0;
          border-radius: 6px;
          color: #0f172a;
          font-style: italic;
        }

        .tiptap-editor .ProseMirror .cody-div {
          border: 1px dashed rgba(15,23,42,0.08);
          padding: 10px;
          border-radius: 6px;
          background: #ffffff;
          color: #0f172a;
        }

        .tiptap-editor .ProseMirror pre {
          background: #f6f8fa;
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
        }

        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .tippy-box {
          z-index: 9999 !important;
        }

        /* Formatting dropdown styles */
        .format-dropdown {
          position: absolute;
          left: 0;
          top: calc(100% + 8px);
          display: flex;
          min-width: 360px;
          background: #fff;
          border: 1px solid #e6e9ef;
          box-shadow: 0 6px 18px rgba(16,24,40,0.12);
          border-radius: 8px;
          z-index: 3000;
          overflow: visible;
        }

        .format-left {
          width: 150px;
          border-right: 1px solid #e6e9ef;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .format-left-item {
          padding: 12px 14px;
          text-align: left;
          font-size: 15px;
          color: #1f2937;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          min-height: 56px;
        }

        .format-left-item.active,
        .format-left-item:hover {
          background: #f3f4f6;
        }

        .format-right {
          flex: 1;
          padding: 8px 12px;
          max-height: none;
          overflow: visible;
        }

        .format-right-inner {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .format-right-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          gap: 12px;
          line-height: 1.15;
        }

        .format-right-row:hover {
          background: #fafafa;
        }

        .format-heading {
          font-weight: 700;
          color: #0f172a;
        }
        .preview-h1 {
          font-size: 34px;
        }
        .preview-h2 {
          font-size: 28px;
        }
        .preview-h3 {
          font-size: 22px;
        }
        .preview-h4 {
          font-size: 18px;
        }
        .preview-h5 {
          font-size: 15px;
        }
        .preview-h6 {
          font-size: 13px;
          color: #334155;
        }

        /* List dropdown visuals (matching screenshots) */
        .list-style-dropdown {
          width: 560px;
        }
        .list-style-dropdown .list-section {
          width: 100%;
        }
        .sample-box .num {
          font-weight: 600;
          color: #1f2937;
          width: 18px;
          text-align: left;
        }
        .sample-box .bar {
          border-radius: 4px;
        }
        .sample-box .dot {
          display: inline-block;
        }
        .sample-box .sq {
          display: inline-block;
        }

        /* small color picker visuals */
        .color-picker-swatch {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          cursor: pointer;
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Create Documents</h2>
          <p className="text-sm text-gray-500">
            Create a new document in this folder by writing, uploading, or importing a webpage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600 mr-2">{folder?.folder}</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
      </div>

      {step === "choose" && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => {
              setDocType("write");
              setStep("form");
              setTimeout(() => editor?.commands?.focus?.(), 60);
            }}
            className="px-4 py-6 text-left border rounded-lg bg-blue-50 border-blue-200"
          >
            <h3 className="font-semibold">Write</h3>
            <p className="text-sm text-gray-600 mt-1">Write or paste your document</p>
          </button>

          <button
            onClick={() => {
              setDocType("upload");
              setStep("form");
            }}
            className="px-4 py-6 text-left border rounded-lg bg-purple-50 border-purple-200"
          >
            <h3 className="font-semibold">Upload</h3>
            <p className="text-sm text-gray-600 mt-1">PDF, Word or PowerPoint</p>
          </button>

          <button
            onClick={() => {
              setDocType("import");
              setStep("form");
            }}
            className="px-4 py-6 text-left border rounded-lg bg-green-50 border-green-200"
          >
            <h3 className="font-semibold">Import Website</h3>
            <p className="text-sm text-gray-600 mt-1">Import webpage text</p>
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-700">Document Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mt-2 w-full border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Content</label>

            {/* overflow-visible so dropdowns can overflow outside box */}
            <div className="border border-gray-300 rounded bg-white overflow-visible">
              <MenuBar editor={editor} />

              <div className="">
                <div className="tiptap-editor">
                  <EditorContent editor={editor} className="max-w-none flex-grow" />

                  {editor && editor.state && (
                    <BubbleMenu
                      editor={editor}
                      options={{ placement: "top", middleware: [offset(6)] }}
                      shouldShow={() => {
                        try {
                          const state = editor.state;
                          if (!state || !state.selection) return false;
                          const { from, to } = state.selection;
                          return from !== to;
                        } catch (e) {
                          return false;
                        }
                      }}
                    >
                      <div className="bg-white border border-gray-200 shadow rounded flex items-center gap-1 p-1">
                        <button
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`px-2 py-1 ${editor.isActive("bold") ? "bg-gray-100" : ""}`}
                          title="Bold"
                        >
                          <BoldIcon size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`px-2 py-1 ${editor.isActive("italic") ? "bg-gray-100" : ""}`}
                          title="Italic"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleUnderline().run()}
                          className={`px-2 py-1 ${editor.isActive("underline") ? "bg-gray-100" : ""}`}
                          title="Underline"
                        >
                          <UnderlineIcon size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleCode().run()}
                          className={`px-2 py-1 ${editor.isActive("code") ? "bg-gray-100" : ""}`}
                          title="Inline code"
                        >
                          <CodeIcon size={14} />
                        </button>
                      </div>
                    </BubbleMenu>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep("choose")} className="px-3 py-2 rounded-lg border border-gray-200">
              Back
            </button>
            <button
              onClick={saveDocument}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold">Stored Documents</h3>
        <p className="text-sm text-gray-500 mt-1">These are all uploaded documents that the system can learn from.</p>

        <div className="text-center py-20 border border-gray-50 rounded-lg mt-6">
          <div className="text-gray-500">NO DOCUMENTS</div>
        </div>
      </div>
    </div>
  );
}
