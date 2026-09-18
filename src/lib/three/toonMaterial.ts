"use client";

// The "Painted Clay Anime" material system (docs/BUILD_PLAN.md section 1.2):
// a custom toon shader built on top of three's own built-in toon shader
// (ShaderLib.toon — the same lighting math MeshToonMaterial uses internally,
// including the 3-step gradient-ramp quantization), with three additions
// spliced into its fragment source:
//   1. a cheap procedural value-noise breakup in the shaded diffuse, so
//      flat colour bands read as painted rather than flat CG;
//   2. a soft, warm-tinted rim/fresnel term, added on top of the lit
//      diffuse, to help silhouettes read against skies;
//   3. `emissiveIntensity` actually wired up — three's own toon shader
//      accepts the uniform but never multiplies by it, so it was a no-op
//      in the previous (MeshToonMaterial-based) version of this file.
// Building on ShaderLib.toon (rather than a from-scratch ShaderMaterial, or
// onBeforeCompile over MeshStandardMaterial's much heavier PBR chunks) keeps
// three's multi-light support and gradient-ramp quantization for free and
// gives us plain, readable injection points to extend.
import * as THREE from "three";

interface PaintedClayMaterialOptions {
  color?: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  /** Warm rim-light tint. Defaults to ember-glow (--ember-300). */
  rimColor?: THREE.ColorRepresentation;
  /** 0 disables the rim entirely. */
  rimIntensity?: number;
  /** Higher = thinner, tighter rim. */
  rimPower?: number;
  /** 0–1 strength of the painted noise breakup. */
  noiseIntensity?: number;
  /** Noise frequency; higher = finer speckle. */
  noiseScale?: number;
}

// ---------------------------------------------------------------------
// Shared 3-step gradient ramp (light / mid / shadow) — unchanged from the
// previous version, just relocated. Built once, never disposed.
// ---------------------------------------------------------------------
let rampTexture: THREE.DataTexture | null = null;

function getRampTexture(): THREE.DataTexture {
  if (rampTexture) return rampTexture;

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

// ---------------------------------------------------------------------
// Fragment shader: three's own toon shader, with our additions spliced in.
// Built once and cached — every material instance shares the same compiled
// source and only differs by uniform values.
// ---------------------------------------------------------------------
const NOISE_GLSL = /* glsl */ `
// Cheap 2D value noise (no texture, no external asset) — used only to
// break up flat toon-shaded bands slightly, per section 1.2's "painted,
// not flat CG" rule.
float paintedHash( vec2 p ) {
	return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453123 );
}
float paintedNoise( vec2 p ) {
	vec2 i = floor( p );
	vec2 f = fract( p );
	float a = paintedHash( i );
	float b = paintedHash( i + vec2( 1.0, 0.0 ) );
	float c = paintedHash( i + vec2( 0.0, 1.0 ) );
	float d = paintedHash( i + vec2( 1.0, 1.0 ) );
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y );
}
`;

let cachedFragmentShader: string | null = null;

function buildPaintedClayFragmentShader(): string {
  if (cachedFragmentShader) return cachedFragmentShader;

  let shader = THREE.ShaderLib.toon.fragmentShader;

  // Extra uniforms + the noise helper, right after the block of uniforms
  // three's own toon shader already declares.
  shader = shader.replace(
    "uniform float opacity;",
    `uniform float opacity;
uniform float emissiveIntensity;
uniform vec3 rimColor;
uniform float rimIntensity;
uniform float rimPower;
uniform float noiseIntensity;
uniform float noiseScale;

${NOISE_GLSL}`,
  );

  // emissiveIntensity was declared but never applied upstream — wire it
  // through for real.
  shader = shader.replace(
    "vec3 totalEmissiveRadiance = emissive;",
    "vec3 totalEmissiveRadiance = emissive * emissiveIntensity;",
  );

  // Break up the lit diffuse with painted noise, then add the rim term on
  // top of everything (independent of the toon ramp, so it still reads
  // against a fully-shadowed face).
  shader = shader.replace(
    "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;",
    `
	float paintedBreakup = paintedNoise( vViewPosition.xy * noiseScale );
	vec3 shadedDiffuse = ( reflectedLight.directDiffuse + reflectedLight.indirectDiffuse )
		* ( 1.0 - noiseIntensity * 0.5 + paintedBreakup * noiseIntensity );

	float rimFactor = 1.0 - max( dot( normalize( vNormal ), normalize( vViewPosition ) ), 0.0 );
	rimFactor = pow( clamp( rimFactor, 0.0, 1.0 ), rimPower );
	vec3 rimLight = rimColor * rimFactor * rimIntensity;

	vec3 outgoingLight = shadedDiffuse + totalEmissiveRadiance + rimLight;
`,
  );

  cachedFragmentShader = shader;
  return shader;
}

/** Creates a Painted Clay Anime toon material (docs/BUILD_PLAN.md section 1.2). */
export function createToonMaterial(options: PaintedClayMaterialOptions = {}): THREE.ShaderMaterial {
  const {
    color = "#e4d8c3",
    emissive = "#000000",
    emissiveIntensity = 1,
    rimColor = "#f4a874", // --ember-300, ember glow — warm-tinted rim
    rimIntensity = 0.35,
    rimPower = 2.5,
    noiseIntensity = 0.08,
    noiseScale = 6,
  } = options;

  const uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.toon.uniforms);
  uniforms.diffuse.value = new THREE.Color(color);
  uniforms.emissive.value = new THREE.Color(emissive);
  uniforms.gradientMap.value = getRampTexture();
  uniforms.emissiveIntensity = { value: emissiveIntensity };
  uniforms.rimColor = { value: new THREE.Color(rimColor) };
  uniforms.rimIntensity = { value: rimIntensity };
  uniforms.rimPower = { value: rimPower };
  uniforms.noiseIntensity = { value: noiseIntensity };
  uniforms.noiseScale = { value: noiseScale };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: THREE.ShaderLib.toon.vertexShader,
    fragmentShader: buildPaintedClayFragmentShader(),
    lights: true,
    fog: true,
  });
}

interface OutlineOptions {
  /** A darker shade of the object's own colour — never pure black (section 1.2). */
  color?: THREE.ColorRepresentation;
  /**
   * World-space scale delta for the inverted hull, e.g. 0.03 = +3% bigger.
   * Characters (knight, dragon, sword) get a visible outline; environment
   * and props get a thinner one or none at all — pass 0 to render none.
   */
  thickness?: number;
}

interface Outline {
  material: THREE.MeshBasicMaterial;
  thickness: number;
}

/**
 * A thin inverted-hull outline: the same geometry, scaled up by `thickness`
 * and rendered back-face-only in a solid colour. Colour and width are
 * configured together per call, so each mesh can opt in (characters) or
 * out (thickness: 0, for props/environment) in one place.
 */
export function createOutlineMaterial(options: OutlineOptions = {}): Outline {
  const { color = "#3a3630", thickness = 0.03 } = options;
  return {
    material: new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }),
    thickness,
  };
}
