"use client";

// Reusable toon shading helper (docs/BUILD_PLAN.md section 1.2). This is
// the lightweight stepping stone: THREE.MeshToonMaterial driven by a 3-step
// gradient ramp texture, plus emissive support for bloom-friendly glows and
// a thin inverted-hull outline. Phase 2.2 replaces this with the full
// custom painted-clay shader (soft gradient edges, painterly noise, rim
// light, per-material presets) — this helper exists so ModelSlot has
// something real to shade with before that lands.
import * as THREE from "three";

interface ToonMaterialOptions {
  color?: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
}

// The ramp is tiny (3px) and shared by every toon material — built once and
// cached, never disposed, since it's a handful of bytes for the app's life.
let rampTexture: THREE.DataTexture | null = null;

function getRampTexture(): THREE.DataTexture {
  if (rampTexture) return rampTexture;

  // shadow / mid / light — soft-ish 3-step ramp, not full black-to-white.
  const steps = [70, 165, 255];
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((value, i) => {
    data[i * 4] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = 255;
  });

  const texture = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  rampTexture = texture;
  return texture;
}

/** Creates a toon material shaded by the shared 3-step gradient ramp. */
export function createToonMaterial(options: ToonMaterialOptions = {}): THREE.MeshToonMaterial {
  const { color = "#e4d8c3", emissive = "#000000", emissiveIntensity = 0 } = options;

  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getRampTexture(),
    emissive,
    emissiveIntensity,
  });
}

/**
 * A thin inverted-hull outline: the same geometry, scaled up slightly and
 * rendered back-face-only in a solid colour. Colour should be a darker
 * shade of the object's own colour — never pure black (section 1.2).
 */
export function createOutlineMaterial(
  color: THREE.ColorRepresentation = "#3a3630",
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
}
