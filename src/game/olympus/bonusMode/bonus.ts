import type { OlympusMode } from "@/game/olympus/types";

export type OlympusBonusState = {
  mode: OlympusMode;
  freeSpinsLeft: number;
};

export function initialBonusState(): OlympusBonusState {
  return {
    mode: "base",
    freeSpinsLeft: 0,
  };
}
