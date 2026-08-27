import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Bold, Italic, Strikethrough, Code } from "lucide-react";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-1 p-1 bg-codex-surface border border-codex-border/50 rounded-codex-lg shadow-xl backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-codex-md transition-colors ${
          editor.isActive("bold")
            ? "bg-codex-border text-codex-foreground"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background"
        }`}
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-codex-md transition-colors ${
          editor.isActive("italic")
            ? "bg-codex-border text-codex-foreground"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background"
        }`}
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-codex-md transition-colors ${
          editor.isActive("strike")
            ? "bg-codex-border text-codex-foreground"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background"
        }`}
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-codex-border/50 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-codex-md transition-colors ${
          editor.isActive("code")
            ? "bg-codex-border text-codex-foreground"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background"
        }`}
        aria-label="Code"
      >
        <Code className="w-4 h-4" />
      </button>
    </BubbleMenu>
  );
}
