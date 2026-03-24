export type EngineEventMap = {
  spinStarted: { bet: number };
  spinCompleted: { totalWin: number };
  bonusEntered: { mode: "sugar_storm" | "candy_universe" };
};

export class EventBus<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<(payload: any) => void>>();

  on<K extends keyof Events>(type: K, cb: (payload: Events[K]) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(cb as any);
    this.listeners.set(type, set);
    return () => set.delete(cb as any);
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]) {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const cb of set) cb(payload as any);
  }
}
