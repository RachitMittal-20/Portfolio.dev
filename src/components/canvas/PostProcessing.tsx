"use client";

// The full-screen effect stack (docs/BUILD_PLAN.md section 1.2): gentle
// bloom on glowing/emissive surfaces only, a soft vignette, and very fine
// film grain that sits alongside — not on top of — the existing CSS grain
// overlay (src/styles/globals.css). Every numeric knob lives in
// src/lib/three/postFxConfig.ts, keyed by the performance tier resolved in
// <SceneCanvas/> and exposed via src/store/scene.ts.
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useSceneStore } from "@/store/scene";
import { POST_FX_TIERS } from "@/lib/three/postFxConfig";

export default function PostProcessing() {
  const tier = useSceneStore((state) => state.performanceTier);
  const { bloom, grain, vignette } = POST_FX_TIERS[tier];

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {bloom.enabled && (
        <Bloom
          luminanceThreshold={bloom.luminanceThreshold}
          luminanceSmoothing={bloom.luminanceSmoothing}
          intensity={bloom.intensity}
          radius={bloom.radius}
          mipmapBlur={bloom.mipmapBlur}
        />
      )}
      {grain.enabled && <Noise opacity={grain.opacity} premultiply />}
      {vignette.enabled && <Vignette offset={vignette.offset} darkness={vignette.darkness} />}
    </EffectComposer>
  );
}
