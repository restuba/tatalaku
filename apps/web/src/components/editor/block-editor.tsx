"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

import { Toggle } from "./extensions/toggle";
import { SlashCommands } from "./extensions/slash-command";
import { GlobalId } from "./extensions/global-id";
import { Mermaid } from "./extensions/mermaid";
import { api } from "@/lib/api";
import { BlockMenu } from "./block-menu";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { TableControls } from "./table-controls";
import { TableOfContents } from "./table-of-contents";
import { Check, Cloud, Loader2 } from "lucide-react";

interface BlockEditorProps {
  pageId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function BlockEditor({ pageId }: BlockEditorProps) {
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

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const json = editorInstance.getJSON();
          await api.pages.update(pageId, { content: JSON.stringify(json) });

          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }, 700);
    },
    [pageId],
  );

  const editor = useEditor({
    extensions: [
      GlobalId,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
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
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing...",
      }),
      Toggle,
      Mermaid,
      SlashCommands,
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
        const res = await api.pages.get(pageId);
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

  return (
    <div className="relative flex-1 flex gap-12 mt-4">
      {/* Main Editor Column */}
      <div className="flex-1 flex flex-col min-w-0 max-w-3xl">
        <BlockMenu editor={editor} />
        {/* Top Floating Status Indicator */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-codex-border/50 text-xs select-none">
          <div className="flex items-center gap-2 text-codex-muted">
            <span className="font-mono text-[11px]">Type &apos;/&apos; to insert blocks</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-codex-muted animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
          <div className="flex items-center justify-center py-24 text-codex-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-xs">Loading editor content...</span>
          </div>
        ) : (
          <div className="min-h-[500px] cursor-text" onClick={() => editor?.commands.focus()}>
            <EditorBubbleMenu editor={editor} />
            <TableControls editor={editor} />
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {/* Right Sidebar: Table of Contents */}
      <TableOfContents editor={editor} />
    </div>
  );
}
