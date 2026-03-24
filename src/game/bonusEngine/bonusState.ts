import type { GameMode } from "@/game/types";

export type BonusState = {
  mode: GameMode;
  sugarStormSpinsLeft: number;
  // Total portals landed across the current spin (used for trigger messaging only).
  portalsLandedLastSpin: number;
};

export function createInitialBonusState(): BonusState {
  return {
    mode: "base",
    sugarStormSpinsLeft: 0,
    portalsLandedLastSpin: 0,
  };
}
