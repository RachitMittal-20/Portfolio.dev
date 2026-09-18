// Global scroll state, updated by <SmoothScroll/> on every Lenis "scroll"
// event. Anything that needs scroll progress or velocity (camera rigs,
// scroll-fill text, HUD elements) reads from here instead of wiring its own
// scroll listener.
import { create } from "zustand";
import type Lenis from "lenis";

interface ScrollState {
  /** The live Lenis instance, or null when reduced-motion disables it. */
  lenis: Lenis | null;
  /** Scroll progress relative to the document limit, 0–1. */
  progress: number;
  /** Current scroll velocity, in px/frame, signed by direction. */
  velocity: number;
  setLenis: (lenis: Lenis | null) => void;
  setScroll: (progress: number, velocity: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  lenis: null,
  progress: 0,
  velocity: 0,
  setLenis: (lenis) => set({ lenis }),
  setScroll: (progress, velocity) => set({ progress, velocity }),
}));
