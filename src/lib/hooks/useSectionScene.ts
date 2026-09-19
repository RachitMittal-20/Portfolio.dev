"use client";

// Scroll-driven scene switching (docs/BUILD_PLAN.md sections 1.5/1.9): a
// home section calls this instead of hand-rolling its own
// IntersectionObserver. When the returned ref's element crosses
// `threshold` visibility, it claims the given scene id in
// src/store/scene.ts — <SceneManager/> mounts whichever scene is
// currently claimed. The observer fires once immediately on mount with
// the element's current visibility too, so a section that's already
// ~50%+ in view (e.g. the hero, at scroll position 0) claims its scene
// right away without waiting for a scroll event.
import { useEffect, useRef } from "react";
import { useSceneStore } from "@/store/scene";
import type { SceneId } from "@/store/scene";

interface UseSectionSceneOptions {
  /** Visibility ratio (0–1) that counts as "this section is active". */
  threshold?: number;
}

export function useSectionScene<T extends HTMLElement>(
  sceneId: SceneId,
  options: UseSectionSceneOptions = {},
) {
  const { threshold = 0.5 } = options;
  const ref = useRef<T | null>(null);
  const setActiveScene = useSceneStore((s) => s.setActiveScene);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveScene(sceneId);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sceneId, threshold, setActiveScene]);

  return ref;
}
