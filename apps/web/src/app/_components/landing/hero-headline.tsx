/**
 * Landing headline in the editorial voice. Static on purpose: it is the LCP
 * element, so it renders without JavaScript and never moves.
 */
export function HeroHeadline() {
  return (
    <h1 className="max-w-4xl font-serif text-5xl font-normal leading-[1.05] tracking-tight text-codex-foreground text-balance sm:text-6xl lg:text-7xl">
      A calmer place to <span className="italic text-codex-accent">think</span>, write and organize.
    </h1>
  );
}
