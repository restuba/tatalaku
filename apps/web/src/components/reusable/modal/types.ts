import type { ReactNode } from "react";

export type MaxWidth = "xs" | "sm" | "md" | "lg" | "xl" | "full" | false;
export type Scroll = "paper" | "body";

export interface ModalProps {
  /** Whether modal is visible */
  open: boolean;
  /** Close handler callback */
  onClose?: (() => void) | undefined;
  /** Width preset constraint */
  maxWidth?: MaxWidth | undefined;
  /** Stretch modal container to maxWidth */
  fullWidth?: boolean | undefined;
  /** Scroll behavior inside the paper or whole backdrop */
  scroll?: Scroll | undefined;
  /** Disable closing when clicking the backdrop */
  disableBackdropClick?: boolean | undefined;
  /** Disable closing when pressing the Escape key */
  disableEscapeKeyDown?: boolean | undefined;
  /** Additional container classes */
  className?: string | undefined;
  /** Modal content elements */
  children?: ReactNode | undefined;
}

export interface ModalHeaderProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
  /** Shows standard close cross button */
  showClose?: boolean | undefined;
  /** Adds bottom divider line */
  divider?: boolean | undefined;
}

export interface ModalContentProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
  /** Adds top and bottom divider lines */
  dividers?: boolean | undefined;
}

export interface ModalActionProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
  /** Adds top divider line */
  divider?: boolean | undefined;
}
