import { useState, useRef, useEffect } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Bold, Italic, Strikethrough, Code, Baseline, PaintBucket, Check } from "lucide-react";
import { TABLE_TEXT_COLORS, TABLE_BACKGROUND_COLORS } from "./table/table-colors";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

type OpenPicker = "color" | "background" | null;

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the color picker when clicking outside the menu.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openPicker && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [openPicker]);

  if (!editor) {
    return null;
  }

  const activeColor = (editor.getAttributes("textStyle").color as string | undefined) ?? null;
  const activeBackground =
    (editor.getAttributes("textStyle").backgroundColor as string | undefined) ?? null;

  // The textStyle mark (with its color/backgroundColor attributes) is provided
  // by the TextStyle + Color + BackgroundColor extensions. Guard against a
  // missing mark so a stale editor schema can never throw.
  const hasTextStyle = !!editor.schema.marks.textStyle;

  const applyTextColor = (value: string | null) => {
    if (hasTextStyle) {
      editor.chain().focus().setMark("textStyle", { color: value }).run();
    }
    setOpenPicker(null);
  };

  const applyBackground = (value: string | null) => {
    if (hasTextStyle) {
      editor.chain().focus().setMark("textStyle", { backgroundColor: value }).run();
    }
    setOpenPicker(null);
  };

  const markButton = (
    label: string,
    isActive: boolean,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-codex-md transition-all duration-200 ${
        isActive
          ? "bg-codex-background/80 text-codex-foreground shadow-sm scale-[0.95]"
          : "text-codex-muted hover:text-codex-foreground hover:bg-codex-background/50 hover:scale-[1.1]"
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  );

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-1 p-1 bg-codex-surface/80 dark:bg-codex-surface/60 border border-codex-border/40 rounded-codex-xl shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      <div ref={containerRef} className="flex items-center gap-1">
        {markButton(
          "Bold",
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          <Bold className="w-4 h-4" />,
        )}
        {markButton(
          "Italic",
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          <Italic className="w-4 h-4" />,
        )}
        {markButton(
          "Strikethrough",
          editor.isActive("strike"),
          () => editor.chain().focus().toggleStrike().run(),
          <Strikethrough className="w-4 h-4" />,
        )}

        <div className="w-px h-4 bg-codex-border/50 mx-1" />

        {markButton(
          "Code",
          editor.isActive("code"),
          () => editor.chain().focus().toggleCode().run(),
          <Code className="w-4 h-4" />,
        )}

        <div className="w-px h-4 bg-codex-border/50 mx-1" />

        {/* Text color */}
        <div className="relative">
          {markButton(
            "Text color",
            !!activeColor,
            () => setOpenPicker(openPicker === "color" ? null : "color"),
            <Baseline
              className="w-4 h-4"
              style={activeColor ? { color: activeColor } : undefined}
            />,
          )}
          {openPicker === "color" && (
            <ColorPopover
              title="Text"
              options={TABLE_TEXT_COLORS}
              activeValue={activeColor}
              swatchKind="text"
              onSelect={applyTextColor}
            />
          )}
        </div>

        {/* Background color */}
        <div className="relative">
          {markButton(
            "Background color",
            !!activeBackground,
            () => setOpenPicker(openPicker === "background" ? null : "background"),
            <PaintBucket className="w-4 h-4" />,
          )}
          {openPicker === "background" && (
            <ColorPopover
              title="Background"
              options={TABLE_BACKGROUND_COLORS}
              activeValue={activeBackground}
              swatchKind="background"
              onSelect={applyBackground}
            />
          )}
        </div>
      </div>
    </BubbleMenu>
  );
}

interface ColorPopoverProps {
  title: string;
  options: { key: string; label: string; value: string | null }[];
  activeValue: string | null;
  swatchKind: "text" | "background";
  onSelect: (value: string | null) => void;
}

function ColorPopover({ title, options, activeValue, swatchKind, onSelect }: ColorPopoverProps) {
  return (
    <div className="absolute left-0 top-full mt-1 w-44 glass-surface border border-codex-border rounded-codex-md py-1 shadow-lg text-sm z-30">
      <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-codex-muted">
        {title}
      </div>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onSelect(option.value)}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-codex-background text-codex-foreground"
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-codex-sm border text-xs font-semibold"
            style={
              swatchKind === "text"
                ? { color: option.value ?? "var(--color-ink)", borderColor: "var(--color-border)" }
                : {
                    backgroundColor: option.value ?? "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }
            }
          >
            {swatchKind === "text" ? "A" : ""}
          </span>
          <span className="flex-1">{option.label}</span>
          {activeValue === option.value && <Check className="h-4 w-4 text-codex-accent" />}
        </button>
      ))}
    </div>
  );
}
