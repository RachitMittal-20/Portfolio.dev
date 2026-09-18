"use client";

// The persistent WebGL layer (docs/BUILD_PLAN.md sections 1.2/1.9): one
// fixed full-viewport <Canvas>, mounted once in the root layout, sitting
// behind all DOM content. Starts idle ("demand" frameloop — nothing is
// rendered until something invalidates it) and only switches to a
// continuously-rendering "always" loop while at least one scene has a
// ticking animation registered in src/store/scene.ts.
//
// Skips creating a WebGL context entirely under prefers-reduced-motion or
// when WebGL itself isn't available — the rest of the page is plain DOM/CSS
// and stays fully usable either way.
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/store/scene";
import SceneManager from "./SceneManager";
import PostProcessing from "./PostProcessing";
import styles from "./SceneCanvas.module.css";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Cheap synchronous first guess at the device's performance tier (docs/
 * BUILD_PLAN.md section 1.6): a coarse (touch) pointer or few logical CPU
 * cores is treated as "reduced" until the FPS probe below runs. This is
 * only ever a starting point — the probe can downgrade it further, but
 * never upgrades a tier this heuristic already dropped.
 */
function detectInitialTier(): "full" | "reduced" {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarsePointer || fewCores ? "reduced" : "full";
}

const FPS_PROBE_DURATION_MS = 2000;
const FPS_PROBE_THRESHOLD = 45;

/**
 * Runs for ~2s after mount, forcing "always" so it actually gets frames to
 * measure (see the `probing` override below), and downgrades the tier once
 * if the real, measured frame rate is poor — catches devices the static
 * heuristic alone would miss (e.g. a throttled/integrated desktop GPU).
 * Never upgrades; only ever a one-time potential downgrade.
 */
function PerformanceProbe({ onDone }: { onDone: () => void }) {
  const frameCount = useRef(0);
  const startTime = useRef<number | null>(null);
  const finished = useRef(false);

  useFrame(() => {
    if (finished.current) return;

    const now = performance.now();
    if (startTime.current === null) startTime.current = now;
    frameCount.current += 1;

    const elapsed = now - startTime.current;
    if (elapsed < FPS_PROBE_DURATION_MS) return;

    finished.current = true;
    const fps = frameCount.current / (elapsed / 1000);
    if (fps < FPS_PROBE_THRESHOLD) {
      useSceneStore.getState().setPerformanceTier("reduced");
    }
    onDone();
  });

  return null;
}

/** Idle by default; "always" only while a scene actually needs to animate. */
function useAutoFrameloop(): "always" | "demand" {
  const tickerCount = useSceneStore((state) => state.tickers.size);
  return tickerCount > 0 ? "always" : "demand";
}

/** The single useFrame subscription for the whole app — fans out to every
 *  registered ticker instead of each scene subscribing on its own, so
 *  pausing everything is just "don't call this". */
function TickerRunner() {
  useFrame((state, delta) => {
    useSceneStore.getState().tickers.forEach((tick) => tick(state, delta));
  });
  return null;
}

export default function SceneCanvas() {
  const [canRender, setCanRender] = useState(false);
  const [probing, setProbing] = useState(true);
  const autoFrameloop = useAutoFrameloop();
  const frameloop = probing ? "always" : autoFrameloop;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      const webglAvailable = detectWebGL();
      setCanRender(!media.matches && webglAvailable);
      if (webglAvailable) {
        useSceneStore.getState().setPerformanceTier(detectInitialTier());
      }
    }

    evaluate();
    media.addEventListener("change", evaluate);
    return () => media.removeEventListener("change", evaluate);
  }, []);

  if (!canRender) return null;

  return (
    <div className={styles.layer}>
      <Canvas dpr={[1, 2]} gl={{ powerPreference: "high-performance" }} frameloop={frameloop}>
        <TickerRunner />
        {probing && <PerformanceProbe onDone={() => setProbing(false)} />}
        <SceneManager />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
