export type OlympusRng = {
  next: () => number;
  int: (maxExclusive: number) => number;
  pickWeighted: <T>(items: Array<{ item: T; weight: number }>) => T;
};

export function createOlympusRng(seed: number): OlympusRng {
  let t = seed >>> 0;

  const next = () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number) => Math.floor(next() * maxExclusive);

  const pickWeighted = <T,>(items: Array<{ item: T; weight: number }>): T => {
    const total = items.reduce((sum, it) => sum + Math.max(0, it.weight), 0);
    if (total <= 0) return items[0]!.item;
    let roll = next() * total;
    for (const it of items) {
      roll -= Math.max(0, it.weight);
      if (roll <= 0) return it.item;
    }
    return items[items.length - 1]!.item;
  };

  return { next, int, pickWeighted };
}
