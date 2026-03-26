import { describe, expect, it } from "vitest";
import { olympusThunderConfig } from "@/game/olympus/engine/config";
import { calculateOlympusClusterWins } from "@/game/olympus/winCalculator/clusterWins";
import type { OlympusGrid } from "@/game/olympus/types";

function makeGrid(rows: number, cols: number, id: any): OlympusGrid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ id, uid: `${id}_${Math.random()}` })),
  );
}

describe("Olympus Thunder Reign - winCalculator", () => {
  it("paga apenas com cluster >= 8 símbolos", () => {
    const grid7: OlympusGrid = [Array.from({ length: 7 }, () => ({ id: "blue_gem", uid: "x" }))];
    expect(calculateOlympusClusterWins(grid7, olympusThunderConfig, 10)).toHaveLength(0);

    const grid8 = makeGrid(2, 4, "blue_gem");
    const wins = calculateOlympusClusterWins(grid8, olympusThunderConfig, 10);
    expect(wins).toHaveLength(1);
    expect(wins[0]!.size).toBe(8);
  });
});
