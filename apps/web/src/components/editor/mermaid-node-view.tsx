"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { getTheme, type ThemeId } from "@/lib/themes";
import { useResolvedTheme } from "@/stores/theme-store";

type MermaidApi = (typeof import("mermaid"))["default"];

// Mermaid (+ d3/dagre) is ~0.5 MB gzipped, so it's only fetched the first time
// a diagram actually renders — pages without diagrams never download it.
let mermaidModule: Promise<MermaidApi> | null = null;
let initializedTheme: ThemeId | null = null;

/** A theme token as resolved on <html> (palette tokens are plain hex values) */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Mermaid's "base" theme fed with the active palette, so diagrams use the
 * same surfaces, ink and accent as the page around them.
 */
async function getMermaid(theme: ThemeId): Promise<MermaidApi> {
  mermaidModule ??= import("mermaid").then((m) => m.default);
  const mermaid = await mermaidModule;
  if (initializedTheme !== theme) {
    const surface = readToken("--color-surface", "white");
    const elevated = readToken("--color-elevated", surface);
    const well = readToken("--color-surface-secondary", surface);
    const ink = readToken("--color-ink", "black");
    const muted = readToken("--color-muted", ink);
    const border = readToken("--color-border-strong", muted);
    const accent = readToken("--color-accent", ink);
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        darkMode: getTheme(theme).colorScheme === "dark",
        background: surface,
        fontFamily: readToken("--font-ui-stack", "system-ui, sans-serif"),
        fontSize: "14px",
        primaryColor: elevated,
        primaryTextColor: ink,
        primaryBorderColor: border,
        secondaryColor: well,
        secondaryTextColor: ink,
        secondaryBorderColor: border,
        tertiaryColor: surface,
        tertiaryTextColor: ink,
        tertiaryBorderColor: border,
        mainBkg: elevated,
        nodeBorder: border,
        textColor: ink,
        lineColor: muted,
        clusterBkg: well,
        clusterBorder: border,
        edgeLabelBackground: surface,
        noteBkgColor: well,
        noteTextColor: ink,
        noteBorderColor: border,
        actorBkg: elevated,
        actorBorder: border,
        actorTextColor: ink,
        signalColor: muted,
        signalTextColor: ink,
        labelBoxBkgColor: elevated,
        labelBoxBorderColor: border,
        labelTextColor: ink,
        activationBkgColor: well,
        activationBorderColor: accent,
      },
      // Diagrams are authored by any workspace member and injected as SVG:
      // "strict" sanitizes labels and disables click handlers (no stored XSS).
      securityLevel: "strict",
    });
    initializedTheme = theme;
  }
  return mermaid;
}

function MermaidPreview({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const renderIdRef = useRef(0);
  // Re-render when the theme changes; only this preview updates, never the editor
  const theme = useResolvedTheme();

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const currentRender = ++renderIdRef.current;

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const mermaid = await getMermaid(theme);
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
  }, [code, theme]);

  if (!code.trim()) {
    return (
      <p className="py-12 text-center text-sm text-codex-muted">
        Add Mermaid code to draw a diagram.
      </p>
    );
  }
  if (error) {
    return (
      <div role="alert" className="py-6 text-center">
        <p className="text-sm font-medium text-codex-danger">This diagram has a syntax error</p>
        <p className="mt-2 font-mono text-xs wrap-break-word text-codex-muted">{error}</p>
      </div>
    );
  }
  if (!svg) {
    return (
      <p role="status" className="py-12 text-center text-sm text-codex-muted">
        Rendering diagram…
      </p>
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
      {/* Hairline frame on the page, the header on the code well */}
      <div className="group relative w-full overflow-hidden rounded-codex-lg border border-codex-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-codex-border bg-codex-surface-secondary px-4 py-1.5">
          <span className="eyebrow text-codex-muted">Diagram</span>
          {editor.isEditable && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex h-7 items-center rounded-full px-3 text-sm text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex h-7 items-center rounded-full bg-codex-accent px-3 text-sm font-medium text-codex-background transition-colors hover:bg-codex-accent-hover"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex h-7 items-center rounded-full px-3 text-sm text-codex-muted opacity-0 transition-[opacity,color,background-color] hover:bg-codex-hover hover:text-codex-foreground group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
                >
                  Edit
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
              aria-label="Mermaid code"
              className="min-h-40 w-full resize-y rounded-codex-md border border-codex-border-strong bg-codex-elevated p-4 font-mono text-sm leading-relaxed text-codex-foreground outline-none transition-[border-color,box-shadow] placeholder:text-codex-faint focus:border-codex-accent focus:ring-2 focus:ring-codex-accent-soft"
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
