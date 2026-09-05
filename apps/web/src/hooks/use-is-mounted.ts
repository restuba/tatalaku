"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook to check if the component has mounted on the client.
 * Uses useSyncExternalStore to avoid cascading renders in React 18/19.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default useIsMounted;
