"use client";

// Simple site footer, closing out the Balcony section. "Back to top"
// reuses the shared Lenis-aware scroll helper from Phase 1.3 rather than a
// plain anchor jump.
import { useLenisScrollTo } from "@/lib/motion/useLenisScrollTo";
import styles from "./Footer.module.css";

export default function Footer() {
  const scrollTo = useLenisScrollTo();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <span>© {year} Rachit Mittal</span>
      <span className={styles.credit}>Built with Next.js, Three.js, GSAP</span>
      <button type="button" className={styles.backToTop} onClick={() => scrollTo(0)}>
        Back to top ↑
      </button>
    </footer>
  );
}
