// Loader UI state (docs/BUILD_PLAN.md sections 1.5/1.9). `isLoading` gates
// interaction with the rest of the app — src/app/layout.tsx makes
// everything else `inert`/`aria-hidden` while it's true. `progress` drives
// the loader's own progress bar: for now a simulated, minimum-duration
// fill (see src/components/loader/Loader.tsx's comment), swapped for real
// asset-loading progress once there's something real to track.
//
// `hasPlayedOnce` mirrors the sessionStorage flag Loader.tsx itself owns —
// it's here so *other* components can react to "did the full sequence run
// this page load" without reading storage themselves.
import { create } from "zustand";

interface LoaderState {
  isLoading: boolean;
  progress: number;
  hasPlayedOnce: boolean;
  setProgress: (progress: number) => void;
  setHasPlayedOnce: (played: boolean) => void;
  finish: () => void;
}

export const useLoaderStore = create<LoaderState>((set, get) => ({
  isLoading: true,
  progress: 0,
  hasPlayedOnce: false,
  // Clamped both ways and never allowed to run backwards, so a future swap
  // to real (possibly noisy) asset-progress reporting can't visually
  // stutter the fill.
  setProgress: (progress) => set({ progress: Math.max(get().progress, Math.min(1, progress)) }),
  setHasPlayedOnce: (played) => set({ hasPlayedOnce: played }),
  finish: () => set({ isLoading: false, progress: 1 }),
}));
