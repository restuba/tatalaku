import { AlertCircle } from "lucide-react";

/** Form-level error: tinted, with an icon, announced to screen readers */
export function FormError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-2 rounded-codex-lg bg-codex-danger-bg px-3 py-2.5 text-sm text-codex-danger"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
