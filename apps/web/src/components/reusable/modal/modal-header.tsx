"use client";

import { useContext } from "react";
import { CloseIcon } from "@/components/icons";
import { ModalContext } from "./modal-context";
import type { ModalHeaderProps } from "./types";

export function ModalHeader({
  children,
  className = "",
  showClose = true,
  divider = false,
}: ModalHeaderProps) {
  const { onClose } = useContext(ModalContext);

  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-4 px-6 pt-5 pb-3 ${
        divider ? "border-b border-codex-border pb-4" : ""
      } ${className}`}
    >
      {/* Dialog titles use the editorial serif, like page titles */}
      <div className="min-w-0 flex-1 font-serif text-xl font-medium leading-snug text-codex-foreground">
        {children}
      </div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-codex-md text-codex-muted transition-colors hover:bg-codex-hover hover:text-codex-foreground pointer-coarse:size-11"
          aria-label="Close dialog"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

export default ModalHeader;
