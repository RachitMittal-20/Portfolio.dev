"use client";

// Placeholder-first model loading (docs/BUILD_PLAN.md section 1.7). Every
// real asset is loaded through <ModelSlot/>: it tries useGLTF(`/models/
// <name>.glb`) and falls back to the given placeholder if the file is
// missing or fails to parse — so a scene ships and looks good before any
// Blender work exists, and later just drop the .glb in with zero code
// changes.
import { Component, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { createOutlineMaterial, createToonMaterial } from "./toonMaterial";

interface ModelSlotProps {
  name: string;
  placeholder: ReactNode;
}

function GLTFModel({ name }: { name: string }) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  return <primitive object={scene} />;
}

interface BoundaryProps {
  name: string;
  placeholder: ReactNode;
  children: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

// useGLTF suspends while loading and throws a real Error (via suspend-react
// re-throwing the loader's rejection) once a fetch 404s — only a class
// component can catch that.
class ModelErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[ModelSlot] "${this.props.name}.glb" failed to load — using placeholder.`,
        error,
      );
    }
  }

  render() {
    return this.state.failed ? this.props.placeholder : this.props.children;
  }
}

export default function ModelSlot({ name, placeholder }: ModelSlotProps) {
  return (
    <ModelErrorBoundary name={name} placeholder={placeholder}>
      <Suspense fallback={placeholder}>
        <GLTFModel name={name} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// --- Generic procedural placeholders, to prove the pattern end-to-end. ---

// De-indexed so each triangle owns its own vertices — computeVertexNormals
// then yields true per-face (faceted) normals, since MeshToonMaterial has
// no `flatShading` flag of its own to lean on.
const gemGeometry = new THREE.IcosahedronGeometry(1, 0).toNonIndexed();
gemGeometry.computeVertexNormals();

interface GemPlaceholderProps {
  emissiveIntensity?: number;
  noiseIntensity?: number;
}

/**
 * A small faceted low-poly gem, toon-shaded with a soft arcane glow.
 * Characters/heroes get a visible outline (section 1.2) — the gem stands
 * in for one here.
 */
export function GemPlaceholder({
  emissiveIntensity = 0.4,
  noiseIntensity,
}: GemPlaceholderProps = {}) {
  const outline = useMemo(() => createOutlineMaterial({ color: "#3f5450", thickness: 0.03 }), []);
  const material = useMemo(
    () =>
      createToonMaterial({
        color: "#5fd3c6",
        emissive: "#2f8f86",
        emissiveIntensity,
        noiseIntensity,
      }),
    [emissiveIntensity, noiseIntensity],
  );

  return (
    <group>
      <mesh geometry={gemGeometry} scale={1 + outline.thickness} material={outline.material} />
      <mesh geometry={gemGeometry} material={material} />
    </group>
  );
}

function createBladeGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.2);
  shape.lineTo(0.16, 0.85);
  shape.lineTo(0.16, -1);
  shape.lineTo(-0.16, -1);
  shape.lineTo(-0.16, 0.85);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
  geometry.center();
  return geometry;
}

const bladeGeometry = createBladeGeometry();

/** A simple extruded blade silhouette, toon-shaded like stone/ivory. */
export function BladePlaceholder() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#8a7a5c", thickness: 0.05 }), []);
  const material = useMemo(() => createToonMaterial({ color: "#e4d8c3" }), []);

  return (
    <group>
      <mesh geometry={bladeGeometry} scale={1 + outline.thickness} material={outline.material} />
      <mesh geometry={bladeGeometry} material={material} />
    </group>
  );
}

const plinthGeometry = new THREE.CylinderGeometry(1.3, 1.5, 0.32, 24).toNonIndexed();
plinthGeometry.computeVertexNormals();

/**
 * A simple ground/plinth prop, toon-shaded stone — deliberately no outline
 * mesh at all, per section 1.2's rule that outlines are for characters
 * only. Environment and props read as thin-or-none.
 */
export function PlinthPlaceholder() {
  const material = useMemo(() => createToonMaterial({ color: "#b9a68a" }), []);
  return <mesh geometry={plinthGeometry} material={material} />;
}

// --- Hero sword (the Altar scene's centrepiece) ---

function createSwordBladeGeometry(): THREE.ExtrudeGeometry {
  // Origin at the crossguard end (local Y ≈ 0); the point is up at the far
  // end (local Y = tip) so the whole sword can be built "point up" and then
  // flipped 180° to plant it point-down into the altar.
  const shape = new THREE.Shape();
  const tip = 2.3;
  const shoulder = 1.95;
  const base = 0.05;
  const width = 0.14;
  shape.moveTo(0, tip);
  shape.lineTo(width, shoulder);
  shape.lineTo(width, base);
  shape.lineTo(-width, base);
  shape.lineTo(-width, shoulder);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
  geometry.translate(0, 0, -0.025);
  return geometry;
}

const swordBladeGeometry = createSwordBladeGeometry();
const swordCrossguardGeometry = new THREE.BoxGeometry(0.72, 0.09, 0.13);

const swordGripGeometry = new THREE.CylinderGeometry(0.055, 0.065, 0.5, 12).toNonIndexed();
swordGripGeometry.computeVertexNormals();
const SWORD_GRIP_Y = -0.25;

const swordPommelGeometry = new THREE.IcosahedronGeometry(0.095, 0).toNonIndexed();
swordPommelGeometry.computeVertexNormals();
const SWORD_POMMEL_Y = -0.53;

/**
 * A proper hero sword — blade, crossguard, grip and pommel, not just a
 * blade silhouette — toon-shaded and outlined as a set (section 1.2:
 * characters/hero-objects get a visible outline, unlike the altar it
 * rests on). Origin sits at the crossguard; the blade points +Y.
 */
export function SwordPlaceholder() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#332b22", thickness: 0.035 }), []);
  // Cool near-white ivory — deliberately lighter than the altar's warm
  // sandstone (stone-400) so the blade reads as a distinct object against
  // it, not a same-toned rectangle blending into the stone.
  const bladeMaterial = useMemo(() => createToonMaterial({ color: "#f6f1e7" }), []);
  const fittingsMaterial = useMemo(
    () => createToonMaterial({ color: "#e3b85c", emissive: "#7a5b1e", emissiveIntensity: 0.15 }),
    [],
  );
  const gripMaterial = useMemo(() => createToonMaterial({ color: "#b9a68a" }), []);
  const outlineScale = 1 + outline.thickness;

  return (
    <group>
      <mesh geometry={swordBladeGeometry} scale={outlineScale} material={outline.material} />
      <mesh geometry={swordCrossguardGeometry} scale={outlineScale} material={outline.material} />
      <mesh
        geometry={swordGripGeometry}
        position={[0, SWORD_GRIP_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh
        geometry={swordPommelGeometry}
        position={[0, SWORD_POMMEL_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />

      <mesh geometry={swordBladeGeometry} material={bladeMaterial} />
      <mesh geometry={swordCrossguardGeometry} material={fittingsMaterial} />
      <mesh geometry={swordGripGeometry} position={[0, SWORD_GRIP_Y, 0]} material={gripMaterial} />
      <mesh
        geometry={swordPommelGeometry}
        position={[0, SWORD_POMMEL_Y, 0]}
        material={fittingsMaterial}
      />
    </group>
  );
}

// --- Altar (the sword's plinth) ---

const altarBaseGeometry = new THREE.CylinderGeometry(1.6, 1.85, 0.34, 24).toNonIndexed();
altarBaseGeometry.computeVertexNormals();
const altarMidGeometry = new THREE.CylinderGeometry(1.05, 1.3, 0.3, 22).toNonIndexed();
altarMidGeometry.computeVertexNormals();
const altarTopGeometry = new THREE.CylinderGeometry(0.55, 0.72, 0.26, 20).toNonIndexed();
altarTopGeometry.computeVertexNormals();

// Stacked bottom-up so the tiers actually touch: each tier's centre Y is
// (previous top) + (its own half-height).
const ALTAR_BASE_Y = -1.53;
const ALTAR_MID_Y = ALTAR_BASE_Y + 0.34 / 2 + 0.3 / 2; // -1.21
const ALTAR_TOP_Y = ALTAR_MID_Y + 0.3 / 2 + 0.26 / 2; // -0.93
/** World Y of the altar's top surface — where the sword should sit. */
export const ALTAR_SURFACE_Y = ALTAR_TOP_Y + 0.26 / 2; // -0.8

/**
 * A stepped stone altar — environment/prop, so per section 1.2 it gets no
 * outline at all (same thin-or-none rule as PlinthPlaceholder).
 */
export function AltarPlaceholder() {
  const material = useMemo(() => createToonMaterial({ color: "#b9a68a" }), []);
  return (
    <group>
      <mesh geometry={altarBaseGeometry} position={[0, ALTAR_BASE_Y, 0]} material={material} />
      <mesh geometry={altarMidGeometry} position={[0, ALTAR_MID_Y, 0]} material={material} />
      <mesh geometry={altarTopGeometry} position={[0, ALTAR_TOP_Y, 0]} material={material} />
    </group>
  );
}
