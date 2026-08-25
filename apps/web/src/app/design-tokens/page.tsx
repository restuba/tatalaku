import React from "react";

export default function DesignTokensPage() {
  return (
    <div className="min-h-screen bg-codex-background text-codex-foreground p-8 md:p-12 font-sans selection:bg-codex-accent/20">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Codex Design Tokens</h1>
          <p className="text-codex-muted text-lg">
            Preview of extracted UI tokens from Codex IDE screenshots.
          </p>
        </div>

        {/* Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-codex-border pb-2">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ColorSwatch name="Background" variable="bg-codex-background" border />
            <ColorSwatch name="Sidebar" variable="bg-codex-sidebar" border />
            <ColorSwatch name="Surface" variable="bg-codex-surface" border />
            <ColorSwatch name="Border" variable="bg-codex-border" />
            <ColorSwatch name="Accent" variable="bg-codex-accent" text="text-codex-background" />
            <ColorSwatch name="Muted" variable="bg-codex-muted" text="text-codex-background" />
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-codex-border pb-2">Typography</h2>
          <div className="bg-codex-surface border border-codex-border p-6 rounded-codex-xl space-y-6">
            <div>
              <div className="text-sm text-codex-muted mb-1">Heading 1 (Page Title)</div>
              <h1 className="text-3xl font-bold">What should we build in tatalaku?</h1>
            </div>
            <div>
              <div className="text-sm text-codex-muted mb-1">Heading 2 (Section Title)</div>
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div>
              <div className="text-sm text-codex-muted mb-1">Body Text</div>
              <p className="text-base text-codex-foreground leading-relaxed">
                Saat ini aplikasi masih di Fase 1 (fondasi), jadi fitur pengguna belum tersedia di
                antarmuka—halaman utama masih kosong.
              </p>
            </div>
            <div>
              <div className="text-sm text-codex-muted mb-1">Muted / Small Text</div>
              <p className="text-sm text-codex-muted">
                Resets every month · Next reset is on Sep 23 at 9:30 PM
              </p>
            </div>
          </div>
        </section>

        {/* UI Elements Preview */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-codex-border pb-2">
            Component Preview
          </h2>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Mock */}
            <div className="w-full lg:w-64 bg-codex-sidebar rounded-codex-xl p-4 flex flex-col gap-1 border border-codex-border/50">
              <div className="px-3 py-2 text-xs font-semibold text-codex-muted uppercase tracking-wider mb-2">
                Projects
              </div>
              <div className="px-3 py-2 bg-codex-surface rounded-codex-md flex items-center justify-between cursor-pointer border border-codex-border">
                <span className="text-sm font-medium">tatalaku</span>
              </div>
              <div className="px-3 py-2 rounded-codex-md flex items-center text-codex-muted hover:bg-codex-surface/50 cursor-pointer transition-colors">
                <span className="text-sm">kirana-app</span>
              </div>

              <div className="mt-8 px-3 py-2 text-xs font-semibold text-codex-muted uppercase tracking-wider mb-2">
                Recents
              </div>
              <div className="px-3 py-2 rounded-codex-md text-sm text-codex-muted">No chats</div>

              <div className="mt-auto pt-8">
                <div className="bg-codex-surface border border-codex-border rounded-codex-lg p-4">
                  <div className="text-xs font-medium mb-1">9% usage remaining</div>
                  <div className="text-[10px] text-codex-muted mb-3">Resets every month</div>
                  <div className="h-1.5 bg-codex-border rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-codex-accent w-[9%]" />
                  </div>
                  <button className="w-full py-1.5 bg-codex-foreground text-codex-background rounded-codex-md text-xs font-medium hover:opacity-90 transition-opacity">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 bg-codex-background border border-codex-border rounded-codex-2xl p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Appearance</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-codex-surface border border-codex-border rounded-codex-md text-sm font-medium hover:bg-codex-border/30 transition-colors">
                    Discard
                  </button>
                  <button className="px-3 py-1.5 bg-codex-accent text-codex-background rounded-codex-md text-sm font-medium hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-codex-surface border border-codex-border rounded-codex-xl p-4 flex flex-col gap-3 hover:border-codex-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-codex-sm bg-codex-sidebar flex items-center justify-center text-codex-muted">
                      {/* Placeholder Icon */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <line x1="3" x2="21" y1="9" y2="9" />
                        <line x1="9" x2="9" y1="21" y2="9" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-sm mb-1">Theme Config {i}</div>
                      <div className="text-xs text-codex-muted">
                        Customize your UI appearance and colors.
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Setting Row */}
              <div className="bg-codex-surface border border-codex-border rounded-codex-xl p-4 flex items-center justify-between mt-4">
                <div>
                  <div className="font-medium text-sm">Accent Color</div>
                  <div className="text-xs text-codex-muted">
                    Used for primary actions and highlights
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-codex-sidebar rounded-codex-md border border-codex-border">
                  <div className="w-3 h-3 rounded-full bg-codex-accent" />
                  <span className="text-sm font-medium">#CC7D5E</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  variable,
  border = false,
  text = "text-codex-foreground",
}: {
  name: string;
  variable: string;
  border?: boolean;
  text?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-24 w-full rounded-codex-lg ${variable} ${border ? "border border-codex-border" : ""} flex items-end p-3`}
      >
        <span className={`text-xs font-mono font-medium ${text} opacity-90`}>
          {variable.replace("bg-", "")}
        </span>
      </div>
      <div className="font-medium text-sm">{name}</div>
    </div>
  );
}
