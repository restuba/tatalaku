import { Node, mergeAttributes } from "@tiptap/core";

const DETAILS_OPEN_RE = /^ {0,3}<details\b([^>]*)>/i;
const DETAILS_TAG_RE = /<(\/?)details\b[^>]*>/gi;
const SUMMARY_RE = /^\s*<summary\b[^>]*>([\s\S]*?)<\/summary>/i;

/** Finds the `</details>` that closes the block opened at `from` (handles nesting). */
function findClosingDetails(src: string, from: number): { start: number; end: number } | null {
  let depth = 1;
  DETAILS_TAG_RE.lastIndex = from;
  for (let m = DETAILS_TAG_RE.exec(src); m; m = DETAILS_TAG_RE.exec(src)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { start: m.index, end: m.index + m[0].length };
  }
  return null;
}

export const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "paragraph block*",
  defining: true,

  // Markdown has no native toggle, so it round-trips as an HTML disclosure
  // block (rendered by GitHub, Obsidian, etc.). The first paragraph becomes
  // the <summary>; the remaining blocks become the body.
  //
  //   <details open>
  //   <summary>Title</summary>
  //
  //   Body blocks…
  //
  //   </details>
  markdownTokenName: "toggle",

  markdownTokenizer: {
    name: "toggle",
    level: "block",
    start: (src: string) => {
      const m = /(^|\n) {0,3}<details\b/i.exec(src);
      return m ? m.index + (m[1]?.length ?? 0) : -1;
    },
    tokenize: (src, _tokens, lexer) => {
      const open = DETAILS_OPEN_RE.exec(src);
      if (!open) return undefined;

      const close = findClosingDetails(src, open[0].length);
      if (!close) return undefined; // unbalanced: let marked treat it as raw HTML

      const trailing = /^[ \t]*(?:\n|$)/.exec(src.slice(close.end))?.[0] ?? "";
      const inner = src.slice(open[0].length, close.start);
      const summary = SUMMARY_RE.exec(inner);
      const summaryText = (summary?.[1] ?? "").replace(/\s+/g, " ").trim();
      const body = (summary ? inner.slice(summary[0].length) : inner).trim();

      return {
        type: "toggle",
        raw: src.slice(0, close.end + trailing.length),
        open: /\bopen\b/i.test(open[1] ?? ""),
        summaryTokens: summaryText ? lexer.inlineTokens(summaryText) : [],
        tokens: body ? lexer.blockTokens(`${body}\n`) : [],
      };
    },
  },

  parseMarkdown: (token, helpers) => {
    const parseBlocks = helpers.parseBlockChildren ?? helpers.parseChildren;
    const summaryTokens = Array.isArray(token["summaryTokens"]) ? token["summaryTokens"] : [];
    return helpers.createNode("toggle", { open: token["open"] === true }, [
      helpers.createNode("paragraph", undefined, helpers.parseInline(summaryTokens)),
      ...parseBlocks(token.tokens ?? []),
    ]);
  },

  renderMarkdown: (node, helpers) => {
    const [summary, ...body] = node.content ?? [];
    const summaryText = summary
      ? helpers
          .renderChildren(summary.content ?? [])
          .replace(/\s*\n\s*/g, " ")
          .trim()
      : "";
    const openAttr = node.attrs?.["open"] ? " open" : "";
    const bodyText = body.length > 0 ? helpers.renderChildren(body, "\n\n").trim() : "";

    return [
      `<details${openAttr}>`,
      `<summary>${summaryText}</summary>`,
      ...(bodyText ? ["", bodyText, ""] : []),
      "</details>",
    ].join("\n");
  },

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute("open"),
        renderHTML: (attributes) => {
          if (attributes.open) {
            return { open: "" };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "details" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, { class: "tiptap-toggle" }),
      [
        "summary",
        {
          class:
            "cursor-pointer text-sm font-medium py-0.5 text-codex-foreground dark:text-codex-foreground select-none",
        },
        "Toggle list",
      ],
      [
        "div",
        {
          class: "pl-4 pt-1 border-l border-codex-border dark:border-codex-border ml-1.5 mt-1",
        },
        0,
      ],
    ];
  },
});
