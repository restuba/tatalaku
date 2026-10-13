import type { Metadata, Viewport } from "next";
// Self-hosted Geist (bundled woff2 via next/font/local) — no build-time or
// runtime request to Google Fonts, so the UI font is the same offline,
// behind proxies, and in CI. Exposes --font-geist-sans / --font-geist-mono.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Script from "next/script";
import { AppProvider } from "@/components/app";
import { ThemeProvider, MotionSync, MOTION_PREPAINT_SCRIPT } from "@/components/providers";

export const metadata: Metadata = {
  title: "Tatalaku",
  description: "A modern block-based workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the layout resize when the on-screen keyboard opens (Android/Chrome)
  // so the caret and toolbars are never hidden behind it.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="motion-prepaint" strategy="beforeInteractive">
          {MOTION_PREPAINT_SCRIPT}
        </Script>
        <ThemeProvider>
          <MotionSync />
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
