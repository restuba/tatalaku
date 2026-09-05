"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

export type MessageType = "success" | "error" | "info" | "warning";

export interface MessageItem {
  id: string;
  type: MessageType;
  content: ReactNode;
  duration?: number | undefined;
}

export interface MessageApi {
  success: (content: ReactNode, duration?: number) => void;
  error: (content: ReactNode, duration?: number) => void;
  info: (content: ReactNode, duration?: number) => void;
  warning: (content: ReactNode, duration?: number) => void;
}

export interface AppContextValue {
  message: MessageApi;
  messages: MessageItem[];
  removeMessage: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

let messageCounter = 0;

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addMessage = useCallback(
    (type: MessageType, content: ReactNode, duration = 3000) => {
      const id = `msg-${Date.now()}-${++messageCounter}`;
      const newItem: MessageItem = { id, type, content, duration };

      setMessages((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          removeMessage(id);
        }, duration);
      }
    },
    [removeMessage],
  );

  const messageApi: MessageApi = useMemo(
    () => ({
      success: (content, duration) => addMessage("success", content, duration),
      error: (content, duration) => addMessage("error", content, duration),
      info: (content, duration) => addMessage("info", content, duration),
      warning: (content, duration) => addMessage("warning", content, duration),
    }),
    [addMessage],
  );

  const contextValue = useMemo(
    () => ({
      message: messageApi,
      messages,
      removeMessage,
    }),
    [messageApi, messages, removeMessage],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp(): { message: MessageApi } {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return { message: context.message };
}
