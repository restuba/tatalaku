"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

interface InkBarProps {
  containerRef: RefObject<HTMLDivElement | null>;
  activeValue: string;
}

export function InkBar({ containerRef, activeValue }: InkBarProps) {
  const [style, setStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeTab = containerRef.current.querySelector(
      `[data-tab-value="${activeValue}"]`,
    ) as HTMLElement | null;
    if (activeTab) {
      setStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeValue, containerRef]);

  if (!style.width) return null;

  return (
    <div
      className="absolute bottom-0 h-0.5 bg-accent transition-all duration-200 ease-out"
      style={{
        left: `${style.left}px`,
        width: `${style.width}px`,
      }}
    />
  );
}

export default InkBar;
