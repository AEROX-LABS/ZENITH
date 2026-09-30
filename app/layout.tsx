import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEROX-ZENITH — Obsidian Task & Project Engine",
  description: "Production-grade dark theme task architecture with real-time sync, branching subtasks, tri-view layout, and karma streak velocity.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#000101] text-zinc-100 selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
