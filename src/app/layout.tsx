import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Placeholder metadata for the scaffold stage; will be expanded once
// design tokens and real copy land (see docs/BUILD_PLAN.md section 1).
export const metadata: Metadata = {
  title: "The Forge",
  description: "Rachit Mittal — full-stack developer, AI engineer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
