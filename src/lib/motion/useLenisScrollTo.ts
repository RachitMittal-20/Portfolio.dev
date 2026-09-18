"use client";

// Anchor/menu navigation helper. Routes through the shared Lenis instance
// when it exists (smooth scroll everywhere), and falls back to native
// smooth scrolling when Lenis is disabled under prefers-reduced-motion.
import { useCallback } from "react";
import type { ScrollToOptions } from "lenis";
import { useScrollStore } from "@/store/scroll";

type ScrollTarget = string | HTMLElement | number;

export function useLenisScrollTo() {
  return useCallback((target: ScrollTarget, options?: ScrollToOptions) => {
    const lenis = useScrollStore.getState().lenis;

    if (lenis) {
      lenis.scrollTo(target, options);
      return;
    }

    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }

    const element = typeof target === "string" ? document.querySelector(target) : target;
    element?.scrollIntoView({ behavior: "smooth" });
  }, []);
}
