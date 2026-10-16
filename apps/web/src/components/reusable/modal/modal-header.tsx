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
      <div className="min-w-0 flex-1 text-lg font-medium tracking-tight text-codex-foreground">
        {children}
      </div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-codex-muted transition-colors hover:bg-codex-surface-raised hover:text-codex-foreground pointer-coarse:h-11 pointer-coarse:w-11"
          aria-label="Close modal"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}

export default ModalHeader;
