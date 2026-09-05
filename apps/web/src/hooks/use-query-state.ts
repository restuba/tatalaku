"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Hook to manage individual URL search parameter state.
 */
export function useQueryState(key: string, defaultValue = ""): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    return searchParams.get(key) ?? defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue && newValue !== defaultValue) {
        params.set(key, newValue);
      } else {
        params.delete(key);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router, pathname, searchParams, key, defaultValue],
  );

  return [value, setValue];
}

export default useQueryState;
