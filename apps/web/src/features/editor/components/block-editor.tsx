"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { Toggle } from "../extensions/toggle";
import { SlashCommands } from "../extensions/slash-command";
import { GlobalId } from "../extensions/global-id";
import { blocksToTiptapDoc, tiptapDocToBlocks } from "../utils/serializer";
import { api } from "@/lib/api";
import type { Block } from "@tatalaku/shared";
import { BlockMenu } from "./block-menu";
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
  const previousBlocksRef = useRef<Block[]>([]);

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
          const currentBlocks = tiptapDocToBlocks(json, pageId);
          const prevBlocks = previousBlocksRef.current;

          // Check if ONLY orders changed
          let onlyOrderChanged = true;
          const reorderedBlocks: { id: string; order: number }[] = [];

          if (prevBlocks.length === currentBlocks.length) {
            for (let i = 0; i < currentBlocks.length; i++) {
              const curr = currentBlocks[i]!;
              const prev = prevBlocks.find((b) => b.id === curr.id);

              if (
                !prev ||
                JSON.stringify(prev.content) !== JSON.stringify(curr.content) ||
                prev.type !== curr.type
              ) {
                onlyOrderChanged = false;
                break;
              }

              if (prev.order !== curr.order) {
                reorderedBlocks.push({ id: curr.id!, order: curr.order });
              }
            }
          } else {
            onlyOrderChanged = false;
          }

          if (onlyOrderChanged && reorderedBlocks.length > 0) {
            await api.blocks.reorder(pageId, reorderedBlocks);
          } else {
            // Full sync for content/type changes or new/deleted blocks
            await api.pages.syncBlocks(pageId, currentBlocks);
          }

          previousBlocksRef.current = currentBlocks as Block[];
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
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing...",
      }),
      Toggle,
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
        const res = await api.blocks.listByPage(pageId);
        if (!isMounted) return;

        previousBlocksRef.current = res.data;
        const doc = blocksToTiptapDoc(res.data);
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(doc);
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
    <div className="relative flex-1 flex flex-col mt-4">
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
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
