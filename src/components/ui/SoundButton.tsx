"use client";

// Sound toggle: 4 equalizer bars that bounce while audio is on, go flat
// (scaleY 0.1) when muted. Also owns the "click anywhere to enable audio"
// gate required by autoplay policies — before that first click, the body
// carries `awaiting-sound-click` and a floating pill nags for it.
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE } from "@/lib/motion/easings";
import { sound } from "@/lib/audio/sound";
import { useSoundStore } from "@/store/sound";
import styles from "./SoundButton.module.css";

const BAR_COUNT = 4;

export default function SoundButton() {
  const enabled = useSoundStore((s) => s.enabled);
  const muted = useSoundStore((s) => s.muted);
  const setEnabled = useSoundStore((s) => s.setEnabled);
  const toggleMuted = useSoundStore((s) => s.toggleMuted);
  const barsRef = useRef<HTMLSpanElement>(null);

  // First click anywhere unlocks the audio context.
  useEffect(() => {
    if (enabled) return;

    document.body.classList.add("awaiting-sound-click");

    function handleFirstClick() {
      sound.unlock();
      setEnabled(true);
    }

    document.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      document.body.classList.remove("awaiting-sound-click");
      document.removeEventListener("click", handleFirstClick);
    };
  }, [enabled, setEnabled]);

  // Bar animation: random-height bounce, staggered, looping while "playing"
  // (audio enabled and not muted); flat otherwise.
  useEffect(() => {
    const bars = barsRef.current ? Array.from(barsRef.current.children) : [];
    if (bars.length === 0) return;

    if (!enabled || muted) {
      gsap.to(bars, { scaleY: 0.1, duration: 0.3, ease: EASE.std, overwrite: true });
      return;
    }

    const tweens = bars.map((bar, i) =>
      gsap.to(bar, {
        scaleY: () => gsap.utils.random(0.25, 1),
        duration: () => gsap.utils.random(0.35, 0.6),
        repeat: -1,
        yoyo: true,
        ease: EASE.inOut,
        delay: i * 0.08,
      }),
    );

    return () => tweens.forEach((tween) => tween.kill());
  }, [enabled, muted]);

  function handleToggle() {
    const next = !muted;
    toggleMuted();
    sound.setMuted(next);
  }

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={handleToggle}
        aria-pressed={muted}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
      >
        <span ref={barsRef} className={styles.bars}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <span key={i} className={styles.bar} />
          ))}
        </span>
      </button>

      {!enabled && (
        <div className={styles.awaitingPill} aria-hidden="true">
          CLICK — TO ENABLE SOUND
        </div>
      )}
    </>
  );
}
