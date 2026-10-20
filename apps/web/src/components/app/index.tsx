"use client";

import { useContext } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import { TWEEN_FAST } from "@/components/motion";
import { AppContext, AppContextProvider, useApp } from "./app-context";
import type { MessageItem, MessageType } from "./app-context";

/** Each type has its own icon shape as well as a color: state is never color alone */
const MESSAGE_ICON: Record<MessageType, { icon: LucideIcon; tone: string }> = {
  success: { icon: CheckCircle2, tone: "text-codex-success" },
  error: { icon: AlertCircle, tone: "text-codex-danger" },
  warning: { icon: AlertTriangle, tone: "text-codex-warning" },
  info: { icon: Info, tone: "text-codex-accent" },
};

function MessageContainer() {
  const context = useContext(AppContext);
  const messages = context?.messages ?? [];

  return (
    // Above every overlay (Settings z-60, elevated dialogs z-80) so feedback
    // triggered from inside a modal is never hidden behind it
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-4 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2"
    >
      <AnimatePresence initial={false}>
        {messages.map((item: MessageItem) => {
          const { icon: Icon, tone } = MESSAGE_ICON[item.type];
          return (
            <m.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={TWEEN_FAST}
              className="surface-popover pointer-events-auto flex max-w-full items-center gap-2.5 rounded-codex-lg px-4 py-2.5 text-sm"
            >
              <Icon className={`size-4 shrink-0 ${tone}`} aria-hidden="true" />
              <span className="min-w-0">{item.content}</span>
            </m.div>
          );
        })}
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
