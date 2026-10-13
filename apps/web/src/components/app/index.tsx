"use client";

import { useContext } from "react";
import type { ReactNode } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { AppContext, AppContextProvider, useApp } from "./app-context";
import type { MessageItem, MessageType } from "./app-context";

function MessageIcon({ type }: { type: MessageType }) {
  if (type === "success") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-codex-success text-codex-surface">
        <CheckIcon size={10} />
      </span>
    );
  }
  if (type === "error") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-codex-danger text-codex-surface">
        <CloseIcon size={10} />
      </span>
    );
  }
  return <span className="h-2 w-2 rounded-full bg-codex-accent" />;
}

function MessageContainer() {
  const context = useContext(AppContext);
  if (!context || !context.messages.length) return null;

  return (
    // Above every overlay (Settings z-60, elevated dialogs z-80) so feedback
    // triggered from inside a modal is never hidden behind it
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-[90] -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
    >
      {context.messages.map((item: MessageItem) => (
        <div
          key={item.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-codex-md border border-codex-border bg-codex-surface px-4 py-2 text-sm text-codex-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <MessageIcon type={item.type} />
          <span>{item.content}</span>
        </div>
      ))}
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
