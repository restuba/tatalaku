"use client";

import { useEffect, useCallback, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { TWEEN } from "@/components/motion";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useFocusTrap } from "@/hooks/use-focus-trap";
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

/** The dialog sheet: owns focus while it is mounted */
function ModalPanel({ className, children }: { className: string; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  return (
    <m.div
      ref={panelRef}
      tabIndex={-1}
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={TWEEN}
    >
      {children}
    </m.div>
  );
}

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

  // AnimatePresence keeps the dialog mounted while it fades out, so closing
  // reads as deliberately as opening.
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
            {/* Backdrop: a theme-tinted dim, no blur */}
            <m.div
              className="fixed inset-0 bg-codex-scrim"
              onClick={disableBackdropClick ? undefined : onClose}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TWEEN}
            />

            <ModalPanel
              className={`surface-dialog relative z-10 flex w-full flex-col rounded-codex-xl outline-none ${
                fullWidth ? "w-full" : ""
              } ${widthClass} ${scroll === "paper" ? "max-h-[calc(100dvh-4rem)]" : ""} ${className}`}
            >
              {children}
            </ModalPanel>
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
