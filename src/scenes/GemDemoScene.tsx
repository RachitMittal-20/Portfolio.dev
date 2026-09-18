"use client";

// Temporary demo scene proving the SceneCanvas → SceneManager → ModelSlot →
// toon material pipeline end-to-end: the procedural gem placeholder,
// toon-shaded, rotating slowly. Registers its rotation with the shared
// ticker registry instead of calling useFrame itself, so <SceneCanvas/>'s
// "demand" ↔ "always" frameloop switch actually has something to react to.
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { GemPlaceholder } from "@/lib/three/ModelSlot";
import { useSceneStore } from "@/store/scene";

const TICKER_ID = "gem-demo:rotate";

export default function GemDemoScene() {
  const groupRef = useRef<Group>(null);
  const registerTicker = useSceneStore((s) => s.registerTicker);
  const unregisterTicker = useSceneStore((s) => s.unregisterTicker);

  useEffect(() => {
    registerTicker(TICKER_ID, (_state, delta) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.4;
      }
    });
    return () => unregisterTicker(TICKER_ID);
  }, [registerTicker, unregisterTicker]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <group ref={groupRef}>
        <GemPlaceholder />
      </group>
    </>
  );
}
