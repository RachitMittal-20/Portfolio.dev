"use client";

// Fixed cursor-follow label (docs/BUILD_PLAN.md section 1.5). Any element
// on the site can opt in with `data-cursor="Click — feed the dragon"` — the
// attribute's value is the label shown, split on the em dash into a bold
// action word + a lighter detail. Hidden entirely on touch devices, since
// there's no hovering cursor to follow there.
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/easings";
import styles from "./CursorPill.module.css";

export default function CursorPill() {
  const pillRef = useRef<HTMLDivElement>(null);
  const currentTargetRef = useRef<Element | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);
    if (touch) return;

    const pill = pillRef.current;
    if (!pill) return;

    const moveX = gsap.quickTo(pill, "x", { duration: 0.35, ease: EASE.main });
    const moveY = gsap.quickTo(pill, "y", { duration: 0.35, ease: EASE.main });

    function handlePointerMove(event: PointerEvent) {
      // Small offset so the pill trails just past the pointer tip instead
      // of sitting directly under it.
      moveX(event.clientX + 16);
      moveY(event.clientY + 16);

      const target =
        (event.target as Element | null)?.closest<HTMLElement>("[data-cursor]") ?? null;
      if (target !== currentTargetRef.current) {
        currentTargetRef.current = target;
        setLabel(target?.getAttribute("data-cursor") ?? null);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    gsap.to(pill, { scale: label ? 1 : 0, duration: 0.35, ease: EASE.main });
  }, [label]);

  if (isTouch) return null;

  const [actionPart, ...detailParts] = label ? label.split("—") : [""];
  const action = actionPart.trim();
  const detail = detailParts.join("—").trim();

  return (
    <div ref={pillRef} className={styles.pill} aria-hidden="true">
      {label && (
        <>
          <span className={styles.action}>{action}</span>
          {detail && (
            <>
              <span className={styles.dash}>—</span>
              <span>{detail}</span>
            </>
          )}
        </>
      )}
    </div>
  );
}
