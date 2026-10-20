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

/**
 * Home header in the editorial voice: a dated eyebrow, the greeting set in
 * Fraunces with the name in italics, and the workspace figures under hairlines.
 */
export function HomeHero({ greeting, name, dateLabel, workspaceName, stats }: HomeHeroProps) {
  return (
    <header>
      <p className="eyebrow flex flex-wrap items-center gap-x-2 gap-y-1 text-codex-muted">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-codex-accent-secondary"
        />
        <span>{dateLabel}</span>
        {workspaceName && (
          <>
            <span aria-hidden="true">/</span>
            <span className="truncate">{workspaceName}</span>
          </>
        )}
      </p>

      <h1 className="mt-5 font-serif text-4xl font-normal leading-[1.1] tracking-tight text-codex-foreground text-balance sm:text-5xl">
        {greeting}
        {name && (
          <>
            , <span className="italic text-codex-accent">{name}</span>
          </>
        )}
      </h1>

      {stats.length > 0 && (
        <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="border-t border-codex-border pt-3">
              {/* Two lines reserved on phones so wrapped labels keep the figures aligned */}
              <dt className="eyebrow min-h-8 text-codex-muted sm:min-h-0">{stat.label}</dt>
              <dd className="mt-2 font-serif text-3xl font-normal leading-none text-codex-foreground">
                {String(stat.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
