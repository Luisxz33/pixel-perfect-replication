import type { OlympusConfig, OlympusGrid, OlympusMode, OlympusSpinResult } from "@/game/olympus/types";
import { createOlympusRng, type OlympusRng } from "@/game/olympus/rngSystem/rng";
import { initialBonusState, type OlympusBonusState } from "@/game/olympus/bonusMode/bonus";
import { cloneOlympusGrid, generateOlympusGrid, removePositions, tumbleFill } from "@/game/olympus/gridController/grid";
import { calculateOlympusClusterWins } from "@/game/olympus/winCalculator/clusterWins";
import { getCascadeGlobalMultiplier, sumOrbMultipliers } from "@/game/olympus/multiplierEngine/multiplier";
import { isScatter, parseOrbMultiplier } from "@/game/olympus/symbolManager/symbols";

function countScatters(grid: OlympusGrid) {
  let count = 0;
  for (const row of grid) for (const cell of row) if (cell && isScatter(cell.id)) count++;
  return count;
}

function collectOrbMultipliers(grid: OlympusGrid) {
  const values: number[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (!cell) continue;
      const mult = parseOrbMultiplier(cell.id);
      if (mult) values.push(mult);
    }
  }
  return values;
}

export class OlympusThunderEngine {
  private rng: OlympusRng;
  private bonus: OlympusBonusState;

  constructor(private config: OlympusConfig, seed: number = Date.now()) {
    this.rng = createOlympusRng(seed);
    this.bonus = initialBonusState();
  }

  getBonusState() {
    return { ...this.bonus };
  }

  buyWrathOfOlympus() {
    this.bonus.mode = "wrath_of_olympus";
    this.bonus.freeSpinsLeft = this.config.wrathOfOlympus.freeSpins;
  }

  private shouldTriggerDivineStorm(mode: OlympusMode) {
    if (mode !== "base") return false;
    return this.rng.next() < this.config.divineStorm.triggerChancePerSpin;
  }

  spin(bet: number): OlympusSpinResult {
    const baseMode = this.bonus.mode;
    const triggeredDivineStorm = this.shouldTriggerDivineStorm(baseMode);

    const mode: OlympusMode = triggeredDivineStorm ? "divine_storm" : baseMode;
    const gridSize = mode === "divine_storm" ? this.config.gridDivine : this.config.gridBase;

    let grid = generateOlympusGrid(this.rng, gridSize.rows, gridSize.cols, mode);
    const startingGrid = cloneOlympusGrid(grid);

    const scattersOnStart = countScatters(startingGrid);
    const triggeredWrath =
      baseMode === "base" && !triggeredDivineStorm && scattersOnStart >= this.config.scatterTriggerCount;

    if (triggeredWrath) {
      this.bonus.mode = "wrath_of_olympus";
      this.bonus.freeSpinsLeft = this.config.wrathOfOlympus.freeSpins;
    }

    const cascades: OlympusSpinResult["cascades"] = [];
    let totalWin = 0;
    let cascadeIndex = 0;

    while (cascadeIndex < 60) {
      const wins = calculateOlympusClusterWins(grid, this.config, bet);
      if (wins.length === 0) break;

      const globalMultiplier = getCascadeGlobalMultiplier(this.config.globalMultiplierProgression, cascadeIndex);
      const orbMultipliers = collectOrbMultipliers(grid);
      const orbMultiplier = sumOrbMultipliers(orbMultipliers);

      const toRemove = new Map<string, { r: number; c: number }>();
      for (const win of wins) {
        for (const pos of win.positions) {
          toRemove.set(`${pos.r}:${pos.c}`, pos);
        }
      }

      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < (grid[0]?.length ?? 0); c++) {
          const cell = grid[r]?.[c];
          if (!cell) continue;
          if (isScatter(cell.id) || cell.id.startsWith("orb_")) {
            toRemove.set(`${r}:${c}`, { r, c });
          }
        }
      }

      removePositions(grid, [...toRemove.values()]);
      tumbleFill(this.rng, grid, mode);

      const baseWin = wins.reduce((sum, win) => sum + win.basePayout, 0);
      const winThisCascade = baseWin * globalMultiplier * orbMultiplier;
      totalWin += winThisCascade;

      cascades.push({
        index: cascadeIndex,
        globalMultiplier,
        wins,
        orbMultipliers,
        winThisCascade,
        gridAfter: cloneOlympusGrid(grid),
      });

      cascadeIndex++;
    }

    if (this.bonus.mode === "wrath_of_olympus") {
      this.bonus.freeSpinsLeft = Math.max(0, this.bonus.freeSpinsLeft - 1);
      if (this.bonus.freeSpinsLeft === 0) {
        this.bonus.mode = "base";
      }
    }

    return {
      bet,
      mode,
      gridSize,
      startingGrid,
      cascades,
      totalWin,
      scattersOnStart,
      triggeredWrath,
      triggeredDivineStorm,
    };
  }
}
