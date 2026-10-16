"use client";

import { m } from "motion/react";
import { TWEEN } from "@/components/motion";
import { CountUp } from "@/components/motion/count-up";

export interface HomeStat {
  label: string;
  value: number;
}

interface HomeHeroProps {
  greeting: string;
  name: string | undefined;
  dateLabel: string;
  workspaceName: string | undefined;
  stats: readonly HomeStat[];
}

/** Reveal ease: quick out, long settle (no overshoot) */
const REVEAL_EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/** One word sliding up out of its own clipping mask */
function RevealWord({
  children,
  delay,
  className = "",
}: {
  children: string;
  delay: number;
  className?: string;
}) {
  return (
    // pb/-mb give descenders room inside the clip without shifting the line
    <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
      <m.span
        className={`inline-block ${className}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: REVEAL_EASE, delay }}
      >
        {children}
      </m.span>
    </span>
  );
}

/**
 * Home header: a mono eyebrow with the live signal dot, the greeting revealed
 * word by word (the name in muted ink), and the workspace stats as a row of
 * ruled readouts in the dot-matrix display face.
 */
export function HomeHero({ greeting, name, dateLabel, workspaceName, stats }: HomeHeroProps) {
  const words = greeting.split(" ");
  const lastIndex = words.length - 1;

  return (
    <header>
      <m.p
        className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-label text-codex-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={TWEEN}
      >
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-codex-signal motion-safe:animate-pulse"
        />
        <span>{dateLabel}</span>
        {workspaceName && <span className="text-codex-muted/70">/ {workspaceName}</span>}
      </m.p>

      <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-codex-foreground text-balance">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <RevealWord delay={0.06 + i * 0.07}>
              {name && i === lastIndex ? `${word},` : word}
            </RevealWord>{" "}
          </span>
        ))}
        {name && (
          <RevealWord delay={0.06 + words.length * 0.07} className="text-codex-muted">
            {name}
          </RevealWord>
        )}
      </h1>

      {stats.length > 0 && (
        <m.dl
          className="mt-10 grid max-w-lg grid-cols-3 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...TWEEN, delay: 0.35 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="border-t border-codex-border-strong pt-3">
              <dt className="font-mono text-xs uppercase tracking-label text-codex-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-4xl sm:text-5xl font-semibold leading-none text-codex-foreground">
                {/* The rolling number is visual only; readers get the final value */}
                <span className="sr-only">{stat.value}</span>
                <span aria-hidden="true">
                  <CountUp value={stat.value} pad={2} />
                </span>
              </dd>
            </div>
          ))}
        </m.dl>
      )}
    </header>
  );
}
