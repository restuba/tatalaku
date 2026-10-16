"use client";

import { useEffect } from "react";
import { m, useSpring, useTransform } from "motion/react";
import { useShouldReduceMotion } from "./use-reduced-motion";

interface CountUpProps {
  value: number;
  /** Zero-pad to this many digits, like an instrument readout ("007") */
  pad?: number;
  className?: string;
}

/**
 * A number that rolls up to its value (and re-rolls when it changes).
 * Rendered from a motion value, so the ticking never re-renders React.
 * Motion off → the final number appears immediately.
 */
export function CountUp({ value, pad, className }: CountUpProps) {
  const shouldReduceMotion = useShouldReduceMotion();
  const spring = useSpring(0, { stiffness: 70, damping: 18, mass: 0.8 });
  const display = useTransform(spring, (v) => {
    const text = Math.round(v).toLocaleString();
    return pad ? text.padStart(pad, "0") : text;
  });

  useEffect(() => {
    if (shouldReduceMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, shouldReduceMotion]);

  return <m.span className={`tabular-nums ${className ?? ""}`}>{display}</m.span>;
}
