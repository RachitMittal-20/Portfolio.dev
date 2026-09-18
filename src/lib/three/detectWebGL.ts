// Shared WebGL feature-detection probe. Anything that mounts an R3F
// <Canvas/> — the persistent SceneCanvas, the loader's own tiny gem
// canvas — should agree on whether WebGL is even available, via this one
// check, rather than each keeping its own copy.
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
