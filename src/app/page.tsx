import SetActiveScene from "@/components/canvas/SetActiveScene";
import RevealLines from "@/components/motion/RevealLines";
import styles from "./page.module.css";

// Home (docs/BUILD_PLAN.md section 1.9's site map): Altar hero → Throne
// Room → Armoury → Balcony. Only the Altar is built out for real this
// prompt (src/scenes/AltarScene.tsx); the other three are deliberately
// simple content-only placeholders — just enough structure and `id`s for
// scroll-driven camera work (a later prompt) to hook into.
export default function Home() {
  return (
    <main>
      <SetActiveScene id="altar" />

      <section id="altar" className={styles.hero} data-cursor="Click — enter the forge">
        <div className={styles.heroText}>
          <RevealLines as="h1" trigger="mount" className={styles.heroName}>
            Rachit Mittal
          </RevealLines>
          <RevealLines as="p" trigger="mount" delay={0.12} className={styles.heroRole}>
            Full-stack developer, forging systems with AI.
          </RevealLines>
        </div>
      </section>

      <section id="throne-room" className={`${styles.placeholder} ${styles.dark}`}>
        <RevealLines as="h2" trigger="inview" className={styles.placeholderTitle}>
          The Throne Room
        </RevealLines>
        <p className={styles.placeholderNote}>A statement scene — built in a later phase.</p>
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
