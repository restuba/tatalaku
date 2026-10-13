"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

type MermaidApi = (typeof import("mermaid"))["default"];

// Mermaid (+ d3/dagre) is ~0.5 MB gzipped, so it's only fetched the first time
// a diagram actually renders — pages without diagrams never download it.
let mermaidModule: Promise<MermaidApi> | null = null;
let initializedTheme: "dark" | "default" | null = null;

async function getMermaid(): Promise<MermaidApi> {
  mermaidModule ??= import("mermaid").then((m) => m.default);
  const mermaid = await mermaidModule;
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "default";
  if (initializedTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      // Diagrams are authored by any workspace member and injected as SVG:
      // "strict" sanitizes labels and disables click handlers (no stored XSS).
      securityLevel: "strict",
      fontFamily: "Space Grotesk, system-ui, sans-serif",
    });
    initializedTheme = theme;
  }
  return mermaid;
}

function MermaidPreview({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const renderIdRef = useRef(0);

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const currentRender = ++renderIdRef.current;

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const mermaid = await getMermaid();
        const result = await mermaid.render(id, trimmed);
        if (currentRender === renderIdRef.current) {
          setSvg(result.svg);
          setError("");
        }
      } catch (err) {
        if (currentRender === renderIdRef.current) {
          setSvg("");
          setError(err instanceof Error ? err.message : "Invalid syntax");
        }
      }
    };

    const timeout = setTimeout(() => void render(), 400);
    return () => clearTimeout(timeout);
  }, [code]);

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center py-12 font-mono text-xs uppercase tracking-widest text-codex-muted">
        [ ENTER MERMAID CODE ]
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-6 text-center">
        <span className="font-mono text-xs text-codex-danger">[SYNTAX ERROR]</span>
        <p className="mt-1 font-mono text-xs text-codex-muted">{error}</p>
      </div>
    );
  }
  if (!svg) {
    return (
      <div className="flex items-center justify-center py-12 font-mono text-xs uppercase tracking-widest text-codex-muted">
        [ RENDERING... ]
      </div>
    );
  }

  return (
    <div
      className="flex w-full justify-center overflow-auto py-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function MermaidNodeView(props: NodeViewProps) {
  const { node, updateAttributes, editor } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(node.attrs["code"] as string);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartEdit = useCallback(() => {
    setEditCode(node.attrs["code"]);
    setIsEditing(true);
  }, [node.attrs]);

  const handleSave = useCallback(() => {
    updateAttributes({ code: editCode });
    setIsEditing(false);
  }, [updateAttributes, editCode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const t = e.target as HTMLTextAreaElement;
        const s = t.selectionStart;
        const end = t.selectionEnd;
        setEditCode(editCode.substring(0, s) + "  " + editCode.substring(end));
        setTimeout(() => {
          t.selectionStart = t.selectionEnd = s + 2;
        }, 0);
      }
    },
    [editCode],
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  return (
    <NodeViewWrapper className="mermaid-block-wrapper my-4">
      <div className="group relative w-full rounded-codex-lg border border-codex-border bg-codex-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-codex-border px-4 py-2 bg-codex-background/50 rounded-t-codex-lg">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-codex-muted">
            MERMAID
          </span>
          {editor.isEditable && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-codex-muted transition-colors hover:text-codex-foreground"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-full bg-codex-accent px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-codex-background transition-opacity hover:opacity-80"
                  >
                    SAVE
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-codex-muted opacity-0 transition-all hover:text-codex-foreground group-hover:opacity-100"
                >
                  EDIT
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[160px] w-full resize-y rounded-codex-md border border-codex-border bg-codex-background p-4 font-mono text-sm leading-relaxed text-codex-foreground focus:border-codex-accent focus:ring-1 focus:ring-codex-accent focus:outline-none"
              placeholder={"graph TD\n    A[Start] --> B[End]"}
              spellCheck={false}
            />
          </div>
        ) : (
          <div
            className="w-full cursor-pointer p-4"
            onDoubleClick={editor.isEditable ? handleStartEdit : undefined}
          >
            <MermaidPreview code={node.attrs["code"]} />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
