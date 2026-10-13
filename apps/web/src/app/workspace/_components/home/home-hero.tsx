"use client";

import { m } from "motion/react";
import { EASE_OUT, SPRING_SOFT } from "@/components/motion";
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
        transition={{ ...SPRING_SOFT, delay }}
      >
        {children}
      </m.span>
    </span>
  );
}

/**
 * Home header: an ambient accent glow, the greeting revealed word by word
 * (the name in a drifting gradient), and a row of rolling workspace stats.
 */
export function HomeHero({ greeting, name, dateLabel, workspaceName, stats }: HomeHeroProps) {
  const words = greeting.split(" ");
  const lastIndex = words.length - 1;

  return (
    <header className="relative isolate">
      {/* Decorative layers sit behind the text and never take pointer events */}
      <div
        aria-hidden="true"
        className="home-hero-glow pointer-events-none absolute -top-28 -left-24 -z-10 h-80 w-[min(40rem,100vw)]"
      />
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute -top-16 -left-12 -z-10 h-64 w-[min(32rem,90vw)]"
      />

      <m.p
        className="font-mono text-xs uppercase tracking-widest text-codex-muted"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        {dateLabel}
        {workspaceName && <span className="text-codex-muted/70"> · {workspaceName}</span>}
      </m.p>

      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] text-codex-foreground text-balance">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <RevealWord delay={0.06 + i * 0.07}>
              {name && i === lastIndex ? `${word},` : word}
            </RevealWord>{" "}
          </span>
        ))}
        {name && (
          <RevealWord delay={0.06 + words.length * 0.07} className="text-gradient-accent">
            {name}
          </RevealWord>
        )}
      </h1>

      {stats.length > 0 && (
        <m.ul
          className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
        >
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-baseline gap-1.5">
              {/* The rolling number is visual only; readers get the final value */}
              <span className="sr-only">
                {stat.value} {stat.label}
              </span>
              <span aria-hidden="true" className="contents">
                <CountUp
                  value={stat.value}
                  className="font-mono text-lg font-medium text-codex-foreground"
                />
                <span className="text-xs text-codex-muted">{stat.label}</span>
              </span>
            </li>
          ))}
        </m.ul>
      )}
    </header>
  );
}
