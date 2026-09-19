"use client";

// The Home page's second scene — "The Throne Room" (docs/BUILD_PLAN.md
// sections 1.1/1.2/1.9): a dim castle interior, one shaft of warm window
// light falling across an empty throne and a kneeling knight facing it.
// Darker, cooler ambient overall vs the Altar's bright open sky —
// "part of the whole castle" (section 1.1), not a separate mood.
//
// Idle only — nothing here animates (no scroll-driven camera yet, and
// there's nothing else in the scene worth ticking), so the shared
// frameloop correctly settles back to "demand" while this is the active
// scene. Reuses the shared toon/outline material system
// (src/lib/three/toonMaterial.ts) — no new material code.
import { useMemo } from "react";
import * as THREE from "three";
import { createOutlineMaterial, createToonMaterial } from "@/lib/three/toonMaterial";

// ---------------------------------------------------------------------
// Throne — the section's focal object, so it gets an outline even though
// it isn't a character (a deliberate exception to section 1.2's usual
// characters-only rule, for the one hero prop in this scene).
// ---------------------------------------------------------------------
function createThroneBackGeometry(): THREE.ExtrudeGeometry {
  // A tall gothic-arch silhouette: straight sides rising to a shouldered
  // point, like a stylised cathedral window.
  const shape = new THREE.Shape();
  const halfWidth = 0.55;
  const shoulder = 1.5;
  const peak = 1.85;
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(-halfWidth, shoulder);
  shape.lineTo(0, peak);
  shape.lineTo(halfWidth, shoulder);
  shape.lineTo(halfWidth, 0);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
  geometry.translate(0, 0, -0.07);
  return geometry;
}

const throneBackGeometry = createThroneBackGeometry();
const throneSeatGeometry = new THREE.BoxGeometry(1.05, 0.14, 0.9);
const throneArmGeometry = new THREE.BoxGeometry(0.12, 0.45, 0.85);
const throneBaseGeometry = new THREE.BoxGeometry(1.15, 0.18, 1.0);

const THRONE_SEAT_Y = 0.55;
const THRONE_ARM_Y = THRONE_SEAT_Y + 0.3;
const THRONE_ARM_X = 0.47;
const THRONE_BASE_Y = THRONE_SEAT_Y - 0.16;

