// Single place that registers GSAP plugins and sets project-wide defaults.
// Importing this module anywhere guarantees ScrollTrigger + SplitText are
// registered exactly once (ES modules only evaluate once per process) and
// that every tween falls back to the studied motion language (section 1.5)
// unless a component overrides it.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { EASE } from "./easings";

// ScrollTrigger/SplitText touch the DOM on registration; guard for SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: EASE.main, duration: 1.2 });
}

export { gsap, ScrollTrigger, SplitText };
