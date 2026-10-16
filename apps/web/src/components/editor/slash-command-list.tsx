"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { Editor, Range } from "@tiptap/core";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  ListTodo,
  List,
  ListOrdered,
  ChevronRight,
  Code2,
  Quote,
  Minus,
  ImageIcon,
  Table as TableIcon,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { promptDialog } from "@/stores/dialog-store";
import { validateImageUrl } from "@/lib/url";

export interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
  {
    title: "Text",
    description: "Just start writing with plain text.",
    icon: Type,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: "To-do list",
    description: "Track tasks with a to-do list.",
    icon: ListTodo,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet list",
    description: "Create a simple bulleted list.",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered list",
    description: "Create a list with numbering.",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Toggle list",
    description: "Toggles can hide and show content inside.",
    icon: ChevronRight,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "toggle",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "Code block",
    description: "Capture a code snippet.",
    icon: Code2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote or callout.",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Visually divide blocks with a horizontal line.",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Image",
    description: "Insert an image via URL.",
    icon: ImageIcon,
    command: ({ editor, range }) => {
      // Remove the "/image" query first; the caret stays where the image goes
      editor.chain().focus().deleteRange(range).run();
      void promptDialog({
        title: "Insert image",
        label: "Image URL",
        placeholder: "https://example.com/image.png",
        inputType: "url",
        confirmLabel: "Insert",
        validate: validateImageUrl,
      }).then((url) => {
        if (!editor.isDestroyed) {
          const chain = editor.chain().focus();
          if (url) chain.setImage({ src: url });
          chain.run();
        }
      });
    },
  },
  {
    title: "Table",
    description: "Insert a simple table.",
    icon: TableIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Mermaid Diagram",
    description: "Insert a flow chart or diagram.",
    icon: WorkflowIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({ type: "mermaid" }).run();
    },
  },
];

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList(props, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((i) => (i - 1 + props.items.length) % props.items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((i) => (i + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const selected = props.items[selectedIndex];
          if (selected) {
            props.command(selected);
          }
          return true;
        }
        return false;
      },
    }));

    // Elevated panel: flat, opaque and outlined by a strong border (no blur or
    // shadow). Fades in without scaling.
    if (props.items.length === 0) {
      return (
        <div className="z-50 min-w-60 glass-surface rounded-codex-lg border border-codex-border-strong px-3 py-2.5 font-mono text-xs uppercase tracking-label text-codex-muted animate-in fade-in duration-150">
          [ No matching blocks ]
        </div>
      );
    }

    return (
      <div className="z-50 min-w-70 max-h-72 overflow-y-auto glass-surface rounded-codex-lg border border-codex-border-strong p-1 animate-in fade-in duration-150">
        <div className="px-2.5 pt-2 pb-1.5 font-mono text-xs uppercase tracking-label text-codex-muted/80">
          Basic blocks
        </div>
        <div className="space-y-px">
          {props.items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => props.command(item)}
                className={`group flex w-full items-center gap-2.5 rounded-codex-md px-2.5 py-1.5 text-left transition-colors duration-150 ${
                  isSelected ? "bg-codex-surface-raised" : "hover:bg-codex-surface-raised"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-codex-sm border border-codex-border bg-codex-background transition-colors duration-150 ${
                    isSelected
                      ? "text-codex-foreground"
                      : "text-codex-muted group-hover:text-codex-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-codex-foreground">{item.title}</p>
                  <p className="truncate text-xs text-codex-muted">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
