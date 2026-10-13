"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT } from "@/components/motion";
import { useShouldReduceMotion } from "@/components/motion/use-reduced-motion";

const VERBS = ["think.", "write.", "plan.", "organize."] as const;
const CYCLE_MS = 2400;

/**
 * Landing headline: both lines rise in (CSS), then the closing verb cycles
 * through a few verbs (slides + blurs in from below). Screen readers get one
 * stable sentence; motion off pins the first verb.
 */
export function HeroHeadline() {
  const shouldReduceMotion = useShouldReduceMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % VERBS.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  const verb = VERBS[shouldReduceMotion ? 0 : index] ?? VERBS[0];

  return (
    <h1 className="max-w-4xl text-4xl min-[400px]:text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[0.98] text-codex-foreground">
      <span className="sr-only">A calmer place to think, write, plan, and organize.</span>
      <span aria-hidden="true" className="block">
        {/* The rise-in is CSS, not JS: this is the LCP element, so it must
            appear even before (or without) hydration */}
        <span className="block overflow-hidden pb-[0.08em]">
          <span className="block animate-rise-in" style={{ animationDelay: "50ms" }}>
            A calmer place to
          </span>
        </span>
        {/* Fixed-height slot so cycling verbs never reflow the page;
            1.14em leaves room for descenders ("plan.") inside the clip */}
        <span className="relative block h-[1.14em] overflow-hidden">
          <span
            className="relative block h-full animate-rise-in"
            style={{ animationDelay: "160ms" }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={verb}
                className="absolute inset-x-0 top-0 block text-gradient-accent"
                initial={{ y: "70%", opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-70%", opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
              >
                {verb}
              </m.span>
            </AnimatePresence>
          </span>
        </span>
      </span>
    </h1>
  );
}
