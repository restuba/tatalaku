import type { ModalActionProps } from "./types";

export function ModalAction({ children, className = "", divider = false }: ModalActionProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-end gap-2 px-5 pt-2 pb-4 ${
        divider ? "border-t border-border pt-4" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default ModalAction;
