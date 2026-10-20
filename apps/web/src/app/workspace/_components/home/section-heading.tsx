import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Referenced by the section's aria-labelledby */
  id: string;
  label: string;
  /** Readout on the right, e.g. a zero-padded count */
  meta?: ReactNode;
  action?: ReactNode;
}

/** Home section heading: a small caps label with an optional readout and action */
export function SectionHeading({ id, label, meta, action }: SectionHeadingProps) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-4">
      <h2 id={id} className="eyebrow text-codex-muted">
        {label}
      </h2>
      {(meta !== undefined || action) && (
        <div className="eyebrow flex items-center gap-3 text-codex-muted">
          {meta}
          {action}
        </div>
      )}
    </div>
  );
}
