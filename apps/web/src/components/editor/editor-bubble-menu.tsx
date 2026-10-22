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

  // Active marks (and an open picker) sit on the selected fill; no scaling
  const markButton = (
    label: string,
    isActive: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title?: string,
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`flex size-8 items-center justify-center rounded-codex-md transition-colors duration-150 pointer-coarse:size-10 ${
        isActive
          ? "bg-codex-selected text-codex-foreground"
          : "text-codex-muted hover:bg-codex-hover hover:text-codex-foreground"
      }`}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );

  return (
    <BubbleMenu
      editor={editor}
      // Elevated toolbar; fades in without scaling so text doesn't jump
      className="surface-popover flex items-center gap-0.5 rounded-codex-lg p-1 animate-in fade-in duration-150"
    >
      <div
        ref={containerRef}
        role="toolbar"
        aria-label="Formatting"
        className="flex items-center gap-0.5"
      >
        {markButton(
          "Bold",
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          <Bold className="w-4 h-4" />,
          "Bold (⌘B / Ctrl+B)",
        )}
        {markButton(
          "Italic",
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          <Italic className="w-4 h-4" />,
          "Italic (⌘I / Ctrl+I)",
        )}
        {markButton(
          "Strikethrough",
          editor.isActive("strike"),
          () => editor.chain().focus().toggleStrike().run(),
          <Strikethrough className="w-4 h-4" />,
          "Strikethrough (⌘⇧S / Ctrl+Shift+S)",
        )}

        <div aria-hidden="true" className="mx-1 w-px self-stretch bg-codex-border" />

        {markButton(
          "Mark as code",
          editor.isActive("code"),
          () => editor.chain().focus().toggleCode().run(),
          <Code className="w-4 h-4" />,
          "Mark as code (⌘E / Ctrl+E)",
        )}

        <div aria-hidden="true" className="mx-1 w-px self-stretch bg-codex-border" />

        {/* Text color */}
        <div className="relative">
          {markButton(
            "Text color",
            !!activeColor || openPicker === "color",
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
            !!activeBackground || openPicker === "background",
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
    // mt-2 clears the toolbar's own padding and border below the trigger
    <div className="surface-popover absolute left-0 top-full z-30 mt-2 w-44 rounded-codex-lg p-1 text-sm animate-in fade-in duration-150">
      <div className="eyebrow px-2.5 pt-2 pb-1.5 text-codex-muted">{title}</div>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onSelect(option.value)}
          aria-pressed={activeValue === option.value}
          className={`flex h-8 w-full items-center gap-2 rounded-codex-md px-2.5 text-left text-codex-foreground transition-colors ${
            activeValue === option.value ? "bg-codex-selected" : "hover:bg-codex-hover"
          }`}
        >
          {/* Swatch values are the user-selectable colors themselves */}
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-codex-sm border text-xs font-semibold"
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
