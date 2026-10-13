"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useScroll, useTransform } from "motion/react";
import { Check, Code2, Heading1, ListTodo, Workflow } from "lucide-react";
import { EASE_OUT, SPRING, SPRING_SOFT } from "@/components/motion";
import { useShouldReduceMotion } from "@/components/motion/use-reduced-motion";

/* ── Script ─────────────────────────────────────────────────────────────── */

const TITLE = "Launch plan";
const BODY = "Everything we need before Friday.";
const TODOS = ["Polish the onboarding flow", "Write release notes", "Ship it"] as const;
const SLASH_ITEMS = [
  { icon: Heading1, label: "Heading" },
  { icon: ListTodo, label: "To-do list" },
  { icon: Code2, label: "Code block" },
  { icon: Workflow, label: "Diagram" },
] as const;
/** The slash-menu row the demo "chooses" */
const SLASH_PICK = 1;
const SIDEBAR_PAGES = [
  { icon: "🚀", label: "Launch plan" },
  { icon: "📚", label: "Reading list" },
  { icon: "💡", label: "Ideas" },
  { icon: "🎯", label: "Q3 goals" },
] as const;

interface DemoState {
  titleLength: number;
  bodyLength: number;
  isMenuOpen: boolean;
  menuIndex: number;
  todoCount: number;
  checkedCount: number;
}

const EMPTY: DemoState = {
  titleLength: 0,
  bodyLength: 0,
  isMenuOpen: false,
  menuIndex: 0,
  todoCount: 0,
  checkedCount: 0,
};

/** What a finished run looks like — also the still frame when motion is off */
const FINISHED: DemoState = {
  titleLength: TITLE.length,
  bodyLength: BODY.length,
  isMenuOpen: false,
  menuIndex: SLASH_PICK,
  todoCount: TODOS.length,
  checkedCount: 2,
};

type Step = readonly [delayMs: number, patch: Partial<DemoState>];

/** One loop of the demo as a flat list of (delay since previous step, change) */
function buildScript(): Step[] {
  const steps: Step[] = [[500, {}]];
  for (let i = 1; i <= TITLE.length; i++) steps.push([70, { titleLength: i }]);
  steps.push([350, {}]);
  for (let i = 1; i <= BODY.length; i++) steps.push([28, { bodyLength: i }]);
  steps.push([500, { isMenuOpen: true, menuIndex: 0 }]);
  for (let i = 1; i <= SLASH_PICK; i++) steps.push([420, { menuIndex: i }]);
  steps.push([520, { isMenuOpen: false }]);
  for (let i = 1; i <= TODOS.length; i++) steps.push([300, { todoCount: i }]);
  steps.push([700, { checkedCount: 1 }]);
  steps.push([650, { checkedCount: 2 }]);
  steps.push([2800, {}]); // admire the result before looping
  return steps;
}

const SCRIPT = buildScript();

/** Plays the script while `isPlaying`, restarting from scratch on each loop */
function useDemoScript(isPlaying: boolean): DemoState {
  const [state, setState] = useState<DemoState>(EMPTY);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let timer = 0;
    let step = 0;
    const tick = () => {
      if (step >= SCRIPT.length) {
        step = 0;
        setState(EMPTY);
      }
      const [delay, patch] = SCRIPT[step] ?? [0, {}];
      timer = window.setTimeout(() => {
        setState((prev) => ({ ...prev, ...patch }));
        step += 1;
        tick();
      }, delay);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [isPlaying]);

  return state;
}

/* ── View ───────────────────────────────────────────────────────────────── */

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-px inline-block h-[1em] w-0.5 translate-y-[0.12em] bg-codex-accent animate-pulse"
    />
  );
}

/**
 * A self-typing product preview for the landing hero: the page title types
 * itself, a slash menu picks "To-do list", tasks appear and get checked off.
 *
 * - Plays only while on screen; restarts when it scrolls back in.
 * - Tilts up from the floor as it scrolls into view (scroll-linked).
 * - Motion off → a still frame of the finished page, no timers.
 * - Purely decorative (aria-hidden); the surrounding copy carries the meaning.
 */
