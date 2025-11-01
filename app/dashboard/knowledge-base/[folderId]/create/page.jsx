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
  Baseline,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Type,
  Italic,
  ListX,
  ListCollapse,
  Bold as BoldIcon,
  Underline as UnderlineIcon,
  CornerDownRight,
  Code as CodeIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
} from "lucide-react";
import { supabaseBrowser } from "../../../../../lib/supabaseBrowser";
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
import TipTapLink from "@tiptap/extension-link";
import ImageModal from "../../../_components/ImageModal";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { offset } from "@floating-ui/dom";
import ListControls from "../../../_components/ListControls";
import Link from "next/link";
import StoredDocuments from "../../_components/StoredDocuments";

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
  const indentStepsRef = useRef(0);
  const savedSelectionRef = useRef(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [hoveredFormatSection, setHoveredFormatSection] = useState("Headings");
  const formatMenuRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalInitial, setImageModalInitial] = useState(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showSpacingLabel, setShowSpacingLabel] = useState(false);

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
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: null },
            height: { default: null },
          };
        },
      }),
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
      TipTapLink.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: "" }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
    ],
    content: `<p style="color:#111827;"></p>`,
    autofocus: false,
    editable: true,
    immediatelyRender: false,
  });

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

  const openImageModal = () => {
    try {
      if (editor && editor.state && editor.state.selection) {
        const sel = editor.state.selection;
        savedSelectionRef.current = { from: sel.from, to: sel.to };
      } else {
        savedSelectionRef.current = null;
      }
    } catch {
      savedSelectionRef.current = null;
    }

    if (!editor) {
      setImageModalInitial(null);
      setShowImageModal(true);
      return;
    }
    try {
      const imgAttrs = editor.getAttributes("image");
      if (imgAttrs && imgAttrs.src) {
        setImageModalInitial({
          src: imgAttrs.src || "",
          alt: imgAttrs.alt || "",
          width: imgAttrs.width || "",
          height: imgAttrs.height || "",
        });
      } else {
        setImageModalInitial(null);
      }
    } catch {
      setImageModalInitial(null);
    }
    setShowImageModal(true);
  };

  const insertImageFromModal = ({ src, alt, width, height }) => {
    setShowImageModal(false);
    if (!editor) return;

    const w =
      width !== undefined && width !== null && width !== ""
        ? parseInt(width, 10)
        : undefined;
    const h =
      height !== undefined && height !== null && height !== ""
        ? parseInt(height, 10)
        : undefined;

    try {
      const saved = savedSelectionRef.current;
      if (saved && Number.isInteger(saved.from)) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: saved.from, to: saved.to })
          .run();
        savedSelectionRef.current = null;
      } else {
        editor.commands.focus && editor.commands.focus();
      }
    } catch (e) {
      console.warn("selection restore failed", e);
    }

    if (!w && !h) {
      try {
        const attrs = { src: src || "" };
        if (alt) attrs.alt = alt;
        if (editor.commands && editor.commands.setImage) {
          editor.chain().focus().setImage(attrs).run();
          editor.commands.focus && editor.commands.focus();
          return;
        }
        if (editor.schema && editor.schema.nodes && editor.schema.nodes.image) {
          editor.chain().focus().insertContent({ type: "image", attrs }).run();
          editor.commands.focus && editor.commands.focus();
          return;
        }
      } catch (e) {}
    }

    const safeSrc = (src || "").replace(/"/g, "&quot;");
    const safeAlt = (alt || "").replace(/"/g, "&quot;");
    const hasWidth = typeof w === "number" && !isNaN(w);
    const hasHeight = typeof h === "number" && !isNaN(h);

    const wrapperStyles = [
      "display:block",
      "overflow:visible",
      "max-width:100%",
      "min-width:40px",
      "min-height:40px",
      "position:relative",
      "margin:0",
      "padding:0",
      "line-height:0",
    ];
    if (hasWidth) wrapperStyles.push(`width:${w}px`);
    if (hasHeight) wrapperStyles.push(`height:${h}px`);
    const wrapperStyle = wrapperStyles.join(";");

    const imgAttrWidth = hasWidth ? ` width="${w}"` : "";
    const imgAttrHeight = hasHeight ? ` height="${h}"` : "";
    const imgStyle =
      hasWidth || hasHeight
        ? `display:block;width:${hasWidth ? `${w}px` : "auto"};height:${
            hasHeight ? `${h}px` : "auto"
          };object-fit:contain;max-width:100%;`
        : `max-width:100%;height:auto;display:block;`;

    const html = `<figure class="resizable-img" contenteditable="false" draggable="true" style="${wrapperStyle}" data-width="${
      hasWidth ? w : ""
    }" data-height="${
      hasHeight ? h : ""
    }"><img src="${safeSrc}" alt="${safeAlt}"${imgAttrWidth}${imgAttrHeight} style="${imgStyle}margin:0;padding:0;display:block;" /></figure><p class="after-img-paragraph"><br/></p>`;

    try {
      editor.chain().focus().insertContent(html).run();
      editor.commands.focus && editor.commands.focus();
    } catch (err) {
      try {
        if (editor.schema && editor.schema.nodes && editor.schema.nodes.image) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: { src: src || "", alt: alt || "" },
            })
            .run();
          editor.commands.focus && editor.commands.focus();
        }
      } catch (e) {
        console.error("insertImageFromModal final fallback failed:", e);
      }
    }

    setTimeout(() => {
      try {
        const { doc } = editor.state;
        const selPos = editor.state.selection.to;
        let targetPos = null;
        doc.descendants((node, pos) => {
          if (targetPos !== null) return false;
          if (pos <= selPos) return;
          if (node.type.name === "paragraph" && node.content.size === 0) {
            targetPos = pos + 1;
            return false;
          }
        });
        if (targetPos !== null) {
          editor
            .chain()
            .focus()
            .setTextSelection({ from: targetPos, to: targetPos })
            .run();
        } else {
          const end = editor.state.doc.content.size - 1;
          editor.chain().focus().setTextSelection({ from: end, to: end }).run();
        }
      } catch (e) {
        console.warn("failed to position caret after inserted image", e);
      }
    }, 20);
  };

  useEffect(() => {
  if (!editor?.view?.dom) return;
  const root = editor.view.dom;

  // small helper for logging so you can open console and see progress
  const log = (...args) => {
    try {
      console.debug("[img-resize]", ...args);
    } catch {}
  };

  log("effect started, root:", root);

  const setImgSizesFromRect = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.setAttribute("data-width", String(w));
    el.setAttribute("data-height", String(h));
    const img = el.querySelector("img");
    if (img) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.setAttribute("width", String(w));
      img.setAttribute("height", String(h));
    }
  };

  const createHandlesIfMissing = (el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el._hasCornerHandles) return;
    el._hasCornerHandles = true;

    // ensure figure is positioned so handles can be absolute within it
    el.style.position = el.style.position || "relative";

    // remember current draggable setting so we can restore it after resize
    el._initialDraggable = el.getAttribute("draggable");

    const corners = ["nw", "ne", "se", "sw"];
    const handles = {};

    corners.forEach((c) => {
      const d = document.createElement("div");
      d.className = `img-resize-corner img-resize-${c}`;
      d.setAttribute("data-corner", c);
      d.setAttribute("role", "button");
      d.setAttribute("tabindex", "0");

      // make sure pointer/touch events are routed to handles and prevent default gestures
      d.style.touchAction = "none";
      d.style.webkitUserSelect = "none";
      d.style.msUserSelect = "none";
      d.style.userSelect = "none";
      d.style.pointerEvents = "auto";

      // helpful for debugging
      d.setAttribute("data-resize-handle", "1");

      el.appendChild(d);
      handles[c] = d;
    });

    let dragging = false;
    let corner = null;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;
    let startRect = null;
    let keepAspect = true;

    const onStart = (ev) => {
      // prevent native behavior and start a resize session
      try {
        ev.preventDefault();
      } catch {}

      // mark this figure as currently resizing so dragstart handlers can ignore it
      el.setAttribute("data-resizing", "1");

      // temporarily disable the figure's draggable attribute so the browser
      // doesn't start a drag operation while we pointermove to resize
      try {
        if (el.hasAttribute("draggable")) {
          el._prevDraggable = el.getAttribute("draggable");
          el.removeAttribute("draggable");
        } else {
          el._prevDraggable = null;
        }
      } catch (e) {
        el._prevDraggable = null;
      }

      dragging = true;
      keepAspect = !ev.altKey;
      corner = (ev.currentTarget || ev.target).getAttribute("data-corner");
      startX =
        (ev.clientX !== undefined && ev.clientX) ||
        (ev.touches && ev.touches[0] && ev.touches[0].clientX) ||
        0;
      startY =
        (ev.clientY !== undefined && ev.clientY) ||
        (ev.touches && ev.touches[0] && ev.touches[0].clientY) ||
        0;
      startRect = el.getBoundingClientRect();
      startW = startRect.width;
      startH = startRect.height;

      // attach global move/end listeners for pointer, mouse and touch
      document.addEventListener("pointermove", onMove, { passive: false });
      document.addEventListener("pointerup", onEnd);
      document.addEventListener("mousemove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onEnd);

      // prevent text selection while resizing
      document.body.style.userSelect = "none";
    };

    const onMove = (ev) => {
      if (!dragging) return;
      try {
        ev.preventDefault();
      } catch {}
      const clientX =
        (ev.clientX !== undefined && ev.clientX) ||
        (ev.touches && ev.touches[0] && ev.touches[0].clientX) ||
        0;
      const clientY =
        (ev.clientY !== undefined && ev.clientY) ||
        (ev.touches && ev.touches[0] && ev.touches[0].clientY) ||
        0;
      const dx = clientX - startX;
      const dy = clientY - startY;

      let newW = startW;
      let newH = startH;
      switch (corner) {
        case "nw":
          newW = Math.max(40, Math.round(startW - dx));
          newH = Math.max(40, Math.round(startH - dy));
          break;
        case "ne":
          newW = Math.max(40, Math.round(startW + dx));
          newH = Math.max(40, Math.round(startH - dy));
          break;
        case "se":
          newW = Math.max(40, Math.round(startW + dx));
          newH = Math.max(40, Math.round(startH + dy));
          break;
        case "sw":
          newW = Math.max(40, Math.round(startW - dx));
          newH = Math.max(40, Math.round(startH + dy));
          break;
        default:
          break;
      }

      if (keepAspect) {
        const aspect = startW / startH || 1;
        if (Math.abs(newW - startW) > Math.abs(newH - startH)) {
          newH = Math.max(40, Math.round(newW / aspect));
        } else {
          newW = Math.max(40, Math.round(newH * aspect));
        }
      }

      el.style.width = `${newW}px`;
      el.style.height = `${newH}px`;
      el.setAttribute("data-width", String(newW));
      el.setAttribute("data-height", String(newH));
      const img = el.querySelector("img");
      if (img) {
        img.style.width = "100%";
        img.style.height = "100%";
        img.setAttribute("width", String(newW));
        img.setAttribute("height", String(newH));
      }
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      corner = null;

      // remove global listeners
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);

      // restore draggable setting
      try {
        if (el._prevDraggable !== undefined) {
          if (el._prevDraggable === null) {
            el.removeAttribute("draggable");
          } else {
            el.setAttribute("draggable", el._prevDraggable);
          }
          delete el._prevDraggable;
        }
      } catch (e) {}

      // clear resizing flag
      el.removeAttribute("data-resizing");

      document.body.style.userSelect = "";
      setImgSizesFromRect(el);
      log("resize ended, new size:", el.style.width, el.style.height);
    };

    // attach multiple start event types for broad compatibility
    Object.values(handles).forEach((h) => {
      h.addEventListener("pointerdown", onStart, { passive: false });
      h.addEventListener("mousedown", onStart, { passive: false });
      h.addEventListener("touchstart", onStart, { passive: false });
    });

    el._removeCornerHandles = () => {
      Object.values(handles).forEach((h) => {
        try {
          h.removeEventListener("pointerdown", onStart);
          h.removeEventListener("mousedown", onStart);
          h.removeEventListener("touchstart", onStart);
        } catch {}
        if (h.parentNode) h.parentNode.removeChild(h);
      });
      delete el._removeCornerHandles;
      delete el._hasCornerHandles;
    };
  };

  const scanAndAttach = (why = "") => {
    const els = root.querySelectorAll(".resizable-img");
    log("scanAndAttach", why, "found", els.length, "elements");
    els.forEach((el) => {
      createHandlesIfMissing(el);
      setImgSizesFromRect(el);
      // set draggable by default so editor drag/drop still works;
      // the resize code will temporarily remove this attribute while resizing
      try {
        if (!el.hasAttribute("draggable")) el.setAttribute("draggable", "true");
      } catch {}
    });
  };

  // initial scan
  scanAndAttach("initial");

  // re-scan after a short delay (editor may mount children asynchronously)
  const retryTimer = setTimeout(() => scanAndAttach("retry-after-100ms"), 100);

  // also observe DOM changes and run scan when new nodes appear
  const mo = new MutationObserver((mutations) => {
    let added = 0;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) added += m.addedNodes.length;
    }
    if (added > 0) {
      scanAndAttach("mutation-observer");
    }
  });
  mo.observe(root, { childList: true, subtree: true });

  // drag-move support (unchanged) but guard against resizing state
  let draggedHtml = null;
  let originNode = null;

  const onDragStart = (e) => {
    const target =
      e.target instanceof HTMLElement
        ? e.target.closest(".resizable-img")
        : null;
    // if a figure is currently resizing, ignore dragstart
    if (target && target.getAttribute && target.getAttribute("data-resizing") === "1") {
      return;
    }
    if (!target) return;
    originNode = target;
    draggedHtml = target.outerHTML;
    try {
      e.dataTransfer.setData("text/html", draggedHtml);
      e.dataTransfer.setData("text/plain", "image-drag");
    } catch {}
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e) => {
    e.preventDefault();
    if (!draggedHtml) return;
    const posResult = editor.view.posAtCoords({
      left: e.clientX,
      top: e.clientY,
    });
    let insertPos = null;
    if (posResult && typeof posResult.pos === "number")
      insertPos = posResult.pos;
    try {
      if (insertPos !== null) {
        editor.chain().focus().insertContentAt(insertPos, draggedHtml).run();
      } else {
        editor.chain().focus().insertContent(draggedHtml).run();
      }
      if (originNode && originNode.parentNode)
        originNode.parentNode.removeChild(originNode);
    } catch (err) {
      console.error("drop insert failed", err);
    } finally {
      draggedHtml = null;
      originNode = null;
    }
  };

  root.addEventListener("dragstart", onDragStart);
  root.addEventListener("dragover", onDragOver);
  root.addEventListener("drop", onDrop);

  return () => {
    clearTimeout(retryTimer);
    mo.disconnect();
    root.removeEventListener("dragstart", onDragStart);
    root.removeEventListener("dragover", onDragOver);
    root.removeEventListener("drop", onDrop);
    root.querySelectorAll &&
      root.querySelectorAll(".resizable-img").forEach((el) => {
        if (el._removeCornerHandles) el._removeCornerHandles();
      });
    log("cleanup effect");
  };
}, [editor]);


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

  const applyWordSpacing = () => {
    if (!editor) return;
    const pm = editor.view?.dom;
    if (!pm) return;
    indentStepsRef.current += 1;
    const ch = Math.max(indentStepsRef.current, 0);
    pm.style.paddingLeft = `${ch}ch`;
  };

  const removeWordSpacing = () => {
    if (!editor) return;
    const pm = editor.view?.dom;
    if (!pm) return;
    indentStepsRef.current = Math.max(indentStepsRef.current - 1, 0);
    const ch = indentStepsRef.current;
    pm.style.paddingLeft = ch === 0 ? "" : `${ch}ch`;
  };

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
            <div
              className="format-dropdown"
              role="menu"
              aria-label="Formatting menu"
            >
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
                      Underline{isInlineActive("underline") ? <Check /> : null}
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
                      Subscript{isInlineActive("subscript") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyInline("code")}
                      className="format-right-row"
                    >
                      Code{isInlineActive("code") ? <Check /> : null}
                    </button>
                  </div>
                )}

                {hoveredFormatSection === "Blocks" && (
                  <div className="format-right-inner">
                    <button
                      onClick={() => applyBlock("paragraph")}
                      className="format-right-row"
                    >
                      Paragraph{isBlockActive("paragraph") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyBlock("blockquote")}
                      className="format-right-row"
                    >
                      Blockquote{isBlockActive("blockquote") ? <Check /> : null}
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
                      Pre (Code block){isBlockActive("pre") ? <Check /> : null}
                    </button>
                  </div>
                )}

                {hoveredFormatSection === "Align" && (
                  <div className="format-right-inner">
                    <button
                      onClick={() => applyAlign("left")}
                      className="format-right-row"
                    >
                      Left{isAlignActive("left") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("center")}
                      className="format-right-row"
                    >
                      Center{isAlignActive("center") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("right")}
                      className="format-right-row"
                    >
                      Right{isAlignActive("right") ? <Check /> : null}
                    </button>
                    <button
                      onClick={() => applyAlign("justify")}
                      className="format-right-row"
                    >
                      Justify{isAlignActive("justify") ? <Check /> : null}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ListControls editor={editor} />

        <div className=" flex items-center gap-1 relative">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTextColorPicker((s) => !s);
                setShowBgColorPicker(false);
              }}
              title="Text color"
              className="p-2 hover:bg-gray-100"
            >
              <Baseline />
            </button>

            {showTextColorPicker && (
              <div
                className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 grid grid-cols-5 gap-2 w-40"
                role="menu"
                aria-label="Text color picker"
              >
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
                    onClick={() => {
                      editor.chain().focus().setColor(c).run();
                      setShowTextColorPicker(false);
                    }}
                    style={{ background: c }}
                    className="h-6 w-6 rounded border"
                    aria-label={`Text color ${c}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBgColorPicker((s) => !s);
                setShowTextColorPicker(false);
              }}
              title="Text background"
              className="p-2 hover:bg-gray-100"
            >
              <PiPencilLineBold />
            </button>

            {showBgColorPicker && (
              <div
                className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 grid grid-cols-5 gap-2 w-40"
                role="menu"
                aria-label="Text background colors"
              >
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
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: c })
                        .run();
                      setShowBgColorPicker(false);
                    }}
                    style={{ background: c }}
                    className="h-6 w-6 rounded border"
                    aria-label={`Highlight ${c}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 relative">
          <button
            title="Add word spacing"
            className="p-2 hover:bg-gray-100"
            onClick={() => {
              applyWordSpacing();
            }}
          >
            <ListCollapse />
          </button>

          <button
            title="Remove word spacing"
            className="p-2 hover:bg-gray-100"
            onClick={() => {
              removeWordSpacing();
            }}
          >
            <ListX />
          </button>
        </div>

        <div className="px-2">
          <button
            onClick={openImageModal}
            title="Insert image"
            className="p-2 hover:bg-gray-100"
          >
            <ImageIcon size={16} />
          </button>
          <button
            onClick={insertVideo}
            title="Insert video"
            className="p-2 hover:bg-gray-100"
          >
            <Video size={16} />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
            title="Clear formatting"
            className="p-2 hover:bg-gray-100"
          >
            <Type size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          min-height: 260px;
          padding: 12px;
          outline: none;
          font-size: 16px;
          line-height: 1.6;
        }

        .resizable-img {
          display: block;
          overflow: visible;
          max-width: 100%;
          min-width: 40px;
          min-height: 40px;
          margin: 0;
          padding: 0;
          line-height: 0;
          border: none;
          background: transparent;
        }

        .resizable-img img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          object-fit: contain;
        }

        .tiptap-editor .ProseMirror .resizable-img {
          line-height: 0;
          margin: 0;
          display: block;
        }

        .tiptap-editor .ProseMirror .resizable-img > img {
          display: block !important;
          margin: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }

        .tiptap-editor .ProseMirror .resizable-img + p.after-img-paragraph {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          height: 0 !important;
          line-height: 0 !important;
          overflow: hidden !important;
          padding: 0 !important;
          display: block !important;
        }

        .img-resize-handle {
          position: absolute;
          width: 14px;
          height: 14px;
          right: 6px;
          bottom: 6px;
          background: rgba(16, 24, 40, 0.9);
          border-radius: 3px;
          cursor: nwse-resize;
          z-index: 40;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .img-resize-handle:focus {
          outline: 2px solid rgba(59, 130, 246, 0.5);
        }

        .tiptap-editor .ProseMirror figure.resizable-img:focus-within,
        .tiptap-editor
          .ProseMirror
          figure.resizable-img[contenteditable="false"]:hover {
          outline: 2px solid rgba(59, 130, 246, 0.15);
          outline-offset: 2px;
          border-radius: 6px;
        }

        .tiptap-editor .ProseMirror p:empty {
          display: none !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 0 !important;
          line-height: 0 !important;
        }

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

        .tiptap-editor .ProseMirror ul:not([class^="pm-list-"]) {
          list-style: disc;
          margin-left: 1.2rem !important;
          padding-left: 0.6rem !important;
        }
        .tiptap-editor .ProseMirror ol:not([class^="pm-list-"]) {
          list-style: decimal;
          margin-left: 1.2rem !important;
          padding-left: 0.6rem !important;
        }
        .tiptap-editor .ProseMirror li {
          margin: 0.12rem 0 !important;
        }

        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid #c7d2fe;
          background: linear-gradient(
            90deg,
            rgba(243, 244, 246, 0.8),
            rgba(255, 255, 255, 0)
          );
          padding: 12px 16px;
          margin: 0.5rem 0;
          border-radius: 6px;
          color: #0f172a;
          font-style: italic;
        }

        .tiptap-editor .ProseMirror .cody-div {
          border: 1px dashed rgba(15, 23, 42, 0.08);
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

        .format-dropdown {
          position: absolute;
          left: 0;
          top: calc(100% + 8px);
          display: flex;
          min-width: 360px;
          background: #fff;
          border: 1px solid #e6e9ef;
          box-shadow: 0 6px 18px rgba(16, 24, 40, 0.12);
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

        .color-picker-swatch {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          cursor: pointer;
        }
        .tiptap-editor .ProseMirror figure.resizable-img {
          display: inline-block !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 0 !important;
          vertical-align: top !important;
          overflow: visible !important;
          border: none !important;
          background: transparent !important;
          position: relative !important;
        }
        .tiptap-editor .ProseMirror figure.resizable-img > img {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        .tiptap-editor .ProseMirror p.after-img-paragraph {
          margin: 0 !important;
          padding: 0 !important;
          height: 0 !important;
          line-height: 0 !important;
          overflow: hidden !important;
        }
        .img-resize-handle {
          position: absolute;
          width: 14px;
          height: 14px;
          right: 6px;
          bottom: 6px;
          background: rgba(16, 24, 40, 0.9);
          border-radius: 3px;
          cursor: nwse-resize;
          z-index: 60;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          pointer-events: auto;
        }
        .img-resize-handle:focus {
          outline: 2px solid rgba(59, 130, 246, 0.5);
        }
        .img-resize-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #3b82f6; /* blue */
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          z-index: 80;
          cursor: nwse-resize;
          pointer-events: auto;
        }

        /* place each corner properly */
        .img-resize-nw {
          left: -6px;
          top: -6px;
          cursor: nwse-resize;
        }
        .img-resize-ne {
          right: -6px;
          top: -6px;
          cursor: nesw-resize;
        }
        .img-resize-se {
          right: -6px;
          bottom: -6px;
          cursor: nwse-resize;
        }
        .img-resize-sw {
          left: -6px;
          bottom: -6px;
          cursor: nesw-resize;
        }

        .img-resize-corner:focus {
          outline: 2px solid rgba(59, 130, 246, 0.35);
        }

        /* visual outline while hovering/active on figure */
        .tiptap-editor .ProseMirror figure.resizable-img:focus-within,
        .tiptap-editor
          .ProseMirror
          figure.resizable-img[contenteditable="false"]:hover {
          outline: 2px solid rgba(59, 130, 246, 0.18);
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>

      <div className="flex items-center justify-between mb-4 pt-10">
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Back arrow that navigates to the folder page */}
          <Link
            href={`/dashboard/knowledge-base/${folder?.folder_id || ""}`}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="Back to Folder"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>

          <div>
            <h2 className="text-lg font-semibold">Create Documents</h2>
            <p className="text-sm text-gray-500">
              Create a new document in this folder by writing, uploading, or
              importing a webpage.
            </p>
          </div>
        </div>

       
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
            <p className="text-sm text-gray-600 mt-1">
              Write or paste your document
            </p>
          </button>

          <button
            onClick={() => {
              setDocType("upload");
              setStep("form");
            }}
            className="px-4 py-6 text-left border rounded-lg bg-purple-50 border-purple-200"
          >
            <h3 className="font-semibold">Upload</h3>
            <p className="text-sm text-gray-600 mt-1">
              PDF, Word or PowerPoint
            </p>
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
            <label className="block text-sm text-gray-700">
              Document Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mt-2 w-full border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Content</label>

            <div className="border border-gray-300 rounded bg-white overflow-visible">
              <MenuBar editor={editor} />

              <div className="">
                <div className="tiptap-editor">
                  <EditorContent
                    editor={editor}
                    className="max-w-none flex-grow"
                  />

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
                          onClick={() =>
                            editor.chain().focus().toggleBold().run()
                          }
                          className={`px-2 py-1 ${
                            editor.isActive("bold") ? "bg-gray-100" : ""
                          }`}
                          title="Bold"
                        >
                          <BoldIcon size={14} />
                        </button>
                        <button
                          onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                          }
                          className={`px-2 py-1 ${
                            editor.isActive("italic") ? "bg-gray-100" : ""
                          }`}
                          title="Italic"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                          }
                          className={`px-2 py-1 ${
                            editor.isActive("underline") ? "bg-gray-100" : ""
                          }`}
                          title="Underline"
                        >
                          <UnderlineIcon size={14} />
                        </button>
                        <button
                          onClick={() =>
                            editor.chain().focus().toggleCode().run()
                          }
                          className={`px-2 py-1 ${
                            editor.isActive("code") ? "bg-gray-100" : ""
                          }`}
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
            <button
              onClick={() => setStep("choose")}
              className="px-3 py-2 rounded-lg border border-gray-200"
            >
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

      <StoredDocuments />

      <ImageModal
        open={showImageModal}
        initial={imageModalInitial}
        onClose={() => setShowImageModal(false)}
        onSubmit={(payload) => insertImageFromModal(payload)}
      />
    </div>
  );
}
