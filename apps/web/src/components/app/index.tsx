"use client";

import { useContext } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { TWEEN_FAST } from "@/components/motion";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { AppContext, AppContextProvider, useApp } from "./app-context";
import type { MessageItem, MessageType } from "./app-context";

/** Monoline status mark in a fixed 16px slot: color plus shape, never color alone */
function MessageIcon({ type }: { type: MessageType }) {
  if (type === "success") {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center text-codex-success">
        <CheckIcon size={14} />
      </span>
    );
  }
  if (type === "error") {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center text-codex-danger">
        <CloseIcon size={14} />
      </span>
    );
  }
  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className="size-1.5 rounded-full bg-codex-foreground" />
    </span>
  );
}

function MessageContainer() {
  const context = useContext(AppContext);
  const messages = context?.messages ?? [];

  return (
    // Above every overlay (Settings z-60, elevated dialogs z-80) so feedback
    // triggered from inside a modal is never hidden behind it
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-[90] -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {messages.map((item: MessageItem) => (
          // Flat elevated panel: fades in with a 4px drop, fades out in place
          <m.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={TWEEN_FAST}
            className="glass-surface pointer-events-auto flex items-center gap-2.5 rounded-codex-lg border border-codex-border-strong px-4 py-2.5 text-sm text-codex-foreground"
          >
            <MessageIcon type={item.type} />
            <span>{item.content}</span>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppContextProvider>
      {children}
      <MessageContainer />
    </AppContextProvider>
  );
}

export { useApp };
export type { MessageApi, MessageType } from "./app-context";
