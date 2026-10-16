"use client";

import { useEffect, useMemo } from "react";
import { Keyboard } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { useUIStore } from "@/stores/ui-store";

interface Shortcut {
  /** Key sequence; "Mod" renders as ⌘ on Apple devices and Ctrl elsewhere */
  keys: ReadonlyArray<string>;
  label: string;
}

const SECTIONS: ReadonlyArray<{ title: string; items: ReadonlyArray<Shortcut> }> = [
  {
    title: "General",
    items: [
      { keys: ["Mod", "K"], label: "Search pages & run commands" },
      { keys: ["Mod", "\\"], label: "Show / hide sidebar" },
      { keys: ["Mod", "/"], label: "Keyboard shortcuts" },
      { keys: ["Esc"], label: "Close dialog or menu" },
    ],
  },
  {
    title: "Editing",
    items: [
      { keys: ["/"], label: "Insert a block" },
      { keys: ["Mod", "B"], label: "Bold" },
      { keys: ["Mod", "I"], label: "Italic" },
      { keys: ["Mod", "U"], label: "Underline" },
      { keys: ["Mod", "Shift", "S"], label: "Strikethrough" },
      { keys: ["Mod", "E"], label: "Inline code" },
      { keys: ["Mod", "Z"], label: "Undo" },
      { keys: ["Mod", "Shift", "Z"], label: "Redo" },
    ],
  },
  {
    title: "Markdown while typing",
    items: [
      { keys: ["#", "Space"], label: "Heading 1 (## and ### for 2 and 3)" },
      { keys: ["-", "Space"], label: "Bulleted list" },
      { keys: ["1.", "Space"], label: "Numbered list" },
      { keys: ["[ ]", "Space"], label: "To-do list" },
      { keys: [">", "Space"], label: "Quote" },
      { keys: ["```"], label: "Code block" },
      { keys: ["---"], label: "Divider" },
    ],
  },
];

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Global workspace shortcuts (⌘\ sidebar, ⌘/ this sheet) plus the reference
 * sheet itself. Mount once inside the workspace layout.
 */
export function KeyboardShortcuts() {
  const { isShortcutsOpen, setShortcutsOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === "/" && !e.shiftKey) {
        // ⌘/ is free in text fields too, so allow it everywhere
        e.preventDefault();
        setShortcutsOpen(!useUIStore.getState().isShortcutsOpen);
      } else if (e.key === "?" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    }
    // Capture phase so the editor can't swallow the shortcut first
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [toggleSidebar, setShortcutsOpen]);

  const mod = useMemo(
    () => (isShortcutsOpen && isApplePlatform() ? "⌘" : "Ctrl"),
    [isShortcutsOpen],
  );

  return (
    <Modal
      open={isShortcutsOpen}
      onClose={() => setShortcutsOpen(false)}
      maxWidth="md"
      aria-label="Keyboard shortcuts"
    >
      <Modal.Header showClose divider>
        <div className="flex items-center gap-2.5">
          <Keyboard className="w-4 h-4 shrink-0 text-codex-muted" aria-hidden="true" />
          <span>Keyboard shortcuts</span>
        </div>
      </Modal.Header>
      <Modal.Content className="max-h-[65vh] space-y-8 py-5">
        {SECTIONS.map((section) => (
          <section key={section.title} aria-labelledby={`kbd-${section.title}`}>
            {/* Section rule: a mono label over a hairline, like the home headings */}
            <h3
              id={`kbd-${section.title}`}
              className="border-b border-codex-border pb-2 font-mono text-xs uppercase tracking-label text-codex-muted"
            >
              {section.title}
            </h3>
            <dl className="divide-y divide-codex-border">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-codex-foreground">{item.label}</dt>
                  <dd className="flex shrink-0 items-center gap-1">
                    {item.keys.map((key) => (
                      <kbd
                        key={key}
                        className="min-w-6 rounded-codex-sm border border-codex-border-strong px-1.5 py-0.5 text-center font-mono text-xs text-codex-muted"
                      >
                        {key === "Mod" ? mod : key === "Shift" ? "⇧" : key}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </Modal.Content>
    </Modal>
  );
}

export default KeyboardShortcuts;
