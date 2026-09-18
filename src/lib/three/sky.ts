"use client";

// Painted sky + drifting clouds (docs/BUILD_PLAN.md sections 1.2/1.5). Pure
// factories — no React/JSX here (that lives in the scene component that
// assembles these into the graph and drives the drift via the ticker
// registry, per Phase 2.1). Everything here is generated procedurally
// (a tiny gradient shader, a canvas-drawn cloud alpha texture); no image
// assets.
import * as THREE from "three";

// ---------------------------------------------------------------------
// Painted sky dome — a large inverted sphere with a 3-stop vertical
// gradient: horizon → mid-sky → a darker top (section 1.3 tokens).
// ---------------------------------------------------------------------
interface SkyDomeOptions {
  horizonColor?: THREE.ColorRepresentation;
  midColor?: THREE.ColorRepresentation;
  topColor?: THREE.ColorRepresentation;
  radius?: number;
}

const SKY_DOME_VERTEX = /* glsl */ `
varying vec3 vPos;
void main() {
	vPos = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const SKY_DOME_FRAGMENT = /* glsl */ `
uniform vec3 horizonColor;
uniform vec3 midColor;
uniform vec3 topColor;
varying vec3 vPos;
void main() {
	float h = clamp( normalize( vPos ).y, 0.0, 1.0 );
	vec3 color = mix( horizonColor, midColor, smoothstep( 0.0, 0.45, h ) );
	color = mix( color, topColor, smoothstep( 0.45, 1.0, h ) );
	gl_FragColor = vec4( color, 1.0 );
}
`;

export function createSkyDome(options: SkyDomeOptions = {}): THREE.Mesh {
  const {
    horizonColor = "#cfe3ee", // --sky-200
    midColor = "#8db6cf", // --sky-400
    // --sky-400 blended toward --night-900: a darker top without inventing
    // a new palette colour.
    topColor = new THREE.Color("#8db6cf").lerp(new THREE.Color("#10202a"), 0.55),
    radius = 60,
  } = options;

  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      horizonColor: { value: new THREE.Color(horizonColor) },
      midColor: { value: new THREE.Color(midColor) },
      topColor: { value: new THREE.Color(topColor) },
    },
    vertexShader: SKY_DOME_VERTEX,
    fragmentShader: SKY_DOME_FRAGMENT,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "painted-sky-dome";
  return mesh;
}

// ---------------------------------------------------------------------
// Cloud card sprites — flat, alpha-blended, painted-looking puffs drawn
// procedurally onto a small canvas (a handful of soft radial-gradient
// blobs), no external image.
// ---------------------------------------------------------------------
function createCloudTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const blobCount = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < blobCount; i++) {
      const x = size * (0.28 + Math.random() * 0.44);
      const y = size * (0.4 + Math.random() * 0.28);
      const r = size * (0.16 + Math.random() * 0.16);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, "rgba(255,255,255,0.85)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export interface CloudLayer {
  mesh: THREE.Mesh;
  /** Centre X the layer drifts around. */
  baseX: number;
  /** Radians/second fed into the drift's sine. */
  speed: number;
  /** How far the layer swings either side of baseX. */
  amplitude: number;
  /** Offsets identical layers so they don't drift in lockstep. */
  phase: number;
}

interface CloudLayerOptions {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  speed?: number;
  amplitude?: number;
  opacity?: number;
}

export function createCloudLayer(options: CloudLayerOptions = {}): CloudLayer {
  const {
    x = 0,
    y = 8,
    z = -20,
    width = 14,
    height = 7,
    speed = 0.05,
    amplitude = 6,
    opacity = 0.8,
  } = options;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: createCloudTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
    fog: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.name = "painted-cloud-layer";

  return { mesh, baseX: x, speed, amplitude, phase: Math.random() * Math.PI * 2 };
}

/**
 * Slow, inOut-eased drift (docs/BUILD_PLAN.md section 1.5): a sine wave is
 * the continuous-loop analogue of an ease-in-out curve — velocity peaks at
 * the centre and eases to zero at each extreme, same shape as EASE.inOut,
 * without needing a finite start/end tween for something that loops
 * forever. Call this from a ticker registered with src/store/scene.ts.
 */
export function driftCloudLayer(layer: CloudLayer, elapsedSeconds: number): void {
  layer.mesh.position.x =
    layer.baseX + Math.sin(elapsedSeconds * layer.speed + layer.phase) * layer.amplitude;
}
