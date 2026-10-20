import type { Metadata, Viewport } from "next";
// Inter (interface and prose) and Fraunces (editorial headings), self-hosted
// via next/font/local. Exposes --font-inter and --font-fraunces.
import { fontSans, fontSerif } from "./fonts";
import "./globals.css";
import { LucideProvider } from "lucide-react";
import { AppProvider } from "@/components/app";
import { MotionSync, ThemeSync } from "@/components/providers";
import { MotionProvider } from "@/components/motion";
import { PREPAINT_SCRIPT } from "@/lib/prepaint";

export const metadata: Metadata = {
  title: "Tatalaku",
  description: "A calm, block-based workspace for reading and writing",
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
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
      // The pre-paint script adds data-theme / data-motion before hydration
      suppressHydrationWarning
    >
      <head>
        {/* Must stay a plain inline script so it runs before the first paint */}
        <script id="tatalaku-prepaint" dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        <MotionSync />
        {/* A slightly finer stroke than lucide's default suits the type */}
        <LucideProvider strokeWidth={1.75}>
          <MotionProvider>
            <AppProvider>{children}</AppProvider>
          </MotionProvider>
        </LucideProvider>
      </body>
    </html>
  );
}
