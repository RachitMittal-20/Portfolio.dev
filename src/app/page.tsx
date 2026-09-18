import styles from "./page.module.css";

// TEMPORARY scroll-feel test for the Lenis + GSAP ScrollTrigger foundation
// (docs/BUILD_PLAN.md section 1.5, prompt 1.3). Replaced scene-by-scene
// starting with Phase 3 (loader) and Phase 4 (Home scenes).
const SECTIONS = [1, 2, 3, 4, 5];

export default function Home() {
  return (
    <main>
      {SECTIONS.map((n) => (
        <section key={n} className={styles.screen}>
          <span className={styles.number}>{n}</span>
        </section>
      ))}
    </main>
  );
}
