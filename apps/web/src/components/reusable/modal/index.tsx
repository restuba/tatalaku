"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { ModalAction } from "./modal-action";
import { ModalContent } from "./modal-content";
import { ModalContext } from "./modal-context";
import { ModalHeader } from "./modal-header";
import type {
  ModalProps,
  ModalHeaderProps,
  ModalContentProps,
  ModalActionProps,
  MaxWidth,
  Scroll,
} from "./types";

// ─── Max Width Presets ───────────────────────────────────────────────

const maxWidthClasses: Record<string, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

// ─── Main Modal Component ───────────────────────────────────────────

function Modal({
  open,
  onClose,
  maxWidth = "md",
  fullWidth = true,
  scroll = "paper",
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  className = "",
  children,
}: ModalProps) {
  const mounted = useIsMounted();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableEscapeKeyDown) {
        onClose?.();
      }
    },
    [disableEscapeKeyDown, onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, handleKeyDown]);

  if (!mounted || !open) return null;

  const widthClass = maxWidth ? (maxWidthClasses[maxWidth] ?? "max-w-md") : "";

  const modalContent = (
    <ModalContext.Provider value={{ onClose, scroll }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
          onClick={disableBackdropClick ? undefined : onClose}
          aria-hidden="true"
        />

        {/* Paper Container */}
        <div
          className={`relative z-10 flex flex-col w-full rounded-xl border border-border bg-surface shadow-xl text-ink transition-all ${
            fullWidth ? "w-full" : ""
          } ${widthClass} ${scroll === "paper" ? "max-h-[calc(100vh-4rem)]" : ""} ${className}`}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );

  return createPortal(modalContent, document.body);
}

// ─── Compound Attachment ─────────────────────────────────────────────

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Action = ModalAction;

export { Modal };
export default Modal;
export type { ModalProps, ModalHeaderProps, ModalContentProps, ModalActionProps, MaxWidth, Scroll };
