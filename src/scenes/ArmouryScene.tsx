"use client";

// The Home page's third scene — "The Armoury" (docs/BUILD_PLAN.md sections
// 1.1/1.2/1.9): a forge-adjacent weapon rack — a second, simpler sword,
// an axe and a shield hanging on a wall-mounted rack — under warm,
// deep-ember forge light, with sparks drifting up past them. Reuses the
// shared toon/outline material system (src/lib/three/toonMaterial.ts) and
// the existing blade silhouette (ModelSlot's BladePlaceholder) for one of
// the rack items — no new material code.
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Points } from "three";
import { BladePlaceholder } from "@/lib/three/ModelSlot";
import { createOutlineMaterial, createToonMaterial } from "@/lib/three/toonMaterial";
import { useSceneStore } from "@/store/scene";

const EMBER_TICKER_ID = "armoury:embers";

// ---------------------------------------------------------------------
// Rack — the wall panel + pegs the weapons hang from. Environment/prop,
// so (per section 1.2) it gets no outline, same rule as the Altar.
// ---------------------------------------------------------------------
const rackPanelGeometry = new THREE.BoxGeometry(4.2, 2.4, 0.12);
const rackPegGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8);

function Rack() {
  const material = useMemo(() => createToonMaterial({ color: "#3a2a1c", rimIntensity: 0 }), []);
  const pegMaterial = useMemo(() => createToonMaterial({ color: "#241a10" }), []);

  return (
    <group>
      <mesh geometry={rackPanelGeometry} material={material} />
      {[-1.3, 0, 1.3].map((x) => (
        <mesh
          key={x}
          geometry={rackPegGeometry}
          material={pegMaterial}
          position={[x, 0.15, 0.15]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------
// Axe — a simple curved head + handle. Background weapon, so a much
// thinner outline than the hero sword's.
// ---------------------------------------------------------------------
function createAxeHeadGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.18);
  shape.quadraticCurveTo(0.42, 0.3, 0.4, -0.02);
  shape.quadraticCurveTo(0.38, -0.28, 0.05, -0.22);
  shape.lineTo(0, -0.05);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
  geometry.translate(0, 0, -0.025);
  return geometry;
}

const axeHeadGeometry = createAxeHeadGeometry();
const axeHandleGeometry = new THREE.CylinderGeometry(0.028, 0.032, 0.85, 8).toNonIndexed();
axeHandleGeometry.computeVertexNormals();

function Axe() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#3a3630", thickness: 0.016 }), []);
  const headMaterial = useMemo(() => createToonMaterial({ color: "#8a8f96" }), []);
  const handleMaterial = useMemo(() => createToonMaterial({ color: "#5c4326" }), []);
  const outlineScale = 1 + outline.thickness;

  return (
    <group>
      <mesh
        geometry={axeHeadGeometry}
        position={[0, 0.35, 0]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh geometry={axeHandleGeometry} scale={outlineScale} material={outline.material} />

      <mesh geometry={axeHeadGeometry} position={[0, 0.35, 0]} material={headMaterial} />
      <mesh geometry={axeHandleGeometry} material={handleMaterial} />
    </group>
  );
}

// ---------------------------------------------------------------------
// Shield — a round face with a raised centre boss.
// ---------------------------------------------------------------------
const shieldFaceGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 20).toNonIndexed();
shieldFaceGeometry.computeVertexNormals();
const shieldBossGeometry = new THREE.SphereGeometry(0.14, 14, 10);

function Shield() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#3a3630", thickness: 0.016 }), []);
  const faceMaterial = useMemo(() => createToonMaterial({ color: "#7a4a2c" }), []);
  const bossMaterial = useMemo(
    () => createToonMaterial({ color: "#e3b85c", emissive: "#5a3a12", emissiveIntensity: 0.1 }),
    [],
  );
  const outlineScale = 1 + outline.thickness;

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={shieldFaceGeometry} scale={outlineScale} material={outline.material} />
      <mesh geometry={shieldFaceGeometry} material={faceMaterial} />
      <mesh
        geometry={shieldBossGeometry}
        position={[0, 0.05, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        material={bossMaterial}
      />
    </group>
  );
}

// ---------------------------------------------------------------------
// Embers — a lightweight additive-blended point sprite system, drifting
// up past the rack and looping. Count halves on the "reduced" tier.
// ---------------------------------------------------------------------
interface EmberSystem {
  points: Points;
  speeds: Float32Array;
  minY: number;
  maxY: number;
}

function createEmberSystem(count: number): EmberSystem {
  const minY = -1.6;
  const maxY = 2.2;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4.5;
    positions[i * 3 + 1] = minY + Math.random() * (maxY - minY);
    positions[i * 3 + 2] = 0.3 + Math.random() * 1.2;
    speeds[i] = 0.25 + Math.random() * 0.35;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: "#f4a874", // --ember-300, ember glow
    size: 0.045,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return { points: new THREE.Points(geometry, material), speeds, minY, maxY };
}

function updateEmberSystem(system: EmberSystem, delta: number): void {
  const positionAttr = system.points.geometry.getAttribute("position") as THREE.BufferAttribute;
  const positions = positionAttr.array as Float32Array;

  for (let i = 0; i < system.speeds.length; i++) {
    const y = positions[i * 3 + 1] + system.speeds[i] * delta;
    if (y > system.maxY) {
      // Loop back to the bottom with a fresh random X/Z for variety.
      positions[i * 3] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 1] = system.minY;
      positions[i * 3 + 2] = 0.3 + Math.random() * 1.2;
    } else {
      positions[i * 3 + 1] = y;
    }
  }

  positionAttr.needsUpdate = true;
}

export default function ArmouryScene() {
  const registerTicker = useSceneStore((s) => s.registerTicker);
  const unregisterTicker = useSceneStore((s) => s.unregisterTicker);
  const performanceTier = useSceneStore((s) => s.performanceTier);
  const reduced = performanceTier === "reduced";

  const embers = useMemo(() => createEmberSystem(reduced ? 14 : 40), [reduced]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      registerTicker(EMBER_TICKER_ID, (_state, delta) => updateEmberSystem(embers, delta));
    }
    return () => unregisterTicker(EMBER_TICKER_ID);
  }, [registerTicker, unregisterTicker, embers]);

  return (
    <>
      <color attach="background" args={["#1c1108"]} />
      <fog attach="fog" args={["#1c1108", 6, 15]} />

      <hemisphereLight args={["#3a2314", "#0d0806", 0.4]} />
      <directionalLight position={[3, 4, 4]} intensity={0.9} color="#ff9a52" />
      <pointLight position={[0, -1.4, 2]} intensity={1.4} color="#e8703a" distance={6} decay={2} />

      <primitive object={embers.points} />

      <group position={[0, 0.2, -0.8]}>
        <Rack />
        <group position={[-1.3, -0.55, 0.35]} rotation={[0, 0, 0.06]}>
          <BladePlaceholder />
        </group>
        <group position={[0, -0.75, 0.35]}>
          <Axe />
        </group>
        <group position={[1.3, -0.35, 0.32]} rotation={[0, 0, -0.05]}>
          <Shield />
        </group>
      </group>
    </>
  );
}
