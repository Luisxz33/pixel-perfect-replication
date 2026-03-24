import type { ClusterWin, GameConfig, Grid, SymbolId } from "@/game/types";
import { isPaySymbol } from "@/game/gridSystem/symbols";

const dirs = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

function inBounds(grid: Grid, r: number, c: number) {
  return r >= 0 && c >= 0 && r < grid.length && c < (grid[0]?.length ?? 0);
}

export function findClusters(grid: Grid, config: GameConfig): Array<{ id: SymbolId; positions: Array<{ r: number; c: number }> }> {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));

  const clusters: Array<{ id: SymbolId; positions: Array<{ r: number; c: number }> }> = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (visited[r]![c]) continue;
      visited[r]![c] = true;

      const cell = grid[r]![c];
      if (!cell) continue;
      if (!isPaySymbol(cell.id)) continue;

      const id = cell.id;
      const q: Array<{ r: number; c: number }> = [{ r, c }];
      const positions: Array<{ r: number; c: number }> = [{ r, c }];

      while (q.length) {
        const cur = q.pop()!;
        for (const { dr, dc } of dirs) {
          const nr = cur.r + dr;
          const nc = cur.c + dc;
          if (!inBounds(grid, nr, nc)) continue;
          if (visited[nr]![nc]) continue;
          visited[nr]![nc] = true;

          const ncell = grid[nr]![nc];
          if (!ncell) continue;
          if (ncell.id !== id) continue;

          positions.push({ r: nr, c: nc });
          q.push({ r: nr, c: nc });
        }
      }

      if (positions.length >= config.minClusterWin) {
        clusters.push({ id, positions });
      }
    }
  }

  return clusters;
}

function payoutMultiplierForSize(config: GameConfig, id: SymbolId, size: number) {
  const pay = config.paytable[id as keyof typeof config.paytable];
  if (!pay) return 0;
  if (size < pay.minCluster) return 0;

  // Choose the best bracket <= size.
  let best = 0;
  for (const bracket of pay.pays) {
    if (size >= bracket.size) best = Math.max(best, bracket.mult);
  }
  return best;
}

export function calculateClusterWins(grid: Grid, config: GameConfig, bet: number): ClusterWin[] {
  const clusters = findClusters(grid, config);
  return clusters
    .map((cl) => {
      const mult = payoutMultiplierForSize(config, cl.id, cl.positions.length);
      const payout = bet * mult;
      return {
        id: cl.id,
        size: cl.positions.length,
        positions: cl.positions,
        payout,
      } satisfies ClusterWin;
    })
    .filter((w) => w.payout > 0);
}
