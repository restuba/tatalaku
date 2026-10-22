import type { ModalActionProps } from "./types";

export function ModalAction({ children, className = "", divider = false }: ModalActionProps) {
  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-end gap-2 px-6 pt-3 pb-5 ${
        divider ? "border-t border-codex-border pt-4" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default ModalAction;
