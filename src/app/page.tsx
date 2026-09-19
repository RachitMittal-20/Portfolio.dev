"use client";

import RevealLines from "@/components/motion/RevealLines";
import { useSectionScene } from "@/lib/hooks/useSectionScene";
import styles from "./page.module.css";

// Home (docs/BUILD_PLAN.md section 1.9's site map): Altar hero → Throne
// Room → Armoury → Balcony. Altar and Throne Room are built out for real
// (src/scenes/AltarScene.tsx, ThroneRoomScene.tsx) and claim their 3D
// scene as they scroll into view via useSectionScene — the first real
// scroll-driven scene switch. Armoury/Balcony are still deliberately
// simple content-only placeholders — just enough structure and `id`s for
// later phases.
export default function Home() {
  const altarRef = useSectionScene<HTMLElement>("altar");
  const throneRoomRef = useSectionScene<HTMLElement>("throne-room");

  return (
    <main>
      <section
        ref={altarRef}
        id="altar"
        className={styles.hero}
        data-cursor="Click — enter the forge"
      >
        <div className={styles.heroText}>
          <RevealLines as="h1" trigger="mount" className={styles.heroName}>
            Rachit Mittal
          </RevealLines>
          <RevealLines as="p" trigger="mount" delay={0.12} className={styles.heroRole}>
            Full-stack developer, forging systems with AI.
          </RevealLines>
        </div>
      </section>

      <section ref={throneRoomRef} id="throne-room" className={styles.statement}>
        <RevealLines as="h2" trigger="inview" className={styles.statementText}>
          Building systems that think and scale.
        </RevealLines>
      </section>

      <section id="armoury" className={`${styles.placeholder} ${styles.tinted}`}>
        <RevealLines as="h2" trigger="inview" className={styles.placeholderTitle}>
          The Armoury
        </RevealLines>
        <p className={styles.placeholderNote}>
          Projects, forged one rune at a time — built in a later phase.
        </p>
      </section>

      <section id="balcony" className={styles.placeholder}>
        <RevealLines as="h2" trigger="inview" className={styles.placeholderTitle}>
          The Balcony
        </RevealLines>
        <p className={styles.placeholderNote}>Contact, at sunset — built in a later phase.</p>
      </section>
    </main>
  );
}
