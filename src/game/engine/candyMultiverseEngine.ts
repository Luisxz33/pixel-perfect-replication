import type {
  BombMultiplier,
  CascadeStep,
  GameConfig,
  GameMode,
  Grid,
  PortalEffect,
  SpinResult,
} from "@/game/types";
import { createRng, type Rng } from "@/game/rng/mulberry32";
import { calculateClusterWins } from "@/game/winCalculator/clusters";
import { cascadeFill, cloneGrid, generateGrid, removePositions, spawnCell } from "@/game/gridSystem/grid";
import { isPortal, parseBombMultiplier } from "@/game/gridSystem/symbols";
import { createInitialBonusState, type BonusState } from "@/game/bonusEngine/bonusState";
import { EventBus, type EngineEventMap } from "@/game/engine/events";

function countPortals(grid: Grid) {
  let portals = 0;
  for (const row of grid) for (const cell of row) if (cell && isPortal(cell.id)) portals++;
  return portals;
}

function collectBombs(grid: Grid): BombMultiplier[] {
  const bombs: BombMultiplier[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (!cell) continue;
      const b = parseBombMultiplier(cell.id);
      if (b) bombs.push(b);
    }
  }
  return bombs;
}

function sumBombs(bombs: BombMultiplier[]) {
  return bombs.reduce((s, b) => s + b, 0);
}

function pickPortalEffect(rng: Rng, chainIndex: number, maxChainIndex: number): PortalEffect {
  return rng.pickWeighted<PortalEffect>([
    { item: { type: "extra_cascade" }, weight: 2.2 },
    { item: { type: "symbol_explosion", radius: 1 }, weight: 2 },
    { item: { type: "symbol_explosion", radius: 2 }, weight: 1.2 },
    { item: { type: "board_expansion", addRows: 1, addCols: 1 }, weight: 0.9 },
    { item: { type: "board_expansion", addRows: 2, addCols: 1 }, weight: 0.4 },
    { item: { type: "instant_multiplier", toMultiplierIndex: Math.min(maxChainIndex, chainIndex + 2) }, weight: 1.3 },
  ]);
}

function explodeRandomArea(rng: Rng, grid: Grid, radius: 1 | 2): Array<{ r: number; c: number }> {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const center = { r: rng.int(rows), c: rng.int(cols) };
  const positions: Array<{ r: number; c: number }> = [];
  for (let r = Math.max(0, center.r - radius); r <= Math.min(rows - 1, center.r + radius); r++) {
    for (let c = Math.max(0, center.c - radius); c <= Math.min(cols - 1, center.c + radius); c++) {
      if (grid[r]![c]) positions.push({ r, c });
    }
  }
  return positions;
}

function expandBoard(rng: Rng, grid: Grid, mode: GameMode, addRows: number, addCols: number, maxRows: number, maxCols: number) {
  let rows = grid.length;
  let cols = grid[0]!.length;

  const targetRows = Math.min(maxRows, rows + addRows);
  const targetCols = Math.min(maxCols, cols + addCols);

  // Expand columns first.
  if (targetCols > cols) {
    for (let r = 0; r < rows; r++) {
      for (let c = cols; c < targetCols; c++) {
        grid[r]!.push(spawnCell(rng, mode));
      }
    }
    cols = targetCols;
  }

  // Expand rows by adding new rows at the top.
  if (targetRows > rows) {
    const newRows = targetRows - rows;
    const prepend: Grid = [];
    for (let r = 0; r < newRows; r++) {
      const row = Array.from({ length: cols }, () => spawnCell(rng, mode));
      prepend.push(row);
    }
    grid.unshift(...prepend);
  }

  return grid;
}

export class CandyMultiverseEngine {
  private rng: Rng;
  private config: GameConfig;
  private bonus: BonusState;
  readonly events = new EventBus<EngineEventMap>();

  constructor(config: GameConfig, seed: number = Date.now()) {
    this.config = config;
    this.rng = createRng(seed);
    this.bonus = createInitialBonusState();
  }

  getBonusState() {
    return { ...this.bonus };
  }

  setRtpTarget(targetRtp: number) {
    this.config.rtp.targetRtp = Math.min(0.98, Math.max(0.94, targetRtp));
  }

  setVolatility(v: GameConfig["rtp"]["volatility"]) {
    this.config.rtp.volatility = v;
  }

  private maybeTriggerCandyUniverse(mode: GameMode) {
    if (!this.config.candyUniverse.enabled) return false;
    // Avoid overriding Sugar Storm.
    if (mode === "sugar_storm") return false;
    return this.rng.next() < this.config.candyUniverse.triggerChancePerSpin;
  }

  buySugarStorm() {
    this.bonus.mode = "sugar_storm";
    this.bonus.sugarStormSpinsLeft = this.config.sugarStorm.freeSpins;
    this.events.emit("bonusEntered", { mode: "sugar_storm" });
  }

