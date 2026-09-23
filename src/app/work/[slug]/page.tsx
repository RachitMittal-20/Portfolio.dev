import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";
import styles from "./page.module.css";

// A minimal case-study stub — the real, fully-designed /work/[slug] page
// (line reveals, a self-drawing architecture diagram) is a later phase.
// This exists now so The Armoury's project cards link somewhere real
// instead of 404ing.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project ? `${project.title} — The Forge` : "Not found — The Forge" };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link href="/#armoury" className={styles.back}>
        ← Back to The Armoury
      </Link>

      <h1 className={styles.title}>{project.title}</h1>
      <p className={styles.pitch}>{project.pitch}</p>

      <ul className={styles.tags}>
        {project.stack.map((tech) => (
          <li key={tech} className={styles.tag}>
            {tech}
          </li>
        ))}
      </ul>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The challenge</h2>
        <p>{project.challenge}</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The build</h2>
        <p>{project.build}</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The result</h2>
        <p>{project.result}</p>
      </section>

      <div className={styles.links}>
        {project.comingSoon ? (
          <span className={styles.comingSoon}>Details coming soon</span>
        ) : (
          <>
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noreferrer" className={styles.link}>
                Live demo →
              </a>
            )}
            {project.links.repo && (
              <a href={project.links.repo} target="_blank" rel="noreferrer" className={styles.link}>
                GitHub →
              </a>
            )}
          </>
        )}
      </div>
    </main>
  );
}
