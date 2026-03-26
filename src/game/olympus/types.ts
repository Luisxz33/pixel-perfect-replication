export type OlympusBaseSymbolId =
  | "blue_gem"
  | "green_gem"
  | "purple_gem"
  | "yellow_gem"
  | "ring"
  | "chalice"
  | "crown"
  | "shield"
  | "lightning_relic"
  | "golden_temple"
  | "titan_crown";

export type OlympusSymbolId =
  | OlympusBaseSymbolId
  | "scatter_storm_eye"
  | "orb_2x"
  | "orb_5x"
  | "orb_10x"
  | "orb_25x"
  | "orb_50x"
  | "orb_100x"
  | "orb_500x";

export type OlympusMode = "base" | "wrath_of_olympus" | "divine_storm";

export type OlympusCell = {
  id: OlympusSymbolId;
  uid: string;
};

export type OlympusGrid = Array<Array<OlympusCell | null>>;

export type OlympusClusterWin = {
  id: OlympusBaseSymbolId;
  size: number;
  positions: Array<{ r: number; c: number }>;
  basePayout: number;
};

export type OlympusCascadeStep = {
  index: number;
  globalMultiplier: number;
  wins: OlympusClusterWin[];
  orbMultipliers: number[];
  winThisCascade: number;
  gridAfter: OlympusGrid;
};

export type OlympusSpinResult = {
  bet: number;
  mode: OlympusMode;
  gridSize: { rows: number; cols: number };
  startingGrid: OlympusGrid;
  cascades: OlympusCascadeStep[];
  totalWin: number;
  scattersOnStart: number;
  triggeredWrath: boolean;
  triggeredDivineStorm: boolean;
};

export type OlympusPaytable = Record<
  OlympusBaseSymbolId,
  {
    minCluster: number;
    pays: Array<{ size: number; mult: number }>;
  }
>;

export type OlympusConfig = {
  gameName: "Olympus Thunder Reign";
  gridBase: { rows: number; cols: number };
  gridDivine: { rows: number; cols: number };
  minClusterWin: 8;
  globalMultiplierProgression: number[];
  scatterTriggerCount: 4;
  wrathOfOlympus: {
    freeSpins: 15;
    multiplierAccumulates: true;
  };
  divineStorm: {
    triggerChancePerSpin: number;
  };
  rtpRange: { min: 0.94; max: 0.98; target: number };
  volatility: "low" | "medium" | "high";
  paytable: OlympusPaytable;
};
