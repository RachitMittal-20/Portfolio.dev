"use client";

// A route says which registered scene it wants mounted behind it. Real
// per-section scroll-driven scene switching is later work (this prompt is
// explicitly "no scroll-driven camera movement yet") — for now each page
// just claims one scene on mount, which is enough to keep GemDemoScene
// alive on /styleguide while Home shows the real Altar scene.
import { useEffect } from "react";
import { useSceneStore } from "@/store/scene";
import type { SceneId } from "@/store/scene";

export default function SetActiveScene({ id }: { id: SceneId }) {
  const setActiveScene = useSceneStore((s) => s.setActiveScene);

  useEffect(() => {
    setActiveScene(id);
  }, [id, setActiveScene]);

  return null;
}
