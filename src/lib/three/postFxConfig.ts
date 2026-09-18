// Post-processing tuning constants (docs/BUILD_PLAN.md section 1.2's
// "gentle bloom on glowing things only, soft vignette, fine film grain").
// Every effect intensity used by <PostProcessing/> comes from here — never
// hardcode a magic number directly in the component, so retuning later is
// a one-file change.
//
// Two tiers only, matching the guardrail in SceneCanvas.tsx: "full" for
// capable devices, "reduced" (bloom only, cheaper settings) for low-end/
// mobile or anything the runtime FPS probe catches struggling. No "off"
// tier yet — add one here first if a device turns out too weak even for
// bloom-only.
export type PostFxTier = "full" | "reduced";

interface BloomConfig {
  enabled: boolean;
  /** Raised well above 0 so only bright/emissive surfaces (ember, gold, the
   *  gem's glow) bloom — not the whole ivory-toned scene. */
  luminanceThreshold: number;
  luminanceSmoothing: number;
  intensity: number;
  radius: number;
  mipmapBlur: boolean;
}

interface GrainConfig {
  enabled: boolean;
  /** Kept low and blended the same way as the CSS grain overlay
   *  (src/styles/globals.css, opacity 0.06) so the two don't fight —
   *  this is a much smaller nudge on top, not a second grain layer. */
  opacity: number;
}

interface VignetteConfig {
  enabled: boolean;
  offset: number;
  darkness: number;
}

export interface PostFxConfig {
  bloom: BloomConfig;
  grain: GrainConfig;
  vignette: VignetteConfig;
}

export const POST_FX_TIERS: Record<PostFxTier, PostFxConfig> = {
  full: {
    bloom: {
      enabled: true,
      luminanceThreshold: 0.65,
      luminanceSmoothing: 0.25,
      intensity: 0.6,
      radius: 0.7,
      mipmapBlur: true,
    },
    grain: { enabled: true, opacity: 0.035 },
    vignette: { enabled: true, offset: 0.3, darkness: 0.5 },
  },
  reduced: {
    bloom: {
      enabled: true,
      luminanceThreshold: 0.75,
      luminanceSmoothing: 0.2,
      intensity: 0.45,
      radius: 0.5,
      mipmapBlur: false,
    },
    grain: { enabled: false, opacity: 0 },
    vignette: { enabled: false, offset: 0, darkness: 0 },
  },
};
