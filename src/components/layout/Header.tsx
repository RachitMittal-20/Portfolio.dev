"use client";

// Persistent site header (docs/BUILD_PLAN.md section 1.9): name, tagline,
// primary nav + menu button. Colour switches under a `data-theme="dark"`
// attribute a future scene-aware observer will set on <html> as the
// visitor scrolls past dark scenes (Phase 2+) — see Header.module.css.
import Link from "next/link";
import SoundButton from "@/components/ui/SoundButton";
import { useMenuStore } from "@/store/menu";
import styles from "./Header.module.css";

export default function Header() {
  const open = useMenuStore((s) => s.open);
  const toggle = useMenuStore((s) => s.toggle);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.name}>
        Rachit Mittal
      </Link>

      <p className={styles.tagline}>Full-stack developer, AI engineer</p>

      <nav className={styles.nav} aria-label="Primary">
        {/* "Work" will become an anchor scroll to the home Armoury section
            once it exists (Phase 4.4); it's a plain home link for now. */}
        <Link href="/" className={styles.link}>
          Work
        </Link>
        <Link href="/about" className={styles.link}>
          About
        </Link>
        <Link href="/playground" className={styles.link}>
          Playground
        </Link>
        <SoundButton />
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggle}
          aria-expanded={open}
          aria-controls="site-menu"
        >
          Menu
        </button>
      </nav>
    </header>
  );
}
