const getAttacksCriticalHit = (critical_hit: string, crit_range: string) => {
  const globalCriticalHit = critical_hit.includes(">")
    ? parseInt(critical_hit.split(">")[1])
    : parseInt(critical_hit);

  const attackCriticalHit = parseInt(crit_range);

  if (globalCriticalHit === 0 || globalCriticalHit === 16) {
    return "@{critical_hit}";
  }

  const sum = Math.max(16, globalCriticalHit - attackCriticalHit);
  return `>${sum}`;
};
