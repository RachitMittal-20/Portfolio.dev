import { notFound } from "next/navigation";
import styles from "./styleguide.module.css";

// Dev-only living style guide: colour palette, fluid type scale and the
// four motion easings as animated demo boxes. Not reachable in production.
// See docs/BUILD_PLAN.md section 1.3-1.5 for the source values.
export const metadata = {
  title: "Styleguide — The Forge",
};

const PALETTE: { token: string; label: string }[] = [
  { token: "--stone-50", label: "stone-50 · ivory" },
  { token: "--stone-200", label: "stone-200 · sandstone" },
  { token: "--stone-400", label: "stone-400 · warm stone shadow" },
  { token: "--ink-900", label: "ink-900 · text, dark UI" },
  { token: "--sky-200", label: "sky-200 · sky" },
  { token: "--sky-400", label: "sky-400 · deep sky" },
  { token: "--moss-500", label: "moss-500 · mountains / forest" },
  { token: "--ember-500", label: "ember-500 · PRIMARY ACCENT" },
  { token: "--ember-300", label: "ember-300 · ember glow" },
  { token: "--arcane-400", label: "arcane-400 · secondary accent" },
  { token: "--night-900", label: "night-900 · loader / playground dark" },
  { token: "--gold-400", label: "gold-400 · treasure, stamps" },
];

const TYPE_SCALE: { token: string; label: string }[] = [
  { token: "--text-xs", label: "xs" },
  { token: "--text-sm", label: "sm" },
  { token: "--text-base", label: "base" },
  { token: "--text-lg", label: "lg" },
  { token: "--text-xl", label: "xl" },
  { token: "--text-2xl", label: "2xl" },
  { token: "--text-3xl", label: "3xl" },
  { token: "--text-display-sm", label: "display-sm" },
  { token: "--text-display-md", label: "display-md" },
  { token: "--text-display-lg", label: "display-lg" },
  { token: "--text-display-xl", label: "display-xl" },
];

const EASINGS: { token: string; label: string }[] = [
  { token: "--ease-main", label: "main" },
  { token: "--ease-expo", label: "expo" },
  { token: "--ease-in-out", label: "in-out" },
  { token: "--ease-std", label: "std" },
];

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>The Forge — Styleguide</h1>
      <p className={styles.note}>Dev-only. Not reachable in production.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Palette</h2>
        <div className={styles.swatchGrid}>
          {PALETTE.map((color) => (
            <div key={color.token} className={styles.swatchCard}>
              <div className={styles.swatch} style={{ backgroundColor: `var(${color.token})` }} />
              <code className={styles.swatchLabel}>{color.label}</code>
              <code className={styles.swatchToken}>{color.token}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Fluid type scale</h2>
        <div className={styles.typeList}>
          {TYPE_SCALE.map((size) => (
            <div key={size.token} className={styles.typeRow}>
              <code className={styles.typeLabel}>{size.label}</code>
              <p className={styles.typeSample} style={{ fontSize: `var(${size.token})` }}>
                The Forge
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Easings</h2>
        <div className={styles.easingGrid}>
          {EASINGS.map((ease) => (
            <div key={ease.token} className={styles.easingCard}>
              <div className={styles.easingTrack}>
                <div
                  className={styles.easingBox}
                  style={{ animationTimingFunction: `var(${ease.token})` }}
                />
              </div>
              <code className={styles.swatchLabel}>{ease.label}</code>
              <code className={styles.swatchToken}>{ease.token}</code>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
