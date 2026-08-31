import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

interface CodeBlockComponentProps {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  extension: unknown;
}

export function CodeBlockComponent({ node, updateAttributes, extension }: CodeBlockComponentProps) {
  // @ts-expect-error - extension.options.lowlight is untyped
  const languages = extension.options.lowlight.listLanguages().sort();

  return (
    <NodeViewWrapper className="relative group rounded-codex-lg overflow-hidden border border-codex-border/30 bg-codex-background">
      <select
        contentEditable={false}
        value={node.attrs.language || "null"}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-codex-surface/80 hover:bg-codex-surface text-codex-foreground text-xs rounded-codex-md border border-codex-border px-2 py-1 outline-none cursor-pointer backdrop-blur-sm shadow-sm"
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {languages.map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre className="!m-0 !p-4 !bg-transparent">
        {/* @ts-expect-error - NodeViewContent 'as' prop accepts string at runtime */}
        <NodeViewContent
          as="code"
          className={node.attrs.language ? `language-${node.attrs.language}` : ""}
        />
      </pre>
    </NodeViewWrapper>
  );
}
