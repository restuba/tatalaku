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
} from "lucide-react";

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
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
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
      editor.chain().focus().deleteRange(range).insertContent({ type: "toggle" }).run();
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
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      } else {
        editor.chain().focus().deleteRange(range).run();
      }
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

    if (props.items.length === 0) {
      return (
        <div className="z-50 bg-codex-surface border border-codex-border rounded-codex-xl shadow-2xl p-2 min-w-[240px] text-xs text-codex-muted">
          No matching blocks
        </div>
      );
    }

    return (
      <div className="z-50 bg-codex-surface border border-codex-border rounded-codex-xl shadow-2xl p-1.5 min-w-[280px] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-codex-muted">
          Basic blocks
        </div>
        <div className="space-y-0.5">
          {props.items.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => props.command(item)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-codex-md text-left transition-colors ${
                  isSelected
                    ? "bg-codex-background border border-codex-border text-codex-foreground"
                    : "text-codex-muted hover:bg-codex-background hover:text-codex-foreground border border-transparent"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-codex-sm flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-codex-surface border-codex-border text-codex-foreground"
                      : "bg-codex-background border-transparent text-codex-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-[11px] text-codex-muted truncate opacity-80">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
