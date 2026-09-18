"use client";

// Mounts once in the root layout. Creates the single Lenis instance for the
// whole app, drives it from gsap.ticker instead of its own rAF loop (so it
// stays perfectly in step with every GSAP tween/ScrollTrigger), and mirrors
// scroll progress + velocity into the zustand store so any component (camera
// rigs, HUD, scroll-fill text) can read scroll state without its own
// listener. Renders nothing — it's pure side effect.
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useScrollStore } from "@/store/scroll";

export default function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    function start() {
      // Reduced motion: leave native scroll in charge entirely. No Lenis
      // instance, no ticker hook — just the browser's own scroll.
      if (media.matches) return;

      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
      });
      useScrollStore.getState().setLenis(lenis);

      lenis.on("scroll", (instance) => {
        useScrollStore.getState().setScroll(instance.progress, instance.velocity);
        ScrollTrigger.update();
      });

      // gsap.ticker gives seconds; Lenis.raf wants milliseconds.
      tick = (time) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    function stop() {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      tick = null;
      useScrollStore.getState().setLenis(null);
      useScrollStore.getState().setScroll(0, 0);
    }

    start();

    // Follow live changes to the OS-level reduced-motion setting.
    const handleChange = () => {
      stop();
      start();
    };
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
      stop();
    };
  }, []);

  return null;
}
