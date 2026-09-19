"use client";

// The Home page's hero scene — "The Altar" (docs/BUILD_PLAN.md sections
// 1.1/1.9): the unfinished sword planted point-down into a stone altar,
// above a painted sky with drifting clouds. Golden-hour key light (warm)
// + a cool sky-tinted fill, per section 1.2's lighting rule.
//
// Idle-only for now — no scroll-driven camera (later prompt). The sword
// gets a gentle hover/bob and the sky drifts, both through the shared
// ticker registry so <SceneCanvas/>'s demand↔always frameloop switch keeps
// working, and both freeze cleanly under prefers-reduced-motion.
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { ALTAR_SURFACE_Y, AltarPlaceholder, SwordPlaceholder } from "@/lib/three/ModelSlot";
import { createCloudLayer, createSkyDome, driftCloudLayer } from "@/lib/three/sky";
import { useSceneStore } from "@/store/scene";

const BOB_TICKER_ID = "altar:sword-bob";
const SKY_TICKER_ID = "altar:sky-drift";

// The blade's tip sits ~2.3 local units from the crossguard; planting it
// this far above the altar surface buries most of that length in the
// stone, leaving a believable "sword in the altar" length exposed.
const SWORD_Y = ALTAR_SURFACE_Y + 1.55;
const BOB_AMPLITUDE = 0.045;

export default function AltarScene() {
  const swordRef = useRef<Group>(null);
  const registerTicker = useSceneStore((s) => s.registerTicker);
  const unregisterTicker = useSceneStore((s) => s.unregisterTicker);
  const performanceTier = useSceneStore((s) => s.performanceTier);
  const reduced = performanceTier === "reduced";

  const sky = useMemo(() => createSkyDome(), []);
  const clouds = useMemo(() => {
    const layers = [
      createCloudLayer({ x: -5, y: 6.5, z: -20, speed: 0.04, amplitude: 5 }),
      createCloudLayer({
        x: 4.5,
        y: 8.5,
        z: -26,
        width: 18,
        height: 8,
        speed: 0.028,
        amplitude: 6,
        opacity: 0.55,
      }),
      createCloudLayer({
        x: 0,
        y: 4.5,
        z: -16,
        width: 9,
        height: 4.5,
        speed: 0.05,
        amplitude: 3.5,
        opacity: 0.85,
      }),
    ];
    return reduced ? layers.slice(0, 1) : layers;
  }, [reduced]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion) {
      registerTicker(BOB_TICKER_ID, (state) => {
        if (swordRef.current) {
          swordRef.current.position.y =
            SWORD_Y + Math.sin(state.clock.elapsedTime * 1.1) * BOB_AMPLITUDE;
        }
      });

      registerTicker(SKY_TICKER_ID, (state) => {
        const elapsed = state.clock.elapsedTime;
        clouds.forEach((layer) => driftCloudLayer(layer, elapsed));
      });
    }

    return () => {
      unregisterTicker(BOB_TICKER_ID);
      unregisterTicker(SKY_TICKER_ID);
    };
  }, [registerTicker, unregisterTicker, clouds]);

  return (
    <>
      <hemisphereLight args={["#cfe3ee", "#3a2f22", 0.55]} />
      <directionalLight position={[4, 6, 3]} intensity={1.35} color="#ffe2b0" />

      <primitive object={sky} />
      {clouds.map((layer) => (
        <primitive key={layer.mesh.id} object={layer.mesh} />
      ))}

      <AltarPlaceholder />
      <group ref={swordRef} position={[0, SWORD_Y, 0]} rotation={[0, 0, Math.PI]}>
        <SwordPlaceholder />
      </group>
    </>
  );
}
