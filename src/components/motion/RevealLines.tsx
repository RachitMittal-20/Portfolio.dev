"use client";

// Line-mask reveal (docs/BUILD_PLAN.md section 1.5). Splits the element's
// text into lines, each wrapped in an `overflow: clip` mask by SplitText's
// `mask: "lines"` option; the inner line slides up from behind that mask
// (yPercent 110 → 0). SplitText's default `aria: "auto"` already gives the
// original element an aria-label with the full text and marks every
// generated line aria-hidden — exactly the accessible fallback this needs.
import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/easings";

type RevealLinesTag = "p" | "h1" | "h2" | "h3";

interface RevealLinesProps {
  children: string;
  as?: RevealLinesTag;
  delay?: number;
  trigger?: "inview" | "mount";
  className?: string;
}

export default function RevealLines({
  children,
  as = "p",
  delay = 0,
  trigger = "inview",
  className,
}: RevealLinesProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tracks whether the entrance has already been kicked off, so a
    // resize-triggered re-split (autoSplit) never replays it — the fresh
    // lines just jump straight to their revealed state.
    let revealed = false;
    let scrollTrigger: ScrollTrigger | null = null;

    function revealLines(lines: Element[]) {
      revealed = true;
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.2,
        ease: EASE.main,
        stagger: 0.08,
        delay,
        overwrite: true,
      });
    }

    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        scrollTrigger?.kill();
        scrollTrigger = null;

        if (reducedMotion) {
          gsap.set(self.lines, { yPercent: 0 });
          revealed = true;
          return;
        }

        if (revealed) {
          gsap.set(self.lines, { yPercent: 0 });
          return;
        }

        gsap.set(self.lines, { yPercent: 110 });

        if (trigger === "mount") {
          revealLines(self.lines);
        } else {
          scrollTrigger = ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => revealLines(self.lines),
          });
        }
      },
    });

    return () => {
      scrollTrigger?.kill();
      split.revert();
    };
  }, [children, as, trigger, delay]);

  return React.createElement(as, { ref: elRef, className }, children);
}
