// Global 3D scene state: which scene is active, the shared camera target,
// and a registry of per-frame "tickers". Components register a callback
// here instead of calling useFrame directly, so <SceneCanvas/> can (a) know
// in one place whether *anything* needs to animate this frame, to decide
// between an idle "demand" and continuous "always" frameloop, and (b) pause
// every running animation globally just by not calling the registry at all.
import { create } from "zustand";
import type { RootState } from "@react-three/fiber";
import type { PostFxTier } from "@/lib/three/postFxConfig";

export type SceneId = string;

export type Ticker = (state: RootState, delta: number) => void;

/**
 * The resolved device-capability tier (docs/BUILD_PLAN.md section 1.6's
 * performance guardrail). "full" is the optimistic default; SceneCanvas
 * resolves it properly on mount via a cheap synchronous heuristic and then
 * a short FPS probe, and may downgrade it once more if real frame rates
 * come in low. Scenes read this to simplify their own geometry/shader
 * complexity on low-end tiers (e.g. GemDemoScene's noise sampling) — the
 * same tier also drives <PostProcessing/>'s effect stack.
 */
export type PerformanceTier = PostFxTier;

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

interface SceneState {
  activeSceneId: SceneId;
  camera: CameraState;
  performanceTier: PerformanceTier;
  tickers: Map<string, Ticker>;
  setActiveScene: (id: SceneId) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setPerformanceTier: (tier: PerformanceTier) => void;
  registerTicker: (id: string, ticker: Ticker) => void;
  unregisterTicker: (id: string) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  // Hardcoded for now — Phase 2's scene registry will drive this from
  // ScrollTrigger per section instead.
  activeSceneId: "gem-demo",
  camera: { position: [0, 0, 5], target: [0, 0, 0] },
  performanceTier: "full",
  tickers: new Map(),
  setActiveScene: (id) => set({ activeSceneId: id }),
  setCamera: (camera) => set((state) => ({ camera: { ...state.camera, ...camera } })),
  setPerformanceTier: (tier) => set({ performanceTier: tier }),
  registerTicker: (id, ticker) => {
    const next = new Map(get().tickers);
    next.set(id, ticker);
    set({ tickers: next });
  },
  unregisterTicker: (id) => {
    const next = new Map(get().tickers);
    next.delete(id);
    set({ tickers: next });
  },
}));
