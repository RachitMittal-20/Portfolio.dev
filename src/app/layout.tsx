import type { Metadata } from "next";
import type { ReactNode } from "react";
import SceneCanvas from "@/components/canvas/SceneCanvas";
import Header from "@/components/layout/Header";
import MenuOverlay from "@/components/layout/MenuOverlay";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CursorPill from "@/components/ui/CursorPill";
import { clashDisplay, satoshi, cinzel } from "./fonts";
import styles from "./layout.module.css";
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
        <SceneCanvas />
        <Header />
        <MenuOverlay />
        <CursorPill />
        <div className={styles.content}>{children}</div>
      </body>
    </html>
  );
}
