import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

const PLAIN_TEXT_LANGUAGES: ReadonlySet<string> = new Set(["plaintext", "text"]);

interface CodeBlockComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  extension: unknown;
}

export function CodeBlockComponent({ node, updateAttributes, extension }: CodeBlockComponentProps) {
  // @ts-expect-error - extension.options.lowlight is untyped
  const languages = extension.options.lowlight.listLanguages().sort();
  const isPlainText = PLAIN_TEXT_LANGUAGES.has(String(node.attrs.language));

  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  // The frame (surface, hairline border, radius) comes from `.tiptap pre` in
  // globals.css; the wrapper only positions the language label and restores
  // the block's vertical rhythm (the <pre> margin is zeroed below).
  return (
    <NodeViewWrapper className="relative group my-3">
      <select
        contentEditable={false}
        value={node.attrs.language || "null"}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        onClick={stopPropagation}
        onPointerDown={stopPropagation}
        onPointerUp={stopPropagation}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        aria-label="Code language"
        className="absolute right-2 top-2 z-10 cursor-pointer rounded-codex-sm border border-codex-border-strong bg-codex-background px-2 py-1 font-mono text-xs uppercase tracking-label text-codex-muted opacity-0 outline-none transition-[opacity,color,border-color] duration-150 group-hover:opacity-100 hover:text-codex-foreground focus:border-codex-foreground focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {languages.map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre
        className="!m-0 !p-4"
        // Plain-text blocks often hold ASCII trees/diagrams; tighter leading lets
        // box-drawing characters (│ ├ └) connect vertically. See globals.css.
        data-plaintext={isPlainText ? "" : undefined}
      >
        <code className={node.attrs.language ? `language-${node.attrs.language}` : ""}>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
