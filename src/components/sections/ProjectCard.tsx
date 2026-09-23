"use client";

// A project card for The Armoury (docs/BUILD_PLAN.md sections 1.5/1.8/1.9).
// The "rune-forging" hover detail is a glowing gradient outline in the
// project's own accent colour — a CSS-only choice (see review message for
// why over a literal SVG rune or 3D effect): it reads instantly as "this
// rune has been forged/lit," costs nothing on scroll, and needs no extra
// asset per project.
import type { CSSProperties } from "react";
import Link from "next/link";
import RevealLines from "@/components/motion/RevealLines";
import type { Project } from "@/content/projects";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

export default function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const accentStyle = { "--card-accent": project.accent } as CSSProperties;

  return (
    <Link
      href={`/work/${project.slug}`}
      className={styles.card}
      style={accentStyle}
      data-cursor="Click — open the case study"
    >
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        {project.featured && <span className={styles.badge}>Featured</span>}

        <RevealLines as="h3" trigger="inview" delay={delay} className={styles.title}>
          {project.title}
        </RevealLines>

        <p className={styles.pitch}>{project.pitch}</p>

        <ul className={styles.tags}>
          {project.stack.slice(0, 5).map((tech) => (
            <li key={tech} className={styles.tag}>
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
