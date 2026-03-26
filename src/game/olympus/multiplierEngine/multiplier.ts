export function getCascadeGlobalMultiplier(progression: number[], cascadeIndex: number) {
  const idx = Math.max(0, Math.min(progression.length - 1, cascadeIndex));
  return progression[idx] ?? 1;
}

export function sumOrbMultipliers(orbs: number[]) {
  if (orbs.length === 0) return 1;
  return orbs.reduce((sum, value) => sum + value, 0);
}
