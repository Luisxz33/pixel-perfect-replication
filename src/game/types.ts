export type SymbolId =
  | "candy"
  | "fruit"
  | "star"
  | "neon_gem"
  | "golden_candy"
  | "diamond_candy"
  | "mega_fruit"
  | "portal"
  | "bomb_2x"
  | "bomb_5x"
  | "bomb_10x"
  | "bomb_25x"
  | "bomb_50x"
  | "bomb_100x"
  | "bomb_250x";

export type BombMultiplier = 2 | 5 | 10 | 25 | 50 | 100 | 250;

export type GameMode = "base" | "sugar_storm" | "candy_universe";

export type GridCell = {
  id: SymbolId;
  // Unique per spawn to help the UI animate diffs.
  uid: string;
};

export type Grid = Array<Array<GridCell | null>>; // [row][col]

export type ClusterWin = {
  id: SymbolId;
  size: number;
  positions: Array<{ r: number; c: number }>;
  payout: number; // in credits
};

export type SpinResult = {
  bet: number;
  mode: GameMode;
  gridSize: { rows: number; cols: number };
  startingGrid: Grid;
  cascades: CascadeStep[];
  totalWin: number;
  portalsHit: number;
  triggeredSugarStorm: boolean;
  triggeredCandyUniverse: boolean;
};

export type PortalEffect =
  | { type: "extra_cascade" }
  | { type: "symbol_explosion"; radius: 1 | 2 }
  | { type: "board_expansion"; addRows: 1 | 2; addCols: 1 | 2 }
  | { type: "instant_multiplier"; toMultiplierIndex: number };

export type CascadeStep = {
  index: number;
  chainMultiplier: number;
  wins: ClusterWin[];
  appliedBombMultipliers: BombMultiplier[];
  portalEffects: PortalEffect[];
  winThisCascade: number;
  gridAfter: Grid;
};

export type Paytable = Record<
  Exclude<SymbolId, `bomb_${string}` | "portal">,
  { minCluster: number; pays: Array<{ size: number; mult: number }> }
>;

export type RtpConfig = {
  // A user-facing slider range (not a guarantee).
  targetRtp: number; // 0.94 - 0.98
  volatility: "low" | "medium" | "high";
};

export type GameConfig = {
  name: "Candy Multiverse";
  gridBase: { rows: 7; cols: 7 };
  gridMega: { rows: 10; cols: 10 };

  // Cluster wins start at 9 symbols.
  minClusterWin: 9;

  chainMultipliers: number[];

  portalTriggerCount: 4;
  sugarStorm: {
    freeSpins: 15;
    // When true, multipliers can stack without cap (engine still uses JS number).
    unlimitedMultiplierStacking: true;
    // Cosmetic effect in UI; engine uses as an extra bomb chance.
    candyMeteorsPerSpin: { min: 1; max: 3 };
    // Small bias to increase portal/bomb frequency during bonus.
    dynamicRtpBoost: { enabled: true; portalWeightBoost: number; bombWeightBoost: number };
  };

  // Extremely rare trigger. Engine exposes a probability knob.
  candyUniverse: {
    enabled: true;
    triggerChancePerSpin: number; // e.g. 0.002
  };

  paytable: Paytable;
  rtp: RtpConfig;
};
