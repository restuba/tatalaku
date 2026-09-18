"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Focus from "@tiptap/extension-focus";
import { TextStyle, Color, BackgroundColor } from "@tiptap/extension-text-style";
import { all, createLowlight } from "lowlight";
import { CodeBlock } from "./extensions/code-block";

const lowlight = createLowlight(all);

import { Toggle } from "./extensions/toggle";
import { SlashCommands } from "./extensions/slash-command";
import { GlobalId } from "./extensions/global-id";
import { Mermaid } from "./extensions/mermaid";
import { BlockSelection } from "./extensions/block-selection";
import { getPage } from "@/services/page/get-page";
import { updatePage } from "@/services/page/update-page";
import { BlockMenu } from "./block-menu";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { TableControls, ColorTableCell, ColorTableHeader } from "./table";
import { TableOfContents, scrollToTargetNode } from "./table-of-contents";
import { LassoSelection } from "./lasso-selection";
import { Check, Cloud } from "lucide-react";
import { LogoSpinner } from "@/components/ui/logo-spinner";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BlockEditorProps {
  pageId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onSaved?: (updatedAt: Date | string) => void;
}

export function BlockEditor({ pageId, onSaveStatusChange, onSaved }: BlockEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (editorInstance: ReturnType<typeof useEditor>) => {
      if (!editorInstance || isInitialLoadRef.current) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setSaveStatus("saving");
      onSaveStatusChange?.("saving");

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const json = editorInstance.getJSON();
          const res = await updatePage(pageId, { content: JSON.stringify(json) });

          setSaveStatus("saved");
          onSaveStatusChange?.("saved");
          if (res?.data?.updatedAt) {
            onSaved?.(res.data.updatedAt);
          }
        } catch {
          setSaveStatus("error");
          onSaveStatusChange?.("error");
        }
      }, 700);
    },
    [pageId, onSaveStatusChange, onSaved],
  );

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      GlobalId,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      CodeBlock.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      ColorTableHeader,
      ColorTableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing...",
      }),
      // Adds `.has-focus` to the focused node. CSS scopes the visible outline to
      // table cells only, so clicking a cell shows a thin accent border around
      // that single cell (Notion-style focused-cell indicator).
      Focus.configure({
        className: "has-focus",
        mode: "deepest",
      }),
      // Text color + background color marks for the bubble menu. TextStyle is the
      // shared <span> container; Color and BackgroundColor add their attributes.
      TextStyle,
      Color,
      BackgroundColor,
      Toggle,
      Mermaid,
      SlashCommands,
      BlockSelection,
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] text-codex-foreground leading-relaxed text-sm sm:text-base",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      debouncedSave(currentEditor);
    },
  });

  // Load existing blocks from backend
  useEffect(() => {
    let isMounted = true;
    async function loadBlocks() {
      setIsLoading(true);
      try {
        const res = await getPage(pageId);
        if (!isMounted) return;

        const page = res.data;

        if (page.content && editor && !editor.isDestroyed) {
          try {
            const parsed = JSON.parse(page.content);
            editor.commands.setContent(parsed);
          } catch {
            // Fallback if content is not JSON (e.g. old HTML data)
            editor.commands.setContent(page.content);
          }
        }
      } catch {
        // Handled
      } finally {
        if (isMounted) {
          setIsLoading(false);
          // Allow saves after initial load
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 300);
        }
      }
    }

    if (editor && !editor.isDestroyed) {
      loadBlocks();
    }

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pageId, editor]);

  // Global Ctrl+A / Cmd+A interceptor for when the editor is blurred
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        const activeEl = document.activeElement;
        const isInputFocused =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.hasAttribute("contenteditable"));

        // If focus is on the body/background (not in any input or the editor itself)
        if (editor && !editor.isDestroyed && !isInputFocused) {
          e.preventDefault();
          // Focus the editor and force select all blocks
          editor.commands.focus();
          editor.commands.selectAll();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [editor]);

  // Handle URL hash anchor link redirect (e.g. #block-... or #heading-...)
  useEffect(() => {
    if (isLoading || !editor || editor.isDestroyed) return;

    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      // Delay slightly to ensure content and DOM elements are rendered
      setTimeout(() => {
        let targetEl: HTMLElement | null = null;
        try {
          targetEl = document.querySelector(
            `[data-id="${hash}"], #${CSS.escape(hash)}`,
          ) as HTMLElement | null;
        } catch {
          targetEl = document.querySelector(`[data-id="${hash}"]`) as HTMLElement | null;
        }

        if (!targetEl && editor) {
          const blocks = editor.view.dom.querySelectorAll(
            "[data-id], h1, h2, h3, p, li, blockquote, pre",
          );
          for (const b of blocks) {
            if (b.getAttribute("data-id") === hash || b.id === hash) {
              targetEl = b as HTMLElement;
              break;
            }
          }
        }

        if (targetEl) {
          scrollToTargetNode(targetEl);
        }
      }, 350);
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [isLoading, editor]);

  return (
    <LassoSelection editor={editor}>
      <div className="relative flex-1 flex flex-col w-full mt-4">
        {/* Outline Bars & Hover Popover */}
        <TableOfContents editor={editor} />

        {/* Main Editor Column */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Top Floating Status Indicator */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-codex-border/50 text-xs select-none">
            <div className="flex items-center gap-2 text-codex-muted">
              <span className="font-mono text-[11px]">Type &apos;/&apos; to insert blocks</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-codex-muted animate-pulse">
                  <LogoSpinner size="sm" className="gap-0 scale-75" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1 text-codex-danger">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Failed to save</span>
                </span>
              )}
            </div>
          </div>

          {/* Editor Content Area */}
          {isLoading ? (
            <div className="space-y-6 py-4 animate-in fade-in duration-200">
              <div className="space-y-2.5">
                <Skeleton className="w-full h-4 rounded-codex-sm" />
                <Skeleton className="w-11/12 h-4 rounded-codex-sm" />
                <Skeleton className="w-4/5 h-4 rounded-codex-sm" />
              </div>
              <div className="pt-2">
                <Skeleton className="w-1/3 max-w-xs h-6 rounded-codex-md" />
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
                  <Skeleton className="w-1/2 h-4 rounded-codex-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-codex-sm shrink-0" />
                  <Skeleton className="w-3/5 h-4 rounded-codex-sm" />
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                <Skeleton className="w-full h-4 rounded-codex-sm" />
                <Skeleton className="w-5/6 h-4 rounded-codex-sm" />
              </div>
            </div>
          ) : (
            <div
              className="relative min-h-[500px] cursor-text"
              onClick={() => editor?.commands.focus()}
            >
              {/* Brand Watermark for entirely empty document */}
              {editor?.getText().trim().length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] grayscale transition-opacity duration-1000 select-none z-0">
                  <Logo variant="icon-only" size="xl" className="w-64 h-64 scale-150" />
                </div>
              )}

              <div className="relative z-10">
                <BlockMenu editor={editor} />
                <EditorBubbleMenu editor={editor} />
                <TableControls editor={editor} />
                <EditorContent editor={editor} />
              </div>
            </div>
          )}
        </div>
      </div>
    </LassoSelection>
  );
}
