import type { OlympusBaseSymbolId, OlympusMode, OlympusSymbolId } from "@/game/olympus/types";

export const symbolIcons: Record<OlympusSymbolId, string> = {
  blue_gem: "🔷",
  green_gem: "🟢",
  purple_gem: "🟣",
  yellow_gem: "🟡",
  ring: "💍",
  chalice: "🏆",
  crown: "👑",
  shield: "🛡️",
  lightning_relic: "⚡",
  golden_temple: "🏛️",
  titan_crown: "👑✨",
  scatter_storm_eye: "🌩️",
  orb_2x: "⚡2",
  orb_5x: "⚡5",
  orb_10x: "⚡10",
  orb_25x: "⚡25",
  orb_50x: "⚡50",
  orb_100x: "⚡100",
  orb_500x: "⚡500",
};

export const baseSymbols: OlympusBaseSymbolId[] = [
  "blue_gem",
  "green_gem",
  "purple_gem",
  "yellow_gem",
  "ring",
  "chalice",
  "crown",
  "shield",
  "lightning_relic",
  "golden_temple",
  "titan_crown",
];

export function isScatter(id: OlympusSymbolId) {
  return id === "scatter_storm_eye";
}

export function isOrb(id: OlympusSymbolId) {
  return id.startsWith("orb_");
}

export function isPayableBase(id: OlympusSymbolId): id is OlympusBaseSymbolId {
  return !isScatter(id) && !isOrb(id);
}

export function parseOrbMultiplier(id: OlympusSymbolId): number | null {
  if (!isOrb(id)) return null;
  const matched = id.match(/orb_(\d+)x/);
  return matched ? Number(matched[1]) : null;
}

export function getSymbolWeights(mode: OlympusMode): Array<{ id: OlympusSymbolId; weight: number }> {
  const low = [
    { id: "blue_gem" as const, weight: 18 },
    { id: "green_gem" as const, weight: 18 },
    { id: "purple_gem" as const, weight: 16 },
    { id: "yellow_gem" as const, weight: 16 },
  ];

  const medium = [
    { id: "ring" as const, weight: 10 },
    { id: "chalice" as const, weight: 8 },
    { id: "crown" as const, weight: 7 },
    { id: "shield" as const, weight: 7 },
  ];

  const high = [
    { id: "lightning_relic" as const, weight: 4.2 },
    { id: "golden_temple" as const, weight: 2.5 },
    { id: "titan_crown" as const, weight: 1.8 },
  ];

  const orbs = [
    { id: "orb_2x" as const, weight: 4 },
    { id: "orb_5x" as const, weight: 2.8 },
    { id: "orb_10x" as const, weight: 1.8 },
    { id: "orb_25x" as const, weight: 1 },
    { id: "orb_50x" as const, weight: 0.5 },
    { id: "orb_100x" as const, weight: 0.2 },
    { id: "orb_500x" as const, weight: 0.04 },
  ];

  const scatter = [{ id: "scatter_storm_eye" as const, weight: mode === "wrath_of_olympus" ? 2.3 : 1.6 }];

  return [...low, ...medium, ...high, ...orbs, ...scatter];
}
