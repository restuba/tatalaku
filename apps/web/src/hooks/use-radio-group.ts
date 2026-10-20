"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

const STEP: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * Keyboard model for a custom radio group (role="radiogroup" + role="radio"
 * buttons): one tab stop on the checked option, arrow keys move and select.
 */
export function useRadioGroup<T extends string>(
  options: readonly T[],
  value: T | null,
  onChange: (value: T) => void,
) {
  const nodes = useRef(new Map<T, HTMLElement>());

  const register = useCallback(
    (option: T) => (node: HTMLElement | null) => {
      if (node) nodes.current.set(option, node);
      else nodes.current.delete(option);
    },
    [],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = STEP[event.key];
    if (!step || options.length === 0) return;
    event.preventDefault();
    const current = value === null ? -1 : options.indexOf(value);
    const start = current === -1 ? (step > 0 ? -1 : 0) : current;
    const next = options[(start + step + options.length) % options.length] as T;
    onChange(next);
    nodes.current.get(next)?.focus();
  };

  const tabIndexFor = (option: T): 0 | -1 => {
    const isTabStop =
      value === null || !options.includes(value) ? option === options[0] : option === value;
    return isTabStop ? 0 : -1;
  };

  return { register, onKeyDown, tabIndexFor };
}
