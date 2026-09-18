"use client";

// The first-visit loading sequence (docs/BUILD_PLAN.md sections 1.5/1.9,
// adapted — see the review message for how this differs from the original
// Phase 3.1 sketch): blank ink-900 → name/tagline reveal in → a small
// spinning gem (reusing the Phase 2 gem material, not a new mesh) with a
// status line and simulated minimum-duration progress → a two-layer
// "unmask" exit (outer and inner scale in opposite directions, at the same
// time, eased with EASE.expo) that hands off to the real homepage.
//
// Only plays once per browser tab session (sessionStorage) — a hard
// refresh within the same tab replays it; a client-side <Link> navigation
// never even gets the chance to, since this component lives in the root
// layout and App Router doesn't remount layouts between routes.
import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import RevealLines from "@/components/motion/RevealLines";
import { GemPlaceholder } from "@/lib/three/ModelSlot";
import { detectWebGL } from "@/lib/three/detectWebGL";
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/easings";
import { useLoaderStore } from "@/store/loader";
import styles from "./Loader.module.css";

const SESSION_KEY = "forge:loader-played";
// Within the 1.8–2.2s target range (docs/BUILD_PLAN.md's "small details
// that make it smooth") — never an instant flash, even on a fast load.
const MIN_DURATION_SECONDS = 2;

function readPlayedFlag(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Privacy mode / storage disabled: treat every load as first-play
    // rather than crash — worst case the loader plays every time.
    return false;
  }
}

function writePlayedFlag() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Same as above — not worth failing loudly over.
  }
}

function GemSpin({ spin }: { spin: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_state, delta) => {
    if (spin && ref.current) {
      ref.current.rotation.y += delta * 0.6;
    }
  });
  return (
    <group ref={ref} scale={1.4}>
      <GemPlaceholder />
    </group>
  );
}

export default function Loader() {
  const isLoading = useLoaderStore((s) => s.isLoading);
  const progress = useLoaderStore((s) => s.progress);
  const setProgress = useLoaderStore((s) => s.setProgress);
  const setHasPlayedOnce = useLoaderStore((s) => s.setHasPlayedOnce);
  const finish = useLoaderStore((s) => s.finish);

  const [canRenderGem, setCanRenderGem] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect (not useEffect): the sessionStorage check has to
  // resolve — and, if skipping, call finish() — before the browser paints
  // the first frame, or a returning visitor would see one flash frame of
  // the full loader before it vanished.
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    setCanRenderGem(detectWebGL());

    if (readPlayedFlag()) {
      setHasPlayedOnce(true);
      finish();
      return;
    }

    writePlayedFlag();
    setHasPlayedOnce(true);

    function runExit() {
      const exitDuration = reduced ? 0.3 : 0.8;
      gsap
        .timeline({ onComplete: finish })
        .to(
          outerRef.current,
          {
            scale: reduced ? 1 : 1.08,
            opacity: 0,
            duration: exitDuration,
            ease: EASE.expo,
          },
          0,
        )
        .to(
          innerRef.current,
          {
            scale: reduced ? 1 : 0.85,
            opacity: 0,
            duration: exitDuration,
            ease: EASE.expo,
          },
          0,
        );
    }

    const tween = gsap.to(
      {},
      {
        duration: reduced ? 0.5 : MIN_DURATION_SECONDS,
        ease: reduced ? "none" : EASE.inOut,
        onUpdate() {
          setProgress(this.progress());
        },
        onComplete: runExit,
      },
    );

    return () => {
      tween.kill();
    };
    // Intentionally run once on mount — the store setters are stable
    // zustand actions and re-running this on their identity would replay
    // the whole sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoading) return null;

  return (
    <div ref={outerRef} className={styles.overlay} role="status" aria-live="polite">
      <div ref={innerRef} className={styles.inner}>
        {canRenderGem && (
          <div className={styles.gemCanvas}>
            <Canvas dpr={[1, 2]} frameloop={reducedMotion ? "demand" : "always"}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[2, 3, 4]} intensity={1.1} />
              <GemSpin spin={!reducedMotion} />
            </Canvas>
          </div>
        )}

        <RevealLines as="h1" trigger="mount" className={styles.name}>
          Rachit Mittal
        </RevealLines>
        <RevealLines as="p" trigger="mount" delay={0.15} className={styles.tagline}>
          Full-stack developer, AI engineer
        </RevealLines>

        <div className={styles.status}>
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.statusText}>Forging the world…</span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}
