import type { Metadata, Viewport } from "next";
// Space Grotesk (UI), Space Mono (labels, code) and Doto (hero numbers),
// self-hosted via next/font/local. Exposes --font-space-grotesk,
// --font-space-mono and --font-doto.
import { fontDisplay, fontMono, fontSans } from "./fonts";
import "./globals.css";
import Script from "next/script";
import { AppProvider } from "@/components/app";
import { ThemeProvider, MotionSync, MOTION_PREPAINT_SCRIPT } from "@/components/providers";
import { MotionProvider } from "@/components/motion";

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
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="motion-prepaint" strategy="beforeInteractive">
          {MOTION_PREPAINT_SCRIPT}
        </Script>
        <ThemeProvider>
          <MotionSync />
          <MotionProvider>
            <AppProvider>{children}</AppProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
