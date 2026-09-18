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

/** A small faceted low-poly gem, toon-shaded with a soft arcane glow. */
export function GemPlaceholder() {
  const outline = useMemo(() => createOutlineMaterial("#3f5450"), []);
  const material = useMemo(
    () =>
      createToonMaterial({
        color: "#5fd3c6",
        emissive: "#2f8f86",
        emissiveIntensity: 0.4,
      }),
    [],
  );

  return (
    <group>
      <mesh geometry={gemGeometry} scale={1.03} material={outline} />
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
  const outline = useMemo(() => createOutlineMaterial("#8a7a5c"), []);
  const material = useMemo(() => createToonMaterial({ color: "#e4d8c3" }), []);

  return (
    <group>
      <mesh geometry={bladeGeometry} scale={1.05} material={outline} />
      <mesh geometry={bladeGeometry} material={material} />
    </group>
  );
}
