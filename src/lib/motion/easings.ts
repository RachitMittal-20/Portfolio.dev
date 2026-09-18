// Motion easings — the only easing curves used anywhere in this project
// (docs/BUILD_PLAN.md section 1.5). Mirrored as CSS custom properties
// (--ease-main, --ease-expo, --ease-in-out, --ease-std) in
// src/styles/tokens.css — keep both in sync, never invent new curves.
export const EASE = {
  main: "cubic-bezier(0.16, 1, 0.1, 1)", // most UI + reveals (fast start, velvet landing)
  expo: "cubic-bezier(0.19, 1, 0.22, 1)", // big movements, page transitions
  inOut: "cubic-bezier(0.45, 0, 0.2, 1)", // loops, camera
  std: "cubic-bezier(0.4, 0, 0.2, 1)", // small hovers
} as const;

export type EaseName = keyof typeof EASE;
