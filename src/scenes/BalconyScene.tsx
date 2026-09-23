"use client";

// The Home page's closing scene — "The Balcony" (docs/BUILD_PLAN.md
// sections 1.1/1.2/1.9): a stone rampart edge looking out over a painted
// dusk sky, reusing the Phase 2.2 sky/cloud system with warmer, lower-
// angle light and two layers pushed further back and made more
// translucent for a hazy, distant landscape feel. A calmer close: slower
// cloud drift than the Altar's, and the parapet itself never animates.
//
// No dragon-companion placeholder here — docs/BUILD_PLAN.md section 1.9
// lists it as a *global*, DOM-layer overlay ("Global: dragon companion,
// sound, cursor pill, menu..."), not part of any one 3D scene, and it has
// its own dedicated Phase 5. Adding a placeholder for it here would be
// scope creep on a feature this project hasn't built yet.
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createCloudLayer, createSkyDome, driftCloudLayer } from "@/lib/three/sky";
import { createToonMaterial } from "@/lib/three/toonMaterial";
import { useSceneStore } from "@/store/scene";

const SKY_TICKER_ID = "balcony:sky-drift";

// ---------------------------------------------------------------------
// Parapet — the balcony floor + rampart wall + crenellations the visitor
// is "standing behind". Environment, so no outline (same rule as the
// Altar/Armoury rack).
// ---------------------------------------------------------------------
const floorGeometry = new THREE.PlaneGeometry(11, 6);
const wallGeometry = new THREE.BoxGeometry(6.6, 0.55, 0.3);
const crenelGeometry = new THREE.BoxGeometry(0.28, 0.22, 0.3);
const CRENEL_COUNT = 9;
const CRENEL_SPACING = 6.6 / (CRENEL_COUNT - 1);
const crenelXs = Array.from({ length: CRENEL_COUNT }, (_, i) => -3.3 + i * CRENEL_SPACING);

function Parapet() {
  const material = useMemo(() => createToonMaterial({ color: "#a68f74", rimIntensity: 0 }), []);

  return (
    <group position={[0, -1.1, 1.6]}>
      <mesh
        geometry={floorGeometry}
        material={material}
        position={[0, -0.3, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh geometry={wallGeometry} material={material} />
      {crenelXs.map((x) => (
        <mesh key={x} geometry={crenelGeometry} material={material} position={[x, 0.38, 0]} />
      ))}
    </group>
  );
}

export default function BalconyScene() {
  const registerTicker = useSceneStore((s) => s.registerTicker);
  const unregisterTicker = useSceneStore((s) => s.unregisterTicker);
  const performanceTier = useSceneStore((s) => s.performanceTier);
  const reduced = performanceTier === "reduced";

  const sky = useMemo(
    () =>
      createSkyDome({
        horizonColor: "#f4a874", // --ember-300 — warm dusk horizon
        midColor: "#c98a6b", // dusk transition
        // --sky-400 blended much further toward --night-900 than the
        // Altar's dome — the day is further along here.
        topColor: new THREE.Color("#8db6cf").lerp(new THREE.Color("#10202a"), 0.7),
      }),
    [],
  );

  // Further back, larger, and more translucent than the Altar's clouds —
  // reads as a hazy, distant landscape rather than nearby weather.
  const clouds = useMemo(() => {
    const layers = [
      createCloudLayer({
        x: -6,
        y: 5,
        z: -24,
        width: 20,
        height: 9,
        speed: 0.018,
        amplitude: 3,
        opacity: 0.45,
      }),
      createCloudLayer({
        x: 5,
        y: 6.5,
        z: -30,
        width: 24,
        height: 10,
        speed: 0.012,
        amplitude: 2.5,
        opacity: 0.35,
      }),
    ];
    return reduced ? layers.slice(0, 1) : layers;
  }, [reduced]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      registerTicker(SKY_TICKER_ID, (state) => {
        const elapsed = state.clock.elapsedTime;
        clouds.forEach((layer) => driftCloudLayer(layer, elapsed));
      });
    }
    return () => unregisterTicker(SKY_TICKER_ID);
  }, [registerTicker, unregisterTicker, clouds]);

  return (
    <>
      <fog attach="fog" args={["#c98a6b", 9, 26]} />
      <hemisphereLight args={["#8db6cf", "#3a2418", 0.5]} />
      <directionalLight position={[9, 1.4, -2]} intensity={1.2} color="#ff8a54" />

      <primitive object={sky} />
      {clouds.map((layer) => (
        <primitive key={layer.mesh.id} object={layer.mesh} />
      ))}

      <Parapet />
    </>
  );
}
