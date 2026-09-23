"use client";

import ProjectCard from "@/components/sections/ProjectCard";
import RevealLines from "@/components/motion/RevealLines";
import { projects } from "@/content/projects";
import { useSectionScene } from "@/lib/hooks/useSectionScene";
import styles from "./page.module.css";

// Home (docs/BUILD_PLAN.md section 1.9's site map): Altar hero → Throne
// Room → Armoury → Balcony. Altar, Throne Room and Armoury are built out
// for real (src/scenes/AltarScene.tsx, ThroneRoomScene.tsx,
// ArmouryScene.tsx) and claim their 3D scene as they scroll into view via
// useSectionScene. Balcony is still a deliberately simple content-only
// placeholder — just enough structure and an `id` for a later phase.
export default function Home() {
  const altarRef = useSectionScene<HTMLElement>("altar");
  const throneRoomRef = useSectionScene<HTMLElement>("throne-room");
  const armouryRef = useSectionScene<HTMLElement>("armoury");

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

      <section ref={armouryRef} id="armoury" className={styles.armoury}>
        <RevealLines as="h2" trigger="inview" className={styles.armouryTitle}>
          The Armoury
        </RevealLines>
        <p className={styles.armouryNote}>Four runes forged so far.</p>

        <div className={styles.cardGrid}>
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
          ))}
        </div>
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
