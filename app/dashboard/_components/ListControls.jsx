"use client";

import React, { useEffect, useState, useCallback } from "react";
import { List, ListOrdered } from "lucide-react";

/**
 * ListControls — persistent style using node attributes + DOM sync
 *
 * - updateAttributes stores the class in the document model
 * - syncNodeAttrsToDom walks doc and applies pm-list-* classes to the rendered <ul>/<ol>
 * - injects global CSS for visible markers (dark color)
 */
export default function ListControls({ editor }) {
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);

  const DEFAULT_MARKER_COLOR = "#0f172a";

  // Inject global stylesheet once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('style[data-pm-global-list-styles]')) return;

    const css = `
.tiptap-editor .ProseMirror .pm-list-disc { list-style: none !important; padding-left: 1.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-disc > li { position: relative !important; padding-left: 0.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-disc > li::before { content: "•" !important; position: absolute !important; left: -1.05rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 800 !important; font-size: 1.05em !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-circle { list-style: none !important; padding-left: 1.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-circle > li { position: relative !important; padding-left: 0.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-circle > li::before { content: "◦" !important; position: absolute !important; left: -1.05rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; font-size: 1.05em !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-square { list-style: none !important; padding-left: 1.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-square > li { position: relative !important; padding-left: 0.9rem !important; }
.tiptap-editor .ProseMirror .pm-list-square > li::before { content: "▪" !important; position: absolute !important; left: -1.05rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 800 !important; font-size: 0.95em !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-decimal { list-style: none !important; padding-left: 2.2rem !important; }
.tiptap-editor .ProseMirror .pm-list-decimal > li { position: relative !important; padding-left: 0.9rem !important; counter-increment: pm-decimal; }
.tiptap-editor .ProseMirror .pm-list-decimal > li::before { content: counter(pm-decimal) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; font-size: 0.98em !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-lower-alpha > li { counter-increment: pm-la; }
.tiptap-editor .ProseMirror .pm-list-lower-alpha > li::before { content: counter(pm-la, lower-alpha) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-upper-alpha > li { counter-increment: pm-ua; }
.tiptap-editor .ProseMirror .pm-list-upper-alpha > li::before { content: counter(pm-ua, upper-alpha) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-lower-roman > li { counter-increment: pm-lr; }
.tiptap-editor .ProseMirror .pm-list-lower-roman > li::before { content: counter(pm-lr, lower-roman) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-upper-roman > li { counter-increment: pm-ur; }
.tiptap-editor .ProseMirror .pm-list-upper-roman > li::before { content: counter(pm-ur, upper-roman) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; color: ${DEFAULT_MARKER_COLOR} !important; }

.tiptap-editor .ProseMirror .pm-list-lower-greek > li { counter-increment: pm-lg; }
.tiptap-editor .ProseMirror .ProseMirror .pm-list-lower-greek > li::before { content: counter(pm-lg, lower-greek) "." !important; position: absolute !important; left: -1.6rem !important; top: 50% !important; transform: translateY(-50%) !important; font-weight: 700 !important; color: ${DEFAULT_MARKER_COLOR} !important; }

/* Defensive hide native ::marker */
.tiptap-editor .ProseMirror .pm-list-disc li::marker,
.tiptap-editor .ProseMirror .pm-list-circle li::marker,
.tiptap-editor .ProseMirror .pm-list-square li::marker,
.tiptap-editor .ProseMirror .pm-list-decimal li::marker,
.tiptap-editor .ProseMirror .pm-list-lower-alpha li::marker,
.tiptap-editor .ProseMirror .pm-list-upper-alpha li::marker,
.tiptap-editor .ProseMirror .pm-list-lower-roman li::marker,
.tiptap-editor .ProseMirror .pm-list-upper-roman li::marker,
.tiptap-editor .ProseMirror .pm-list-lower-greek li::marker {
  color: transparent !important;
  font-size: 0 !important;
  width: 0 !important;
}
`;
    const style = document.createElement("style");
    style.setAttribute("data-pm-global-list-styles", "1");
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // sync node attrs -> DOM classes for all list nodes in the document
  const syncNodeAttrsToDom = useCallback(() => {
    if (!editor || !editor.view) return;
    try {
      const { doc, tr } = editor.state;
      // walk doc and find list nodes
      doc.descendants((node, pos) => {
        if (node.type.name === "bulletList" || node.type.name === "orderedList") {
          // determine desired class stored in attrs.class (if any)
          const desiredClass = node.attrs && node.attrs.class ? node.attrs.class : null;
          // find DOM at a position inside the list (pos + 1 is safe)
          const p = Math.min(pos + 1, editor.state.doc.content.size);
          try {
            const domInfo = editor.view.domAtPos(p);
            let el = domInfo.node && domInfo.node.nodeType === 1 ? domInfo.node : domInfo.node.parentElement;
            // walk up to find actual UL/OL
            while (el && el.tagName !== "UL" && el.tagName !== "OL") {
              el = el.parentElement;
            }
            if (el) {
              // remove existing pm-list-* classes
              Array.from(el.classList)
                .filter((c) => c.startsWith("pm-list-"))
                .forEach((c) => el.classList.remove(c));
              if (desiredClass) {
                el.classList.add(desiredClass);
              }
            }
          } catch (e) {
            // swallow
          }
        }
        return true;
      });
    } catch (e) {
      // swallow
    }
  }, [editor]);

  // make sure we sync on mount and on every editor update
  useEffect(() => {
    if (!editor) return;
    // initial sync (editor may already have lists)
    syncNodeAttrsToDom();
    // listen to updates
    const handler = () => syncNodeAttrsToDom();
    editor.on("update", handler);
    editor.on("transaction", handler);
    return () => {
      try {
        editor.off("update", handler);
        editor.off("transaction", handler);
      } catch (e) {}
    };
  }, [editor, syncNodeAttrsToDom]);

  // helper to update node attrs and then sync DOM (keeps UX snappy)
  const setBulletListClass = async (className) => {
    if (!editor) return;
    await editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { class: className }).run();
    // schedule a DOM sync a tick later so ProseMirror re-render completes
    setTimeout(syncNodeAttrsToDom, 18);
  };

  const setOrderedListClass = async (className) => {
    if (!editor) return;
    await editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { class: className }).run();
    setTimeout(syncNodeAttrsToDom, 18);
  };

  // mapping helpers
  const applyBulletStyle = (style) => {
    const mapping = { disc: "pm-list-disc", circle: "pm-list-circle", square: "pm-list-square" };
    setBulletListClass(mapping[style] || mapping.disc);
    setShowBulletDropdown(false);
  };

  const applyOrderedStyle = (styleKey) => {
    const mapping = {
      decimal: "pm-list-decimal",
      lowerAlpha: "pm-list-lower-alpha",
      upperAlpha: "pm-list-upper-alpha",
      lowerRoman: "pm-list-lower-roman",
      upperRoman: "pm-list-upper-roman",
      lowerGreek: "pm-list-lower-greek",
    };
    setOrderedListClass(mapping[styleKey] || mapping.decimal);
    setShowNumberDropdown(false);
  };

  const toggleBulletWithDefault = async () => {
    if (!editor) return;
    await editor.chain().focus().toggleBulletList().run();
    if (editor.isActive("bulletList")) {
      await editor.chain().focus().updateAttributes("bulletList", { class: "pm-list-disc" }).run();
    }
    setTimeout(syncNodeAttrsToDom, 18);
  };

  const toggleOrderedWithDefault = async () => {
    if (!editor) return;
    await editor.chain().focus().toggleOrderedList().run();
    if (editor.isActive("orderedList")) {
      await editor.chain().focus().updateAttributes("orderedList", { class: "pm-list-decimal" }).run();
    }
    setTimeout(syncNodeAttrsToDom, 18);
  };

  return (
    <div className="relative flex items-center">
      <div className="flex items-center rounded">
        <button
          onClick={() => {
            toggleBulletWithDefault();
            setShowNumberDropdown(false);
            setShowBulletDropdown(false);
          }}
          title="Bulleted list (default)"
          className={`p-2 hover:bg-gray-100 ${editor?.isActive("bulletList") ? "bg-gray-100" : ""}`}
        >
          <List size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBulletDropdown((s) => !s);
            setShowNumberDropdown(false);
          }}
          title="More bullet styles"
          className="p-2 hover:bg-gray-100"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {showBulletDropdown && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 w-44">
          <div className="grid grid-cols-1 gap-1">
            <button onClick={() => applyBulletStyle("disc")} className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-gray-800 inline-block" />
              <span className="text-sm">Filled dot</span>
            </button>

            <button onClick={() => applyBulletStyle("circle")} className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
              <span style={{ width: 12, height: 12, borderRadius: 999, border: "2px solid #374151", display: "inline-block" }} />
              <span className="text-sm">Hollow dot</span>
            </button>

            <button onClick={() => applyBulletStyle("square")} className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
              <span className="w-3 h-3 bg-gray-800 inline-block" />
              <span className="text-sm">Square</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative flex items-center ml-1">
        <div className="flex items-center rounded">
          <button
            onClick={() => {
              toggleOrderedWithDefault();
              setShowNumberDropdown(false);
              setShowBulletDropdown(false);
            }}
            title="Numbered list (default)"
            className={`p-2 hover:bg-gray-100 ${editor?.isActive("orderedList") ? "bg-gray-100" : ""}`}
          >
            <ListOrdered size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNumberDropdown((s) => !s);
              setShowBulletDropdown(false);
            }}
            title="More numbering styles"
            className="p-2 hover:bg-gray-100"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>

        {showNumberDropdown && (
          <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-3 w-56">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => applyOrderedStyle("decimal")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">1.</div>
                <div className="text-sm">1,2,3</div>
              </button>
              <button onClick={() => applyOrderedStyle("lowerAlpha")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">a.</div>
                <div className="text-sm">a, b, c</div>
              </button>
              <button onClick={() => applyOrderedStyle("upperAlpha")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">A.</div>
                <div className="text-sm">A, B, C</div>
              </button>
              <button onClick={() => applyOrderedStyle("lowerRoman")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">i.</div>
                <div className="text-sm">i, ii, iii</div>
              </button>
              <button onClick={() => applyOrderedStyle("upperRoman")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">I.</div>
                <div className="text-sm">I, II, III</div>
              </button>
              <button onClick={() => applyOrderedStyle("lowerGreek")} className="text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3">
                <div className="font-semibold">α.</div>
                <div className="text-sm">α, β, γ</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
