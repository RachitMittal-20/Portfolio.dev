"use client";

import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/sections/ProjectCard";
import RevealLines from "@/components/motion/RevealLines";
import { projects } from "@/content/projects";
import { useSectionScene } from "@/lib/hooks/useSectionScene";
import styles from "./page.module.css";

const CONTACT_LINKS = [
  { label: "Email", href: "mailto:rachitmittalxc@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rachit-mittal-354767298/" },
  { label: "GitHub", href: "https://github.com/RachitMittal-20" },
];

// Home (docs/BUILD_PLAN.md section 1.9's site map): Altar hero → Throne
// Room → Armoury → Balcony. All four are built out for real
// (src/scenes/AltarScene.tsx, ThroneRoomScene.tsx, ArmouryScene.tsx,
// BalconyScene.tsx) and each claims its 3D scene as it scrolls into view
// via useSectionScene — at rest, without scroll-driven camera transitions
// between them yet (that's still a later prompt).
export default function Home() {
  const altarRef = useSectionScene<HTMLElement>("altar");
  const throneRoomRef = useSectionScene<HTMLElement>("throne-room");
  const armouryRef = useSectionScene<HTMLElement>("armoury");
  const balconyRef = useSectionScene<HTMLElement>("balcony");

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

      <section ref={balconyRef} id="balcony" className={styles.balcony}>
        <div className={styles.balconyContent}>
          <RevealLines as="h2" trigger="inview" className={styles.balconyTitle}>
            Let&rsquo;s build something worth forging.
          </RevealLines>
          <RevealLines as="p" trigger="inview" delay={0.1} className={styles.balconyNote}>
            Always up for a hard problem, an unusual stack, or both.
          </RevealLines>

          <ul className={styles.contactLinks}>
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className={styles.contactLink}
                  data-cursor="Click — say hello"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <Footer />
      </section>
    </main>
  );
}
