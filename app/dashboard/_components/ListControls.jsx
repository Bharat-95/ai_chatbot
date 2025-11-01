"use client";

import React, { useEffect, useState, useCallback } from "react";
import { List, ListOrdered } from "lucide-react";

/**
 * ListControls — robust sync
 *
 * - Applies pm-list-* classes to the actual <ul>/<ol> DOM nodes found via closest()
 * - Forces a CSS variable --pm-marker-color inline on the list and its <li>s
 * - Ensures ordered lists have counter-reset
 *
 * Usage: <ListControls editor={editor} />
 */
export default function ListControls({ editor }) {
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);

  const DEFAULT_MARKER_COLOR = "#0f172a";

  /* -------------------------
     Global CSS (injected once)
     ------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector('style[data-pm-global-list-styles]')) return;

    const css = `
:root { --pm-default-marker: ${DEFAULT_MARKER_COLOR}; }

/* Base: apply padding and make room for pseudo markers */
.tiptap-editor .ProseMirror [class*="pm-list-"] { padding-left: 1.9rem !important; margin-left: 0 !important; }
.tiptap-editor .ProseMirror [class*="pm-list-"] > li { position: relative !important; padding-left: 0.9rem !important; }

/* BULLETS */
.tiptap-editor .ProseMirror .pm-list-disc > li::before {
  content: "•" !important;
  position: absolute !important;
  left: -1.05rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 800 !important;
  font-size: 1.05em !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
  -webkit-text-fill-color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-circle > li::before {
  content: "◦" !important;
  position: absolute !important;
  left: -1.05rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  font-size: 1.05em !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
  -webkit-text-fill-color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-square > li::before {
  content: "▪" !important;
  position: absolute !important;
  left: -1.05rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 800 !important;
  font-size: 0.95em !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
  -webkit-text-fill-color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

/* ORDERED: counter-reset on the list container + counter-increment on li */
.tiptap-editor .ProseMirror .pm-list-decimal { counter-reset: pm-decimal; }
.tiptap-editor .ProseMirror .pm-list-decimal > li { counter-increment: pm-decimal; }
.tiptap-editor .ProseMirror .pm-list-decimal > li::before {
  content: counter(pm-decimal) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  font-size: 0.98em !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

/* other ordered formats */
.tiptap-editor .ProseMirror .pm-list-lower-alpha { counter-reset: pm-la; }
.tiptap-editor .ProseMirror .pm-list-lower-alpha > li { counter-increment: pm-la; }
.tiptap-editor .ProseMirror .pm-list-lower-alpha > li::before {
  content: counter(pm-la, lower-alpha) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-upper-alpha { counter-reset: pm-ua; }
.tiptap-editor .ProseMirror .pm-list-upper-alpha > li { counter-increment: pm-ua; }
.tiptap-editor .ProseMirror .pm-list-upper-alpha > li::before {
  content: counter(pm-ua, upper-alpha) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-lower-roman { counter-reset: pm-lr; }
.tiptap-editor .ProseMirror .pm-list-lower-roman > li { counter-increment: pm-lr; }
.tiptap-editor .ProseMirror .pm-list-lower-roman > li::before {
  content: counter(pm-lr, lower-roman) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-upper-roman { counter-reset: pm-ur; }
.tiptap-editor .ProseMirror .pm-list-upper-roman > li { counter-increment: pm-ur; }
.tiptap-editor .ProseMirror .pm-list-upper-roman > li::before {
  content: counter(pm-ur, upper-roman) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

.tiptap-editor .ProseMirror .pm-list-lower-greek { counter-reset: pm-lg; }
.tiptap-editor .ProseMirror .pm-list-lower-greek > li { counter-increment: pm-lg; }
.tiptap-editor .ProseMirror .pm-list-lower-greek > li::before {
  content: counter(pm-lg, lower-greek) "." !important;
  position: absolute !important;
  left: -1.6rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-weight: 700 !important;
  color: var(--pm-marker-color, var(--pm-default-marker)) !important;
}

/* Defensive: hide native markers for any pm-list-* */
.tiptap-editor .ProseMirror [class*="pm-list-"] li::marker,
.tiptap-editor .ProseMirror [class*="pm-list-"] li::-webkit-marker,
.tiptap-editor .ProseMirror [class*="pm-list-"] li::-moz-list-marker {
  color: transparent !important;
  font-size: 0 !important;
  width: 0 !important;
  content: none !important;
  -webkit-text-fill-color: transparent !important;
}
`;

    const style = document.createElement("style");
    style.setAttribute("data-pm-global-list-styles", "1");
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  /* -------------------------
     Helpers: set class on node(s) in selection
     ------------------------- */
  const setClassOnListsInSelection = useCallback(
    (nodeName, className) => {
      if (!editor?.state) return;
      const { state, view } = editor;
      const { from, to } = state.selection;
      const tr = state.tr;
      let mutated = false;

      state.doc.descendants((node, pos) => {
        if (pos + node.nodeSize <= from) return true;
        if (pos >= to) return false;

        if (node.type.name === nodeName) {
          const newAttrs = { ...node.attrs, class: className };
          tr.setNodeMarkup(pos, undefined, newAttrs);
          mutated = true;
        }
        return true;
      });

      if (mutated) view.dispatch(tr);
    },
    [editor]
  );

  /* -------------------------
     Get current list class (for active highlight)
     ------------------------- */
  const getCurrentListClass = useCallback(
    (type) => {
      if (!editor?.state) return null;
      const { state } = editor;
      let found = null;

      state.doc.descendants((node, pos) => {
        if (node.type.name === type) {
          const sel = state.selection;
          const inside = pos >= sel.from && pos + node.nodeSize <= sel.to;
          const active = editor.isActive(node.type.name);
          if (inside || active) {
            found = node.attrs?.class || null;
            return false;
          }
        }
        return true;
      });
      return found;
    },
    [editor]
  );

  /* -------------------------
     Sync node attrs → DOM and force inline var
     ------------------------- */
  const syncNodeAttrsToDom = useCallback(() => {
    if (!editor?.view) return;
    try {
      const { doc } = editor.state;
      doc.descendants((node, pos) => {
        if (node.type.name !== "bulletList" && node.type.name !== "orderedList")
          return true;

        const desiredClass = node.attrs?.class || null;
        // domAtPos may return a child; use position+1 then closest()
        const p = Math.min(pos + 1, editor.state.doc.content.size);
        try {
          const domInfo = editor.view.domAtPos(p);
          let el = domInfo?.node;
          if (el && el.nodeType !== 1) el = el.parentElement;
          if (el) {
            // find the containing UL/OL
            const listEl = el.closest && el.closest("ul,ol");
            if (listEl) {
              // Remove previous pm-list-* classes
              Array.from(listEl.classList)
                .filter((c) => c.startsWith("pm-list-"))
                .forEach((c) => listEl.classList.remove(c));
              if (desiredClass) listEl.classList.add(desiredClass);

              // inline force the CSS variable on the list and each LI (defensive)
              try {
                listEl.style.setProperty("--pm-marker-color", DEFAULT_MARKER_COLOR, "important");
                Array.from(listEl.querySelectorAll("li")).forEach((li) =>
                  li.style.setProperty("--pm-marker-color", DEFAULT_MARKER_COLOR, "important")
                );
              } catch (e) {
                // ignore
              }
            }
          }
        } catch (e) {
          // swallow per-item failures
        }
        return true;
      });
    } catch (e) {
      // swallow
    }
  }, [editor]);

  /* -------------------------
     Sync on updates
     ------------------------- */
  useEffect(() => {
    if (!editor) return;
    syncNodeAttrsToDom();
    const handler = () => syncNodeAttrsToDom();
    editor.on("update", handler);
    editor.on("transaction", handler);
    return () => {
      try {
        editor.off("update", handler);
        editor.off("transaction", handler);
      } catch (_) {}
    };
  }, [editor, syncNodeAttrsToDom]);

  /* -------------------------
     Style appliers
     ------------------------- */
  const applyBulletStyle = (style) => {
    const mapping = {
      disc: "pm-list-disc",
      circle: "pm-list-circle",
      square: "pm-list-square",
    };
    if (!editor) return;
    setClassOnListsInSelection("bulletList", mapping[style]);
    setTimeout(syncNodeAttrsToDom, 10);
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
    if (!editor) return;
    setClassOnListsInSelection("orderedList", mapping[styleKey]);
    setTimeout(syncNodeAttrsToDom, 10);
    setShowNumberDropdown(false);
  };

  const toggleBulletWithDefault = async () => {
    if (!editor) return;
    await editor.chain().focus().toggleBulletList().run();
    setClassOnListsInSelection("bulletList", "pm-list-disc");
    setTimeout(syncNodeAttrsToDom, 10);
  };

  const toggleOrderedWithDefault = async () => {
    if (!editor) return;
    await editor.chain().focus().toggleOrderedList().run();
    setClassOnListsInSelection("orderedList", "pm-list-decimal");
    setTimeout(syncNodeAttrsToDom, 10);
  };

  /* -------------------------
     Render
     ------------------------- */
  const currentBulletClass = getCurrentListClass("bulletList");
  const currentNumberClass = getCurrentListClass("orderedList");

  return (
    <div className="relative flex items-center gap-1">
      {/* BULLET */}
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
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {showBulletDropdown && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-2 w-44">
          <div className="grid grid-cols-1 gap-1">
            <button onClick={() => applyBulletStyle("disc")} className={`w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3 ${currentBulletClass === "pm-list-disc" ? "bg-gray-50" : ""}`}>
              <span className="w-3 h-3 rounded-full bg-black inline-block" />
              <span className="text-sm">Filled dot</span>
            </button>

            <button onClick={() => applyBulletStyle("circle")} className={`w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3 ${currentBulletClass === "pm-list-circle" ? "bg-gray-50" : ""}`}>
              <span style={{ width: 12, height: 12, borderRadius: 999, border: "2px solid #374151", display: "inline-block" }} />
              <span className="text-sm">Hollow dot</span>
            </button>

            <button onClick={() => applyBulletStyle("square")} className={`w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3 ${currentBulletClass === "pm-list-square" ? "bg-gray-50" : ""}`}>
              <span className="w-3 h-3 bg-black inline-block" />
              <span className="text-sm">Square</span>
            </button>
          </div>
        </div>
      )}

      {/* ORDERED */}
      <div className="flex items-center rounded ml-1">
        <button onClick={() => { toggleOrderedWithDefault(); setShowNumberDropdown(false); setShowBulletDropdown(false); }} title="Numbered list (default)" className={`p-2 hover:bg-gray-100 ${editor?.isActive("orderedList") ? "bg-gray-100" : ""}`}>
          <ListOrdered size={16} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); setShowNumberDropdown((s) => !s); setShowBulletDropdown(false); }} title="More numbering styles" className="p-2 hover:bg-gray-100">
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {showNumberDropdown && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-50 p-3 w-56">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "decimal", label: "1,2,3", preview: "1." },
              { key: "lowerAlpha", label: "a, b, c", preview: "a." },
              { key: "upperAlpha", label: "A, B, C", preview: "A." },
              { key: "lowerRoman", label: "i, ii, iii", preview: "i." },
              { key: "upperRoman", label: "I, II, III", preview: "I." },
              { key: "lowerGreek", label: "α, β, γ", preview: "α." },
            ].map(({ key, label, preview }) => {
              const className = `pm-list-${key === "decimal" ? "decimal" : key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
              return (
                <button key={key} onClick={() => applyOrderedStyle(key)} className={`text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-3 ${currentNumberClass === className ? "bg-gray-50" : ""}`}>
                  <div className="font-semibold">{preview}</div>
                  <div className="text-sm">{label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
