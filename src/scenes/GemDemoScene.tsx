"use client";

// Temporary demo scene proving the SceneCanvas → SceneManager → ModelSlot →
// Painted Clay material pipeline end-to-end: a painted sky with drifting
// clouds behind an outlined gem (rotating) resting on a non-outlined plinth
// — the outlined-vs-plain comparison section 1.2 asks for. Every animation
// goes through the shared ticker registry instead of its own useFrame, so
// <SceneCanvas/>'s "demand" ↔ "always" frameloop switch has something to
// react to, and everything can be paused from one place.
//
// Also reads the performance tier from src/store/scene.ts to simplify
// itself on low-end devices: fewer cloud layers, and a cheaper (lower)
// noise sampling on the gem's material — the concrete example the tier
// exists to enable.
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { GemPlaceholder, PlinthPlaceholder } from "@/lib/three/ModelSlot";
import { createCloudLayer, createSkyDome, driftCloudLayer } from "@/lib/three/sky";
import { useSceneStore } from "@/store/scene";

const ROTATE_TICKER_ID = "gem-demo:rotate";
const SKY_TICKER_ID = "gem-demo:sky-drift";

// TODO(phase 4+): retune emissive — bumped hot (4x the normal 0.4) purely
// so bloom is obviously visible in a screenshot/regression check while
// there's no real hero asset yet. Bring this back down once one exists.
const GEM_EMISSIVE_INTENSITY = 1.6;

export default function GemDemoScene() {
  const groupRef = useRef<Group>(null);
  const registerTicker = useSceneStore((s) => s.registerTicker);
  const unregisterTicker = useSceneStore((s) => s.unregisterTicker);
  const performanceTier = useSceneStore((s) => s.performanceTier);
  const reduced = performanceTier === "reduced";

  const sky = useMemo(() => createSkyDome(), []);
  const clouds = useMemo(() => {
    const layers = [
      createCloudLayer({ x: -4, y: 7, z: -22, speed: 0.045, amplitude: 5 }),
      createCloudLayer({
        x: 5,
        y: 9,
        z: -28,
        width: 18,
        height: 8,
        speed: 0.03,
        amplitude: 7,
        opacity: 0.6,
      }),
      createCloudLayer({
        x: 0,
        y: 5.5,
        z: -18,
        width: 10,
        height: 5,
        speed: 0.06,
        amplitude: 4,
        opacity: 0.9,
      }),
    ];
    // Fewer overlapping translucent cards on low-end tiers.
    return reduced ? layers.slice(0, 1) : layers;
  }, [reduced]);

  useEffect(() => {
    registerTicker(ROTATE_TICKER_ID, (_state, delta) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.4;
      }
    });

    // The canvas itself already never mounts under prefers-reduced-motion
    // (src/components/canvas/SceneCanvas.tsx), which makes this check moot
    // today — but that's a property of *this* app's current fallback
    // strategy, not of the ticker registry itself. Any later scene that
    // renders under reduced motion (e.g. a lighter fallback tier) should
    // still follow this pattern: check once, skip registering time-based
    // drift, and the frame stays static.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      registerTicker(SKY_TICKER_ID, (state) => {
        const elapsed = state.clock.elapsedTime;
        clouds.forEach((layer) => driftCloudLayer(layer, elapsed));
      });
    }

    return () => {
      unregisterTicker(ROTATE_TICKER_ID);
      unregisterTicker(SKY_TICKER_ID);
    };
  }, [registerTicker, unregisterTicker, clouds]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />

      <primitive object={sky} />
      {clouds.map((layer) => (
        <primitive key={layer.mesh.id} object={layer.mesh} />
      ))}

      <group position={[0, -0.6, 0]}>
        <PlinthPlaceholder />
        <group ref={groupRef} position={[0, 0.9, 0]}>
          <GemPlaceholder
            emissiveIntensity={GEM_EMISSIVE_INTENSITY}
            noiseIntensity={reduced ? 0.02 : undefined}
          />
        </group>
      </group>
    </>
  );
}
