import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Referenced by the section's aria-labelledby */
  id: string;
  label: string;
  /** Readout on the right, e.g. a zero-padded count */
  meta?: ReactNode;
  action?: ReactNode;
}

/** Home section rule: a mono ALL CAPS label over a full-width hairline */
export function SectionHeading({ id, label, meta, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-codex-border pb-3">
      <h2 id={id} className="font-mono text-xs uppercase tracking-label text-codex-muted">
        {label}
      </h2>
      {(meta !== undefined || action) && (
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-label text-codex-muted/70 tabular-nums">
          {meta}
          {action}
        </div>
      )}
    </div>
  );
}
