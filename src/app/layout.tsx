import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import Loader from "@/components/loader/Loader";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { clashDisplay, satoshi, cinzel } from "./fonts";
import "@/styles/globals.css";

// Placeholder metadata for the scaffold stage; will be expanded once real
// copy lands (see docs/BUILD_PLAN.md section 1).
export const metadata: Metadata = {
  title: "The Forge",
  description: "Rachit Mittal — full-stack developer, AI engineer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${satoshi.variable} ${cinzel.variable}`}>
      <body>
        <SmoothScroll />
        <Loader />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
