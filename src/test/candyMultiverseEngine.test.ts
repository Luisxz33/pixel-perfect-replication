import { describe, expect, it } from "vitest";
import type { Grid } from "@/game/types";
import { candyMultiverseConfig } from "@/game/engine/config";
import { calculateClusterWins } from "@/game/winCalculator/clusters";

function makeGrid(rows: number, cols: number, id: any): Grid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ id, uid: `${id}_${Math.random()}` })),
  );
}

describe("Candy Multiverse - winCalculator", () => {
  it("paga apenas a partir de 9 símbolos (cluster pays)", () => {
    const grid8: Grid = [
      // 2x4 = 8
      ...Array.from({ length: 2 }, () =>
        Array.from({ length: 4 }, () => ({ id: "candy" as const, uid: "x" })),
      ),
    ];

    expect(calculateClusterWins(grid8, candyMultiverseConfig, 10)).toHaveLength(0);

    const grid9 = makeGrid(3, 3, "candy");
    const wins = calculateClusterWins(grid9, candyMultiverseConfig, 10);
    expect(wins).toHaveLength(1);
    expect(wins[0]!.size).toBe(9);
    expect(wins[0]!.payout).toBeCloseTo(2.5); // 10 * 0.25
  });
});
