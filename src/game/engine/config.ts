import type { GameConfig } from "@/game/types";

export const candyMultiverseConfig: GameConfig = {
  name: "Candy Multiverse",
  gridBase: { rows: 5, cols: 6 },
  gridMega: { rows: 10, cols: 10 },
  minClusterWin: 9,
  chainMultipliers: [1, 2, 3, 5, 8, 12, 20],
  portalTriggerCount: 4,
  sugarStorm: {
    freeSpins: 15,
    unlimitedMultiplierStacking: true,
    candyMeteorsPerSpin: { min: 1, max: 3 },
    dynamicRtpBoost: { enabled: true, portalWeightBoost: 1.35, bombWeightBoost: 1.25 },
  },
  candyUniverse: {
    enabled: true,
    triggerChancePerSpin: 0.002,
  },
  rtp: {
    targetRtp: 0.96,
    volatility: "high",
  },
  paytable: {
    candy: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 0.25 },
        { size: 12, mult: 0.5 },
        { size: 16, mult: 1 },
        { size: 20, mult: 2 },
        { size: 25, mult: 4 },
      ],
    },
    fruit: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 0.2 },
        { size: 12, mult: 0.4 },
        { size: 16, mult: 0.8 },
        { size: 20, mult: 1.6 },
        { size: 25, mult: 3.2 },
      ],
    },
    star: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 0.3 },
        { size: 12, mult: 0.6 },
        { size: 16, mult: 1.2 },
        { size: 20, mult: 2.4 },
        { size: 25, mult: 4.8 },
      ],
    },
    neon_gem: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 0.35 },
        { size: 12, mult: 0.7 },
        { size: 16, mult: 1.4 },
        { size: 20, mult: 2.8 },
        { size: 25, mult: 5.6 },
      ],
    },
    golden_candy: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 0.75 },
        { size: 12, mult: 1.5 },
        { size: 16, mult: 3 },
        { size: 20, mult: 6 },
        { size: 25, mult: 12 },
      ],
    },
    diamond_candy: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 1 },
        { size: 12, mult: 2 },
        { size: 16, mult: 4 },
        { size: 20, mult: 8 },
        { size: 25, mult: 16 },
      ],
    },
    mega_fruit: {
      minCluster: 9,
      pays: [
        { size: 9, mult: 1.25 },
        { size: 12, mult: 2.5 },
        { size: 16, mult: 5 },
        { size: 20, mult: 10 },
        { size: 25, mult: 20 },
      ],
    },
  },
};
