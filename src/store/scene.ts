// Global 3D scene state: which scene is active, the shared camera target,
// and a registry of per-frame "tickers". Components register a callback
// here instead of calling useFrame directly, so <SceneCanvas/> can (a) know
// in one place whether *anything* needs to animate this frame, to decide
// between an idle "demand" and continuous "always" frameloop, and (b) pause
// every running animation globally just by not calling the registry at all.
import { create } from "zustand";
import type { RootState } from "@react-three/fiber";

export type SceneId = string;

export type Ticker = (state: RootState, delta: number) => void;

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

interface SceneState {
  activeSceneId: SceneId;
  camera: CameraState;
  tickers: Map<string, Ticker>;
  setActiveScene: (id: SceneId) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  registerTicker: (id: string, ticker: Ticker) => void;
  unregisterTicker: (id: string) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  // Hardcoded for now — Phase 2's scene registry will drive this from
  // ScrollTrigger per section instead.
  activeSceneId: "gem-demo",
  camera: { position: [0, 0, 5], target: [0, 0, 0] },
  tickers: new Map(),
  setActiveScene: (id) => set({ activeSceneId: id }),
  setCamera: (camera) => set((state) => ({ camera: { ...state.camera, ...camera } })),
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
