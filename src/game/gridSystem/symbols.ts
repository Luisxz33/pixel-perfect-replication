import type { BombMultiplier, SymbolId } from "@/game/types";

export const bombMultipliers: BombMultiplier[] = [2, 5, 10, 25, 50, 100, 250];

export function bombId(mult: BombMultiplier): SymbolId {
  return `bomb_${mult}x` as SymbolId;
}

export function isBomb(id: SymbolId): id is `bomb_${number}x` {
  return id.startsWith("bomb_");
}

export function parseBombMultiplier(id: SymbolId): BombMultiplier | null {
  if (!isBomb(id)) return null;
  const m = id.match(/bomb_(\d+)x/);
  if (!m) return null;
  const n = Number(m[1]);
  if (![2, 5, 10, 25, 50, 100, 250].includes(n)) return null;
  return n as BombMultiplier;
}

export function isPortal(id: SymbolId) {
  return id === "portal";
}

export function isPaySymbol(id: SymbolId) {
  return !isBomb(id) && !isPortal(id);
}
