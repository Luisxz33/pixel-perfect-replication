import type { OlympusCell, OlympusGrid, OlympusMode } from "@/game/olympus/types";
import type { OlympusRng } from "@/game/olympus/rngSystem/rng";
import { getSymbolWeights } from "@/game/olympus/symbolManager/symbols";

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function spawnOlympusCell(rng: OlympusRng, mode: OlympusMode): OlympusCell {
  const picked = rng.pickWeighted(getSymbolWeights(mode).map((w) => ({ item: w.id, weight: w.weight })));
  return { id: picked, uid: uid(picked) };
}

export function generateOlympusGrid(
  rng: OlympusRng,
  rows: number,
  cols: number,
  mode: OlympusMode,
): OlympusGrid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => spawnOlympusCell(rng, mode)),
  );
}

export function cloneOlympusGrid(grid: OlympusGrid): OlympusGrid {
  return grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function removePositions(grid: OlympusGrid, positions: Array<{ r: number; c: number }>) {
  for (const { r, c } of positions) {
    if (grid[r]?.[c]) grid[r]![c] = null;
  }
}

export function tumbleFill(rng: OlympusRng, grid: OlympusGrid, mode: OlympusMode): OlympusGrid {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  for (let c = 0; c < cols; c++) {
    const col: Array<OlympusCell | null> = [];
    for (let r = 0; r < rows; r++) col.push(grid[r]![c] ?? null);

    const kept = col.filter((cell): cell is OlympusCell => cell !== null);
    const missing = rows - kept.length;
    const spawned = Array.from({ length: missing }, () => spawnOlympusCell(rng, mode));

    const newCol = [...spawned, ...kept];
    for (let r = 0; r < rows; r++) grid[r]![c] = newCol[r]!;
  }

  return grid;
}
