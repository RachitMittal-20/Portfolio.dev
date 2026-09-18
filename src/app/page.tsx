import FadeIn from "@/components/motion/FadeIn";
import RevealLines from "@/components/motion/RevealLines";
import ScrollFillText from "@/components/motion/ScrollFillText";
import styles from "./page.module.css";

// TEMPORARY scroll-feel test + component demo for RevealLines,
// ScrollFillText and FadeIn (docs/BUILD_PLAN.md section 1.5, prompt 1.4).
// Replaced scene-by-scene starting with Phase 3 (loader) and Phase 4 (Home
// scenes).
export default function Home() {
  return (
    <main>
      <section className={styles.screen}>
        <span className={styles.number}>1</span>
        <div className={styles.demoStack}>
          <RevealLines as="h1" trigger="mount">
            Forged in code. Tempered by AI.
          </RevealLines>
          <FadeIn delay={0.6} className={styles.fadeDemo}>
            <p>This fades in 24px below, right after the line above lands.</p>
          </FadeIn>
        </div>
      </section>

      <section className={styles.screen}>
        <span className={styles.number}>2</span>
        <div className={styles.demoStack}>
          <RevealLines as="h2" trigger="inview">
            This line reveals from behind its mask as it scrolls into view.
          </RevealLines>
        </div>
      </section>

      <section className={styles.screen}>
        <span className={styles.number}>3</span>
        <ScrollFillText text="THE FORGE IS ALIVE" as="h2" />
      </section>

      <section className={styles.screen}>
        <span className={styles.number}>4</span>
      </section>

      <section className={styles.screen}>
        <span className={styles.number}>5</span>
      </section>
    </main>
  );
}
