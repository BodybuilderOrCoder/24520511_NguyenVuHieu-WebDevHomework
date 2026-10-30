
import { Fragment } from "react";
import SkillBadge from "./SkillBadge";
import styles from "./DeveloperCard.module.css";

export default function DeveloperCard({
  fullName = "Nguyen Vu Hieu",
  role = "Full-Stack Developer | Data Engineering Enthusiast",
  avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240",
  metrics = {
    commits: 512,
    projects: 3,
    accessibilityScore: 100,
  },
  skills = [
    { id: "python", name: "Python", tier: "Intermediate" },
    { id: "react", name: "React", tier: "Learning" },
    { id: "sql", name: "SQL", tier: "Intermediate" },
  ],
}) {
  return (
    <article className={styles.card} aria-labelledby="dev-heading">
      <header className={styles.header}>
        <img
          src={avatarUrl}
          alt={fullName}
          width="64"
          height="64"
        />

        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul className={styles.skills} aria-label="Engineered Skills">
        {skills.map((skill) => (
          <SkillBadge
            key={skill.id}
            name={skill.name}
            tier={skill.tier}
          />
        ))}
      </ul>
    </article>
  );
}