  spin(bet: number): SpinResult {
    this.events.emit("spinStarted", { bet });

    const baseMode: GameMode = this.bonus.mode;
    const triggeredCandyUniverse = this.maybeTriggerCandyUniverse(baseMode);
    const mode: GameMode = triggeredCandyUniverse ? "candy_universe" : baseMode;

    if (triggeredCandyUniverse) {
      this.events.emit("bonusEntered", { mode: "candy_universe" });
    }

    const gridSize = mode === "candy_universe" ? this.config.gridMega : this.config.gridBase;

    let grid = generateGrid(this.rng, gridSize.rows, gridSize.cols, mode);
    const startingGrid = cloneGrid(grid);

    // Sugar Storm trigger: 4 portals on initial board.
    const portalsOnStart = countPortals(grid);
    const triggeredSugarStorm = baseMode === "base" && portalsOnStart >= this.config.portalTriggerCount;
    if (triggeredSugarStorm) {
      this.bonus.mode = "sugar_storm";
      this.bonus.sugarStormSpinsLeft = this.config.sugarStorm.freeSpins;
      this.events.emit("bonusEntered", { mode: "sugar_storm" });
    }

    let chainIndex = 0;
    let cascadeIndex = 0;
    let totalWin = 0;
    const cascades: CascadeStep[] = [];

    // Cascade loop
    while (cascadeIndex < 50) {
      const wins = calculateClusterWins(grid, this.config, bet);

      // No wins: optionally apply one portal effect in bonus (extra fun), then exit.
      if (wins.length === 0) {
        break;
      }

      // Increase chain multiplier each cascade.
      chainIndex = Math.min(this.config.chainMultipliers.length - 1, chainIndex + (cascadeIndex === 0 ? 0 : 1));

      const chainMultiplier = this.config.chainMultipliers[chainIndex]!;

      const bombs = collectBombs(grid);
      const bombSum = sumBombs(bombs);
      const bombMultiplier = bombSum > 0 ? bombSum : 1;

      const portalsBefore = countPortals(grid);

      // Remove winning positions.
      const toRemove = new Map<string, { r: number; c: number }>();
      for (const w of wins) for (const p of w.positions) toRemove.set(`${p.r}:${p.c}`, p);

      // Also remove bombs and portals if a win happens (keeps flow like classic cluster games).
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0]!.length; c++) {
          const cell = grid[r]![c];
          if (!cell) continue;
          if (cell.id === "portal" || cell.id.startsWith("bomb_")) toRemove.set(`${r}:${c}`, { r, c });
        }
      }

      removePositions(grid, [...toRemove.values()]);

      // Portal effect: if at least 1 portal was present pre-removal, apply one effect.
      const portalEffects: PortalEffect[] = [];
      if (portalsBefore > 0) {
        const effect = pickPortalEffect(this.rng, chainIndex, this.config.chainMultipliers.length - 1);
        portalEffects.push(effect);

        if (effect.type === "symbol_explosion") {
          const exploded = explodeRandomArea(this.rng, grid, effect.radius);
          removePositions(grid, exploded);
        }

        if (effect.type === "board_expansion") {
          expandBoard(
            this.rng,
            grid,
            mode,
            effect.addRows,
            effect.addCols,
            this.config.gridMega.rows,
            this.config.gridMega.cols,
          );
        }

        if (effect.type === "instant_multiplier") {
          chainIndex = Math.min(effect.toMultiplierIndex, this.config.chainMultipliers.length - 1);
        }

        // extra_cascade is handled after refill (keeps the loop going).
      }

      // Fill cascade
      cascadeFill(this.rng, grid, mode);

      const baseWin = wins.reduce((s, w) => s + w.payout, 0);
      const winThisCascade = baseWin * chainMultiplier * bombMultiplier;
      totalWin += winThisCascade;

      cascades.push({
        index: cascadeIndex,
        chainMultiplier,
        wins,
        appliedBombMultipliers: bombs,
        portalEffects,
        winThisCascade,
        gridAfter: cloneGrid(grid),
      });

      cascadeIndex++;

      const hadExtra = portalEffects.some((e) => e.type === "extra_cascade");
      if (!hadExtra) {
        // Continue only if there is another win naturally.
        const nextWins = calculateClusterWins(grid, this.config, bet);
        if (nextWins.length === 0) break;
      }
    }

    // Consume bonus spins if currently in Sugar Storm.
    if (this.bonus.mode === "sugar_storm") {
      this.bonus.sugarStormSpinsLeft = Math.max(0, this.bonus.sugarStormSpinsLeft - 1);
      if (this.bonus.sugarStormSpinsLeft === 0) {
        this.bonus.mode = "base";
      }
    }

    const result: SpinResult = {
      bet,
      mode,
      gridSize,
      startingGrid,
      cascades,
      totalWin,
      portalsHit: portalsOnStart,
      triggeredSugarStorm,
      triggeredCandyUniverse,
    };

    this.events.emit("spinCompleted", { totalWin });
    return result;
  }
}
