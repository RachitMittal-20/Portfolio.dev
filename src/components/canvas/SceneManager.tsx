"use client";

// Mounts the active scene's subtree (docs/BUILD_PLAN.md section 1.9's
// scene registry, in miniature). Which scene is "active" will eventually
// be driven by ScrollTrigger per section (Phase 2.1); for now the store
// just hardcodes one. Every scene is lazy-loaded so scene code that isn't
// active yet never lands in the initial bundle.
import { lazy, Suspense } from "react";
import { useSceneStore } from "@/store/scene";

const SCENES = {
  altar: lazy(() => import("@/scenes/AltarScene")),
  "throne-room": lazy(() => import("@/scenes/ThroneRoomScene")),
  "gem-demo": lazy(() => import("@/scenes/GemDemoScene")),
} as const;

export default function SceneManager() {
  const activeSceneId = useSceneStore((s) => s.activeSceneId);
  const Scene = SCENES[activeSceneId as keyof typeof SCENES];

  if (!Scene) return null;

  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
