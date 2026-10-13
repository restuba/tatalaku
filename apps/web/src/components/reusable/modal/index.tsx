"use client";

import { useEffect, useCallback, useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { SPRING_SOFT } from "@/components/motion";
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

// ─── Open-modal stack ───────────────────────────────────────────────
// Only the top-most open modal reacts to Escape, so a confirm dialog opened
// over another modal closes on its own instead of taking the parent with it.
const openModalStack: string[] = [];

// ─── Main Modal Component ───────────────────────────────────────────

function Modal({
  open,
  onClose,
  maxWidth = "md",
  fullWidth = true,
  scroll = "paper",
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  elevated = false,
  className = "",
  children,
  "aria-label": ariaLabel,
}: ModalProps) {
  const mounted = useIsMounted();
  const modalId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Escape" || openModalStack[openModalStack.length - 1] !== modalId) return;
      // Keep window-level Escape handlers (e.g. Settings) from also closing
      e.stopPropagation();
      if (!disableEscapeKeyDown) onClose?.();
    },
    [disableEscapeKeyDown, onClose, modalId],
  );

  useEffect(() => {
    if (!open) return undefined;

    openModalStack.push(modalId);
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      const index = openModalStack.lastIndexOf(modalId);
      if (index !== -1) openModalStack.splice(index, 1);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, handleKeyDown, modalId]);

  if (!mounted) return null;

  const widthClass = maxWidth ? (maxWidthClasses[maxWidth] ?? "max-w-md") : "";

  // AnimatePresence keeps the dialog mounted while it animates out, so closing
  // feels as considered as opening (backdrop fades, paper springs away).
  return createPortal(
    <AnimatePresence>
      {open && (
        <ModalContext.Provider value={{ onClose, scroll }}>
          <div
            className={`fixed inset-0 flex items-center justify-center p-4 overflow-y-auto ${
              elevated ? "z-[80]" : "z-50"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            {/* Backdrop */}
            <m.div
              className="fixed inset-0 bg-codex-background/60 backdrop-blur-sm"
              onClick={disableBackdropClick ? undefined : onClose}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />

            {/* Paper Container */}
            <m.div
              className={`glass-surface relative z-10 flex flex-col w-full rounded-codex-2xl border border-codex-border text-codex-foreground shadow-2xl shadow-black/10 ${
                fullWidth ? "w-full" : ""
              } ${widthClass} ${scroll === "paper" ? "max-h-[calc(100vh-4rem)]" : ""} ${className}`}
              initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
              transition={SPRING_SOFT}
            >
              {children}
            </m.div>
          </div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Compound Attachment ─────────────────────────────────────────────

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Action = ModalAction;

export { Modal };
export default Modal;
export type { ModalProps, ModalHeaderProps, ModalContentProps, ModalActionProps, MaxWidth, Scroll };