function Throne() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#241f1a", thickness: 0.025 }), []);
  const woodMaterial = useMemo(() => createToonMaterial({ color: "#4a3423" }), []);
  const trimMaterial = useMemo(
    () => createToonMaterial({ color: "#e3b85c", emissive: "#4a3210", emissiveIntensity: 0.12 }),
    [],
  );
  const outlineScale = 1 + outline.thickness;

  return (
    <group>
      <mesh
        geometry={throneBackGeometry}
        position={[0, THRONE_SEAT_Y, -0.4]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh
        geometry={throneSeatGeometry}
        position={[0, THRONE_SEAT_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh
        geometry={throneArmGeometry}
        position={[-THRONE_ARM_X, THRONE_ARM_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh
        geometry={throneArmGeometry}
        position={[THRONE_ARM_X, THRONE_ARM_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />
      <mesh
        geometry={throneBaseGeometry}
        position={[0, THRONE_BASE_Y, 0]}
        scale={outlineScale}
        material={outline.material}
      />

      <mesh
        geometry={throneBackGeometry}
        position={[0, THRONE_SEAT_Y, -0.4]}
        material={trimMaterial}
      />
      <mesh
        geometry={throneSeatGeometry}
        position={[0, THRONE_SEAT_Y, 0]}
        material={woodMaterial}
      />
      <mesh
        geometry={throneArmGeometry}
        position={[-THRONE_ARM_X, THRONE_ARM_Y, 0]}
        material={woodMaterial}
      />
      <mesh
        geometry={throneArmGeometry}
        position={[THRONE_ARM_X, THRONE_ARM_Y, 0]}
        material={woodMaterial}
      />
      <mesh
        geometry={throneBaseGeometry}
        position={[0, THRONE_BASE_Y, 0]}
        material={woodMaterial}
      />
    </group>
  );
}

// ---------------------------------------------------------------------
// Kneeling knight — a stylised, primitive-based placeholder figure.
// A character, so it gets a visible outline per section 1.2.
// ---------------------------------------------------------------------
const knightRobeGeometry = new THREE.CylinderGeometry(0.1, 0.34, 0.62, 12).toNonIndexed();
knightRobeGeometry.computeVertexNormals();
const knightTorsoGeometry = new THREE.CapsuleGeometry(0.16, 0.3, 4, 10);
const knightHeadGeometry = new THREE.IcosahedronGeometry(0.13, 1);
const knightArmGeometry = new THREE.CapsuleGeometry(0.055, 0.32, 4, 8);

function KneelingKnight() {
  const outline = useMemo(() => createOutlineMaterial({ color: "#1c2430", thickness: 0.03 }), []);
  const armorMaterial = useMemo(() => createToonMaterial({ color: "#5a6472" }), []);
  const outlineScale = 1 + outline.thickness;

  // Bowed forward from the waist; arms angled down as if resting on a
  // raised knee. All positions are local to the group so the whole figure
  // can be placed/faced as one unit in the room.
  return (
    <group>
      <mesh geometry={knightRobeGeometry} scale={outlineScale} material={outline.material} />
      <group position={[0, 0.42, 0.05]} rotation={[0.55, 0, 0]}>
        <mesh geometry={knightTorsoGeometry} scale={outlineScale} material={outline.material} />
        <mesh
          geometry={knightHeadGeometry}
          position={[0, 0.28, 0.02]}
          scale={outlineScale}
          material={outline.material}
        />
        <mesh
          geometry={knightArmGeometry}
          position={[-0.2, -0.02, 0.14]}
          rotation={[0.9, 0, 0.25]}
          scale={outlineScale}
          material={outline.material}
        />
        <mesh
          geometry={knightArmGeometry}
          position={[0.2, -0.02, 0.14]}
          rotation={[0.9, 0, -0.25]}
          scale={outlineScale}
          material={outline.material}
        />
      </group>

      <mesh geometry={knightRobeGeometry} material={armorMaterial} />
      <group position={[0, 0.42, 0.05]} rotation={[0.55, 0, 0]}>
        <mesh geometry={knightTorsoGeometry} material={armorMaterial} />
        <mesh geometry={knightHeadGeometry} position={[0, 0.28, 0.02]} material={armorMaterial} />
        <mesh
          geometry={knightArmGeometry}
          position={[-0.2, -0.02, 0.14]}
          rotation={[0.9, 0, 0.25]}
          material={armorMaterial}
        />
        <mesh
          geometry={knightArmGeometry}
          position={[0.2, -0.02, 0.14]}
          rotation={[0.9, 0, -0.25]}
          material={armorMaterial}
        />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------
// Light shaft — a soft additive-blended gradient plane hinting at a tall,
// unseen window. Not physically accurate, just a believable glow.
// ---------------------------------------------------------------------
function createLightShaftTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(255,244,214,0.9)");
    gradient.addColorStop(0.6, "rgba(255,224,170,0.25)");
    gradient.addColorStop(1, "rgba(255,224,170,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function LightShaft() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: createLightShaftTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(1.6, 5), []);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[-1.6, 1.6, 0.6]}
      rotation={[0, 0, THREE.MathUtils.degToRad(18)]}
    />
  );
}

// ---------------------------------------------------------------------
// Room shell — just enough floor + back wall to read as an interior,
// toon-shaded in dark stone tones.
// ---------------------------------------------------------------------
const floorGeometry = new THREE.PlaneGeometry(14, 14);
const wallGeometry = new THREE.PlaneGeometry(14, 8);

function RoomShell() {
  // Rim/fresnel light is tuned for rounded, character-scale forms — on a
  // large flat plane seen at a grazing angle (a floor stretching away from
  // the camera) the same fresnel term reads as a strong wash of the warm
  // rim tint across the whole surface. Kill it here.
  const material = useMemo(() => createToonMaterial({ color: "#232833", rimIntensity: 0 }), []);
  return (
    <>
      <mesh
        geometry={floorGeometry}
        material={material}
        position={[0, -0.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh geometry={wallGeometry} material={material} position={[0, 3.6, -1.2]} />
    </>
  );
}

export default function ThroneRoomScene() {
  return (
    <>
      <color attach="background" args={["#10202a"]} />
      <fog attach="fog" args={["#10202a", 6, 16]} />

      <hemisphereLight args={["#2c3a44", "#100c08", 0.35]} />
      <directionalLight position={[-4, 5, 2]} intensity={1.1} color="#ffdca8" />

      <RoomShell />
      <LightShaft />

      <Throne />
      <group position={[-1.35, -0.4, 0.9]} rotation={[0, Math.PI / 2.6, 0]}>
        <KneelingKnight />
      </group>
    </>
  );
}