export function EditorDemo() {
  const frameRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useShouldReduceMotion();
  const isInView = useInView(frameRef, { amount: 0.35 });
  const live = useDemoScript(isInView && !shouldReduceMotion);
  const state = shouldReduceMotion ? FINISHED : live;

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);

  const title = TITLE.slice(0, state.titleLength);
  const body = BODY.slice(0, state.bodyLength);
  const isTypingTitle = state.titleLength < TITLE.length;
  const isTypingBody = !isTypingTitle && state.bodyLength < BODY.length;

  return (
    <div className="w-full max-w-5xl perspective-distant">
      <m.div
        // Remount when switching to the still frame so no scroll-linked
        // transform/opacity is left behind on the element
        key={shouldReduceMotion ? "still" : "live"}
        ref={frameRef}
        aria-hidden="true"
        {...(shouldReduceMotion ? {} : { style: { rotateX, scale, opacity } })}
        className="origin-bottom overflow-hidden rounded-codex-2xl border border-codex-border bg-codex-surface/85 text-left backdrop-blur-md"
      >
        {/* Window chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-codex-border px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-codex-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-codex-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-codex-border" />
          <span className="ml-3 truncate font-mono text-xs text-codex-muted">
            tatalaku / {title || "Untitled"}
          </span>
        </div>

        <div className="flex min-h-80 sm:min-h-96">
          {/* Mini sidebar */}
          <div className="hidden w-52 shrink-0 flex-col gap-0.5 border-r border-codex-border bg-codex-surface-secondary/60 p-3 sm:flex">
            <p className="mb-2 px-2 text-xs font-medium text-codex-muted">Pages</p>
            {SIDEBAR_PAGES.map((page, i) => (
              <div
                key={page.label}
                className="relative isolate flex items-center gap-2 rounded-codex-md px-2 py-1.5 text-sm text-codex-foreground"
              >
                {i === 0 && (
                  <m.span
                    layoutId="landing-demo-active"
                    className="absolute inset-0 -z-10 rounded-codex-md bg-codex-border/60"
                    transition={SPRING}
                  />
                )}
                <span className="w-5 text-center leading-none">{page.icon}</span>
                <span className="truncate">{i === 0 ? title || "Untitled" : page.label}</span>
              </div>
            ))}
          </div>

          {/* Page */}
          <div className="relative flex-1 px-6 py-8 sm:px-12 sm:py-10">
            <div className="mb-4 text-5xl leading-none">🚀</div>
            <div className="min-h-[1.25em] text-3xl font-bold tracking-tight text-codex-foreground sm:text-4xl">
              {title}
              {isTypingTitle && <Caret />}
              {!title && <span className="text-codex-muted/40">Untitled</span>}
            </div>

            <p className="mt-4 min-h-[1.6em] text-base text-codex-muted">
              {body}
              {isTypingBody && <Caret />}
            </p>

            {/* Slash command line + menu */}
            <div className="relative mt-3 min-h-[1.6em]">
              <AnimatePresence>
                {state.isMenuOpen && (
                  <m.div
                    key="slash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="text-base text-codex-foreground">
                      /<Caret />
                    </span>
                    <m.div
                      className="absolute left-0 top-full z-10 mt-1 w-56 rounded-codex-lg border border-codex-border bg-codex-surface p-1"
                      style={{ transformOrigin: "top left" }}
                      initial={{ opacity: 0, scale: 0.94, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={SPRING}
                    >
                      <p className="px-2 pb-1 pt-1.5 text-xs text-codex-muted">Basic blocks</p>
                      {SLASH_ITEMS.map((item, i) => (
                        <div
                          key={item.label}
                          className="relative isolate flex items-center gap-2.5 rounded-codex-md px-2 py-1.5 text-sm text-codex-foreground"
                        >
                          {state.menuIndex === i && (
                            <m.span
                              layoutId="landing-demo-slash"
                              className="absolute inset-0 -z-10 rounded-codex-md bg-codex-surface-secondary"
                              transition={SPRING}
                            />
                          )}
                          <span className="flex h-7 w-7 items-center justify-center rounded-codex-sm border border-codex-border bg-codex-surface">
                            <item.icon className="h-4 w-4 text-codex-muted" />
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </m.div>
                  </m.div>
                )}
              </AnimatePresence>

              {/* To-dos */}
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {TODOS.slice(0, state.todoCount).map((todo, i) => {
                    const isChecked = i < state.checkedCount;
                    return (
                      <m.li
                        key={todo}
                        className="flex items-center gap-2.5 text-base"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                      >
                        <m.span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-codex-sm border transition-colors duration-200 ${
                            isChecked
                              ? "border-codex-accent bg-codex-accent text-codex-background"
                              : "border-codex-muted"
                          }`}
                          animate={isChecked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isChecked && <Check className="h-3 w-3" strokeWidth={3} />}
                        </m.span>
                        <span
                          className={`relative transition-colors duration-300 ${
                            isChecked ? "text-codex-muted" : "text-codex-foreground"
                          }`}
                        >
                          {todo}
                          {/* Strike line draws across instead of snapping on */}
                          <m.span
                            className="absolute left-0 top-1/2 h-px w-full origin-left bg-codex-muted"
                            initial={false}
                            animate={{ scaleX: isChecked ? 1 : 0 }}
                            transition={{ duration: 0.35, ease: EASE_OUT }}
                          />
                        </span>
                      </m.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>

            {/* Floating "saved" tick that appears with each finished run */}
            <AnimatePresence>
              {state.checkedCount > 0 && (
                <m.span
                  key="saved"
                  className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-codex-border bg-codex-surface px-2.5 py-1 text-xs text-codex-muted sm:right-6 sm:top-6"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING_SOFT}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-codex-success" />
                  Saved
                </m.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </div>
  );
}
