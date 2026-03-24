import type { Grid, GridCell, GameMode, SymbolId } from "@/game/types";
import type { Rng } from "@/game/rng/mulberry32";
import { uid } from "@/game/gridSystem/uid";

export type SymbolWeights = {
  base: Array<{ id: SymbolId; weight: number }>;
  sugarStorm: Array<{ id: SymbolId; weight: number }>;
};

export function getDefaultWeights(mode: GameMode): Array<{ id: SymbolId; weight: number }> {
  // These weights are for a prototype. Tuning requires math + analytics.
  const common = [
    { id: "candy" as const, weight: 26 },
    { id: "fruit" as const, weight: 26 },
    { id: "star" as const, weight: 22 },
    { id: "neon_gem" as const, weight: 20 },
  ];

  const rare = [
    { id: "golden_candy" as const, weight: 5 },
    { id: "diamond_candy" as const, weight: 3 },
    { id: "mega_fruit" as const, weight: 3 },
  ];

  const bombs = [
    { id: "bomb_2x" as const, weight: 5 },
    { id: "bomb_5x" as const, weight: 3 },
    { id: "bomb_10x" as const, weight: 2 },
    { id: "bomb_25x" as const, weight: 1 },
    { id: "bomb_50x" as const, weight: 0.6 },
    { id: "bomb_100x" as const, weight: 0.35 },
    { id: "bomb_250x" as const, weight: 0.12 },
  ];

  const portal = [{ id: "portal" as const, weight: mode === "sugar_storm" ? 3.5 : 2 }];

  if (mode === "sugar_storm") {
    return [...common, ...rare, ...bombs, ...portal];
  }

  return [...common, ...rare, ...bombs, ...portal];
}

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ id: "candy", uid: uid("cell") })));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function spawnCell(rng: Rng, mode: GameMode): GridCell {
  const pick = rng.pickWeighted(getDefaultWeights(mode).map((w) => ({ item: w.id, weight: w.weight })));
  return { id: pick, uid: uid(pick) };
}

export function generateGrid(rng: Rng, rows: number, cols: number, mode: GameMode): Grid {
  const grid: Grid = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(spawnCell(rng, mode));
    }
    grid.push(row);
  }
  return grid;
}

export function removePositions(grid: Grid, positions: Array<{ r: number; c: number }>) {
  for (const { r, c } of positions) {
    grid[r]![c] = null;
  }
}

export function cascadeFill(rng: Rng, grid: Grid, mode: GameMode): Grid {
  const rows = grid.length;
  const cols = grid[0]!.length;

  // For each column, move non-null cells down and spawn new ones at top.
  for (let c = 0; c < cols; c++) {
    const col: Array<GridCell | null> = [];
    for (let r = 0; r < rows; r++) col.push(grid[r]![c] ?? null);

    const kept = col.filter((x): x is GridCell => x !== null);
    const missing = rows - kept.length;
    const spawned = Array.from({ length: missing }, () => spawnCell(rng, mode));

    const newCol = [...spawned, ...kept];
    for (let r = 0; r < rows; r++) grid[r]![c] = newCol[r]!;
  }

  return grid;
}
