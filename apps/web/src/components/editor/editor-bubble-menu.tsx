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
      className="flex items-center gap-1 p-1 bg-codex-surface/80 dark:bg-codex-surface/60 border border-codex-border/40 rounded-codex-xl shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-codex-md transition-all duration-200 ${
          editor.isActive("bold")
            ? "bg-codex-background/80 text-codex-foreground shadow-sm scale-[0.95]"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background/50 hover:scale-[1.1]"
        }`}
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-codex-md transition-all duration-200 ${
          editor.isActive("italic")
            ? "bg-codex-background/80 text-codex-foreground shadow-sm scale-[0.95]"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background/50 hover:scale-[1.1]"
        }`}
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-codex-md transition-all duration-200 ${
          editor.isActive("strike")
            ? "bg-codex-background/80 text-codex-foreground shadow-sm scale-[0.95]"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background/50 hover:scale-[1.1]"
        }`}
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-codex-border/50 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-codex-md transition-all duration-200 ${
          editor.isActive("code")
            ? "bg-codex-background/80 text-codex-foreground shadow-sm scale-[0.95]"
            : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background/50 hover:scale-[1.1]"
        }`}
        aria-label="Code"
      >
        <Code className="w-4 h-4" />
      </button>
    </BubbleMenu>
  );
}
