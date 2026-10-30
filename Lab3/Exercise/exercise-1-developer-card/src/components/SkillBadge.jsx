export default function SkillBadge({ name, tier }) {
  return (
    <li>
      <strong>{name}</strong>
      <span> ({tier})</span>
    </li>
  );
}
