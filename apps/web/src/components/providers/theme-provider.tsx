"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeInitScript />
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeSync />
        {children}
      </NextThemesProvider>
    </>
  );
}

function ThemeSync() {
  const { resolvedTheme } = useTheme();
  const { lightCodeThemeId, darkCodeThemeId, setResolvedVariant, activeConfig } = useThemeStore();

  useEffect(() => {
    if (!resolvedTheme) return;

    // Ensure store is updated with the active variant based on system resolution
    setResolvedVariant(resolvedTheme as "light" | "dark");

    // Inject the data attribute for the theme configuration
    const activeThemeId = resolvedTheme === "light" ? lightCodeThemeId : darkCodeThemeId;
    document.documentElement.setAttribute("data-code-theme", activeThemeId);
    document.documentElement.setAttribute(
      "data-opaque-windows",
      activeConfig.opaqueWindows.toString(),
    );
  }, [
    resolvedTheme,
    lightCodeThemeId,
    darkCodeThemeId,
    activeConfig.opaqueWindows,
    setResolvedVariant,
  ]);

  return null;
}

function ThemeInitScript() {
  // This script runs before hydration to ensure data-code-theme is correct on first paint,
  // preventing a Flash of Unstyled Content (FOUC).
  // It works alongside next-themes which handles the class="dark".
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const storeRaw = localStorage.getItem("tatalaku-theme-v1");
            if (storeRaw) {
              const store = JSON.parse(storeRaw);
              
              // Figure out if next-themes will apply dark or light
              let isDark = false;
              const nextTheme = localStorage.getItem("theme");
              
              if (nextTheme === "dark") {
                isDark = true;
              } else if (nextTheme === "system" || !nextTheme) {
                isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              }
              
              const activeThemeId = isDark ? store.state.darkCodeThemeId : store.state.lightCodeThemeId;
              if (activeThemeId) {
                document.documentElement.setAttribute("data-code-theme", activeThemeId);
              }
              
              const activeOpaqueWindows = store.state.activeConfig?.opaqueWindows ?? true;
              document.documentElement.setAttribute("data-opaque-windows", activeOpaqueWindows.toString());
            }
          } catch (e) {}
        `,
      }}
    />
  );
}
