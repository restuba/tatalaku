"use client";

import type { PointerEvent, ReactNode } from "react";
import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useShouldReduceMotion } from "./use-reduced-motion";

const DEFAULT_TILT_DEG = 7;
const TILT_SPRING = { stiffness: 260, damping: 22, mass: 0.6 } as const;
/** Parks the spotlight off-canvas while the pointer is elsewhere */
const OFFSCREEN = -9999;

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees; 0 keeps only the spotlight and hover lift */
  tilt?: number;
}

/**
 * Pointer-reactive surface: leans toward the cursor in 3D and paints a soft
 * accent spotlight underneath it. Mouse/pen only — touch keeps a plain card.
 * With motion off it degrades to the spotlight alone (nothing moves).
 *
 * Everything runs on motion values, so pointer moves never re-render React.
 */
export function TiltCard({ children, className = "", tilt = DEFAULT_TILT_DEG }: TiltCardProps) {
  const shouldReduceMotion = useShouldReduceMotion();

  // Pointer offset from the card center, normalised to -0.5..0.5
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, TILT_SPRING);
  const springY = useSpring(offsetY, TILT_SPRING);
  const rotateX = useTransform(springY, (v) => -v * tilt);
  const rotateY = useTransform(springX, (v) => v * tilt);

  // Spotlight position in local pixels
  const spotX = useMotionValue(OFFSCREEN);
  const spotY = useMotionValue(OFFSCREEN);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${spotX}px ${spotY}px, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 70%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotX.set(x);
    spotY.set(y);
    if (!shouldReduceMotion && tilt > 0) {
      offsetX.set(x / rect.width - 0.5);
      offsetY.set(y / rect.height - 0.5);
    }
  }

  function handlePointerLeave() {
    offsetX.set(0);
    offsetY.set(0);
    spotX.set(OFFSCREEN);
    spotY.set(OFFSCREEN);
  }

  return (
    <m.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...(shouldReduceMotion
        ? {}
        : {
            style: { rotateX, rotateY, transformPerspective: 900 },
            whileHover: { y: -4 },
            whileTap: { scale: 0.98 },
          })}
      className={`group/tilt relative isolate ${className}`}
    >
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{ backgroundImage: spotlight }}
      />
      {children}
    </m.div>
  );
}
