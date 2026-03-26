import type {
  OlympusBaseSymbolId,
  OlympusClusterWin,
  OlympusConfig,
  OlympusGrid,
  OlympusSymbolId,
} from "@/game/olympus/types";
import { isPayableBase } from "@/game/olympus/symbolManager/symbols";

const directions = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

function inBounds(grid: OlympusGrid, r: number, c: number) {
  return r >= 0 && c >= 0 && r < grid.length && c < (grid[0]?.length ?? 0);
}

function payoutMultiplier(config: OlympusConfig, id: OlympusBaseSymbolId, size: number) {
  const pt = config.paytable[id];
  if (!pt || size < pt.minCluster) return 0;
  let best = 0;
  for (const tier of pt.pays) {
    if (size >= tier.size) best = Math.max(best, tier.mult);
  }
  return best;
}

export function calculateOlympusClusterWins(
  grid: OlympusGrid,
  config: OlympusConfig,
  bet: number,
): OlympusClusterWin[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const visited = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
  const wins: OlympusClusterWin[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r]![c]) continue;
      visited[r]![c] = true;

      const cell = grid[r]![c];
      if (!cell) continue;
      if (!isPayableBase(cell.id)) continue;

      const symbolId: OlympusSymbolId = cell.id;
      const q: Array<{ r: number; c: number }> = [{ r, c }];
      const positions: Array<{ r: number; c: number }> = [{ r, c }];

      while (q.length) {
        const cur = q.pop()!;
        for (const { dr, dc } of directions) {
          const nr = cur.r + dr;
          const nc = cur.c + dc;
          if (!inBounds(grid, nr, nc)) continue;
          if (visited[nr]![nc]) continue;
          visited[nr]![nc] = true;

          const ncell = grid[nr]![nc];
          if (!ncell || ncell.id !== symbolId) continue;

          positions.push({ r: nr, c: nc });
          q.push({ r: nr, c: nc });
        }
      }

      if (positions.length >= config.minClusterWin) {
        const mult = payoutMultiplier(config, symbolId as OlympusBaseSymbolId, positions.length);
        const basePayout = bet * mult;
        if (basePayout > 0) {
          wins.push({
            id: symbolId as OlympusBaseSymbolId,
            size: positions.length,
            positions,
            basePayout,
          });
        }
      }
    }
  }

  return wins;
}
