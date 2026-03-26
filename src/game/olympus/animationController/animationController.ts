export type OlympusAnimationPreset = "lightning_strike" | "symbol_explosion" | "energy_burst" | "big_win";

export const olympusAnimationDurations: Record<OlympusAnimationPreset, number> = {
  lightning_strike: 220,
  symbol_explosion: 180,
  energy_burst: 260,
  big_win: 800,
};
