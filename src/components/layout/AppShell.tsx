"use client";

// Everything that sits *behind* the loader (docs/BUILD_PLAN.md sections
// 1.5/1.9): the persistent WebGL canvas, header, menu, cursor pill, and
// the page content itself. While <Loader/> is showing, this whole subtree
// is made `inert` (removes it from focus/hit-testing) and `aria-hidden`
// (removes it from the accessibility tree) — belt-and-suspenders, since
// `inert` alone already implies the aria-hidden behaviour, but both were
// asked for explicitly and neither hurts.
import type { ReactNode } from "react";
import SceneCanvas from "@/components/canvas/SceneCanvas";
import Header from "@/components/layout/Header";
import MenuOverlay from "@/components/layout/MenuOverlay";
import CursorPill from "@/components/ui/CursorPill";
import { useLoaderStore } from "@/store/loader";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  const isLoading = useLoaderStore((s) => s.isLoading);

  return (
    <div inert={isLoading} aria-hidden={isLoading || undefined}>
      <SceneCanvas />
      <Header />
      <MenuOverlay />
      <CursorPill />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
