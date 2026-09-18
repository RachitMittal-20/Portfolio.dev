"use client";

// Scroll character fill (docs/BUILD_PLAN.md section 1.5). Two identical
// text layers are stacked in the same grid cell: a dim base layer (every
// char at opacity 0.15) and a reveal layer on top whose chars go 0 → 1 one
// at a time, scrubbed by the element's scroll range — the "big text writes
// itself" effect. The wrapper carries the real aria-label; both duplicate
// visual layers are aria-hidden so screen readers hear the text once.
import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/motion/gsap";
import styles from "./ScrollFillText.module.css";

type ScrollFillTextTag = "h1" | "h2" | "h3";

interface ScrollFillTextProps {
  text: string;
  as?: ScrollFillTextTag;
  className?: string;
}

export default function ScrollFillText({ text, as = "h2", className }: ScrollFillTextProps) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const baseRef = useRef<HTMLSpanElement | null>(null);
  const revealRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const base = baseRef.current;
    const reveal = revealRef.current;
    if (!wrapper || !base || !reveal) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scrollTrigger: ScrollTrigger | null = null;
    let tween: gsap.core.Tween | null = null;

    const baseSplit = SplitText.create(base, {
      type: "lines,chars",
      aria: "none",
      autoSplit: true,
      onSplit(self) {
        gsap.set(self.chars, { opacity: reducedMotion ? 1 : 0.15 });
      },
    });

    const revealSplit = SplitText.create(reveal, {
      type: "lines,chars",
      aria: "none",
      autoSplit: true,
      onSplit(self) {
        scrollTrigger?.kill();
        tween?.kill();

        // Reduced motion: show fully filled, no scrub.
        gsap.set(self.chars, { opacity: reducedMotion ? 1 : 0 });
        if (reducedMotion) return;

        tween = gsap.to(self.chars, {
          opacity: 1,
          ease: "none",
          duration: 0.01,
          stagger: { each: 1 / Math.max(self.chars.length - 1, 1), from: "start" },
        });

        scrollTrigger = ScrollTrigger.create({
          trigger: wrapper,
          start: "top 80%",
          end: "bottom 30%",
          scrub: true,
          animation: tween,
        });
      },
    });

    return () => {
      scrollTrigger?.kill();
      tween?.kill();
      baseSplit.revert();
      revealSplit.revert();
    };
  }, [text]);

  return React.createElement(
    as,
    {
      ref: wrapperRef,
      className: `${styles.wrapper} ${className ?? ""}`.trim(),
      "aria-label": text,
    },
    React.createElement(
      "span",
      { ref: baseRef, className: styles.layer, "aria-hidden": true },
      text,
    ),
    React.createElement(
      "span",
      { ref: revealRef, className: `${styles.layer} ${styles.reveal}`, "aria-hidden": true },
      text,
    ),
  );
}
