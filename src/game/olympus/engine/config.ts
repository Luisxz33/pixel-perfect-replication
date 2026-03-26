import type { OlympusConfig } from "@/game/olympus/types";

export const olympusThunderConfig: OlympusConfig = {
  gameName: "Olympus Thunder Reign",
  gridBase: { rows: 6, cols: 6 },
  gridDivine: { rows: 8, cols: 8 },
  minClusterWin: 8,
  globalMultiplierProgression: [1, 2, 3, 5, 10, 20, 50],
  scatterTriggerCount: 4,
  wrathOfOlympus: {
    freeSpins: 15,
    multiplierAccumulates: true,
  },
  divineStorm: {
    triggerChancePerSpin: 0.002,
  },
  rtpRange: { min: 0.94, max: 0.98, target: 0.96 },
  volatility: "high",
  paytable: {
    blue_gem: { minCluster: 8, pays: [{ size: 8, mult: 0.2 }, { size: 12, mult: 0.45 }, { size: 16, mult: 1 }] },
    green_gem: { minCluster: 8, pays: [{ size: 8, mult: 0.2 }, { size: 12, mult: 0.45 }, { size: 16, mult: 1 }] },
    purple_gem: { minCluster: 8, pays: [{ size: 8, mult: 0.25 }, { size: 12, mult: 0.55 }, { size: 16, mult: 1.2 }] },
    yellow_gem: { minCluster: 8, pays: [{ size: 8, mult: 0.25 }, { size: 12, mult: 0.6 }, { size: 16, mult: 1.3 }] },
    ring: { minCluster: 8, pays: [{ size: 8, mult: 0.35 }, { size: 12, mult: 0.8 }, { size: 16, mult: 1.8 }] },
    chalice: { minCluster: 8, pays: [{ size: 8, mult: 0.4 }, { size: 12, mult: 0.9 }, { size: 16, mult: 2 }] },
    crown: { minCluster: 8, pays: [{ size: 8, mult: 0.5 }, { size: 12, mult: 1.2 }, { size: 16, mult: 2.5 }] },
    shield: { minCluster: 8, pays: [{ size: 8, mult: 0.55 }, { size: 12, mult: 1.3 }, { size: 16, mult: 2.8 }] },
    lightning_relic: { minCluster: 8, pays: [{ size: 8, mult: 0.8 }, { size: 12, mult: 2 }, { size: 16, mult: 4.2 }] },
    golden_temple: { minCluster: 8, pays: [{ size: 8, mult: 1 }, { size: 12, mult: 2.5 }, { size: 16, mult: 5 }] },
    titan_crown: { minCluster: 8, pays: [{ size: 8, mult: 1.25 }, { size: 12, mult: 3 }, { size: 16, mult: 6 }] },
  },
};
