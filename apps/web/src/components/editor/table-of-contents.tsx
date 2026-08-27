import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { AlignLeft } from "lucide-react";

export interface ToCItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export function useTableOfContents(editor: Editor | null) {
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateToC = () => {
      const headings: ToCItem[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const id = node.attrs.id || `heading-${pos}`;
          headings.push({
            id,
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });

      setItems(headings);
    };

    editor.on("update", updateToC);
    updateToC();

    return () => {
      editor.off("update", updateToC);
    };
  }, [editor]);

  return items;
}

export function TableOfContents({ editor }: { editor: Editor | null }) {
  const items = useTableOfContents(editor);

  if (!items.length) {
    return null;
  }

  const handleItemClick = (e: React.MouseEvent, pos: number) => {
    e.preventDefault();
    if (editor) {
      // Scroll to the specific pos using tiptap
      const dom = editor.view.nodeDOM(pos);
      if (dom instanceof HTMLElement) {
        dom.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="hidden lg:block w-64 shrink-0 overflow-y-auto max-h-[calc(100vh-100px)] sticky top-24 pr-4">
      <div className="flex items-center gap-2 mb-4 text-codex-muted text-xs font-semibold uppercase tracking-wider">
        <AlignLeft className="w-4 h-4" />
        <span>On this page</span>
      </div>
      <div className="flex flex-col gap-2 border-l-2 border-codex-border">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleItemClick(e, item.pos)}
            className="text-sm text-codex-muted hover:text-codex-foreground transition-colors truncate"
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
          >
            {item.text}
          </a>
        ))}
      </div>
    </div>
  );
}
