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
      className={`flex shrink-0 items-center justify-between px-5 pt-4 pb-2 ${
        divider ? "border-b border-border pb-4" : ""
      } ${className}`}
    >
      <div className="flex-1 text-base font-semibold text-ink">{children}</div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-secondary hover:text-ink"
          aria-label="Close modal"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

export default ModalHeader;
