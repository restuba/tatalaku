import type { Metadata } from "next";
// Self-hosted Geist (bundled woff2 via next/font/local) — no build-time or
// runtime request to Google Fonts, so the UI font is the same offline,
// behind proxies, and in CI. Exposes --font-geist-sans / --font-geist-mono.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProvider } from "@/components/app";
import { ThemeProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Tatalaku",
  description: "A modern block-based workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
