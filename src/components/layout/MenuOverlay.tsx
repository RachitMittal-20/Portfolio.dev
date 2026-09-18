"use client";

// Full-screen menu (docs/BUILD_PLAN.md section 1.9): opened by the header's
// menu button, links revealed with <RevealLines/>, closes on Esc, traps
// focus, and pauses the shared Lenis instance so the page behind it can't
// scroll while it's open.
import { useEffect, useRef } from "react";
import Link from "next/link";
import RevealLines from "@/components/motion/RevealLines";
import { useMenuStore } from "@/store/menu";
import { useScrollStore } from "@/store/scroll";
import styles from "./MenuOverlay.module.css";

const LINKS = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/playground", label: "Playground" },
];

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MenuOverlay() {
  const open = useMenuStore((s) => s.open);
  const close = useMenuStore((s) => s.close);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const overlay = overlayRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const lenis = useScrollStore.getState().lenis;

    lenis?.stop();
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      overlay ? Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    getFocusable()[0]?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
      lenis?.start();
      previouslyFocused?.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={styles.overlay}
    >
      <button type="button" className={styles.close} onClick={close}>
        Close
      </button>

      <nav className={styles.nav} aria-label="Menu">
        {LINKS.map((link, i) => (
          <Link key={link.href} href={link.href} className={styles.link} onClick={close}>
            <RevealLines as="p" trigger="mount" delay={i * 0.08}>
              {link.label}
            </RevealLines>
          </Link>
        ))}
      </nav>
    </div>
  );
}
