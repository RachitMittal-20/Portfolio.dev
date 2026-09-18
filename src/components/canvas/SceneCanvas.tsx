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
import { useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/store/scene";
import SceneManager from "./SceneManager";
import styles from "./SceneCanvas.module.css";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
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
  const frameloop = useAutoFrameloop();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      setCanRender(!media.matches && detectWebGL());
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
        <SceneManager />
      </Canvas>
    </div>
  );
}
