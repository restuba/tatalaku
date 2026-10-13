"use client";

import { useContext } from "react";
import { ModalContext } from "./modal-context";
import type { ModalContentProps } from "./types";

export function ModalContent({ children, className = "", dividers = false }: ModalContentProps) {
  const { scroll } = useContext(ModalContext);

  return (
    <div
      className={`flex-1 px-5 py-3 text-sm text-codex-foreground ${
        scroll === "paper" ? "overflow-y-auto" : ""
      } ${dividers ? "border-y border-codex-border" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default ModalContent;
