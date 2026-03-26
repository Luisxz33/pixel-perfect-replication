import LobbyLayout from "@/components/LobbyLayout";
import { CandyMultiverseEngine } from "@/game/engine/candyMultiverseEngine";
import { candyMultiverseConfig } from "@/game/engine/config";
import type { Grid, GridCell, SpinResult, SymbolId } from "@/game/types";
import { Aperture, Apple, Bomb, Coins, Diamond, Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import candyMultiverseBg from "@/assets/Gemini_Generated_Image_7k4onj7k4onj7k4o.png";

function formatCredits(n: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function symbolLabel(id: SymbolId) {
  switch (id) {
    case "candy":
      return "Candy";
    case "fruit":
      return "Fruit";
    case "star":
      return "Star";
    case "neon_gem":
      return "Neon";
    case "golden_candy":
      return "Gold";
    case "diamond_candy":
      return "Diamond";
    case "mega_fruit":
      return "Mega";
    case "portal":
      return "Portal";
    default: {
      if (id.startsWith("bomb_")) return id.replace("bomb_", "").toUpperCase();
      return id;
    }
  }
}

function symbolIcon(id: SymbolId) {
  if (id.startsWith("bomb_")) return Bomb;
  switch (id) {
    case "candy":
      return Sparkles;
    case "fruit":
      return Apple;
    case "star":
      return Star;
    case "neon_gem":
      return Zap;
    case "golden_candy":
      return Coins;
    case "diamond_candy":
      return Diamond;
    case "mega_fruit":
      return Sparkles;
    case "portal":
      return Aperture;
    default:
      return null;
  }
}

function tileClasses(id: SymbolId) {
  if (id === "portal") return "bg-primary/10 border-primary/30 text-primary";
  if (id.startsWith("bomb_")) return "bg-muted/70 border-border text-gold";
  if (id === "diamond_candy") return "bg-muted/40 border-border text-secondary-foreground";
  if (id === "golden_candy") return "bg-muted/40 border-border text-gold";
  if (id === "mega_fruit") return "bg-muted/40 border-border text-foreground";
  return "bg-muted/30 border-border text-foreground";
}

function GridView({ grid }: { grid: Grid }) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="w-full max-w-[720px] mx-auto"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "6px",
      }}
      aria-label="Slot grid"
      role="grid"
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const id = cell?.id ?? ("candy" as SymbolId);
          const content = cell ? symbolLabel(cell.id) : "";
          const Icon = cell ? symbolIcon(cell.id) : null;

          return (
            <div
              key={`${r}:${c}:${(cell as GridCell | null)?.uid ?? "empty"}`}
              role="gridcell"
              className={`aspect-square rounded-md border flex items-center justify-center text-[10px] md:text-xs font-display uppercase tracking-widest select-none ${
                cell ? tileClasses(id) : "bg-muted/10 border-border text-muted-foreground"
              }`}
              aria-label={cell ? `Symbol ${cell.id}` : "Empty"}
            >
              {cell ? (
                <div className="flex flex-col items-center justify-center gap-1 leading-none">
                  {Icon ? <Icon className="size-4 md:size-5" aria-hidden="true" /> : null}
                  <span>{content}</span>
                </div>
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
}

function useBeep(enabled: boolean) {
  return useMemo(() => {
    if (!enabled) return { win: () => {}, bonus: () => {} };

    const ctx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    const tone = (freq: number, durationMs: number) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
      }, durationMs);
    };

    return {
      win: () => tone(660, 90),
      bonus: () => {
        tone(440, 120);
        setTimeout(() => tone(880, 120), 110);
      },
    };
  }, [enabled]);
}

export default function CandyMultiverse() {
  const engineRef = useRef<CandyMultiverseEngine | null>(null);
  if (!engineRef.current) engineRef.current = new CandyMultiverseEngine(candyMultiverseConfig);

  const [balance, setBalance] = useState(2500);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [sound, setSound] = useState(true);

  const [modeLabel, setModeLabel] = useState("Base");
  const [grid, setGrid] = useState<Grid>(() => {
    // Initial placeholder grid for UI.
    const rows = candyMultiverseConfig.gridBase.rows;
    const cols = candyMultiverseConfig.gridBase.cols;
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  });

  const [lastResult, setLastResult] = useState<SpinResult | null>(null);

  const beep = useBeep(sound);

  const suggestedBet = useMemo(() => {
    const vol = candyMultiverseConfig.rtp.volatility;
    const factor = vol === "high" ? 0.01 : vol === "medium" ? 0.015 : 0.02;
    return Math.max(1, Math.floor(balance * factor));
  }, [balance]);

  const animateResult = async (result: SpinResult) => {
    setLastResult(result);
    setWin(result.totalWin);

    setModeLabel(
      result.mode === "sugar_storm" ? `Sugar Storm (${engineRef.current!.getBonusState().sugarStormSpinsLeft} FS)` : result.mode === "candy_universe" ? "Candy Universe" : "Base",
    );

    setGrid(result.startingGrid);

    if (result.triggeredSugarStorm || result.triggeredCandyUniverse) {
      beep.bonus();
    }

    const stepDelay = turbo ? 160 : 420;
    for (const step of result.cascades) {
      // Quick flash on win.
      if (step.winThisCascade > 0) beep.win();
      setGrid(step.gridAfter);
      await new Promise((r) => setTimeout(r, stepDelay));
    }
  };

  const doSpin = async () => {
    if (spinning) return;
    if (balance < bet) return;

    setSpinning(true);
    setWin(0);

    setBalance((b) => b - bet);

    const result = engineRef.current!.spin(bet);

    await animateResult(result);

    setBalance((b) => b + result.totalWin);
    setSpinning(false);
  };

  const doBuyBonus = async () => {
    if (spinning) return;
    const cost = bet * 100;
    if (balance < cost) return;

    setSpinning(true);
    setWin(0);
    setBalance((b) => b - cost);

    engineRef.current!.buySugarStorm();
    const result = engineRef.current!.spin(bet);

    await animateResult(result);

    setBalance((b) => b + result.totalWin);
    setSpinning(false);
  };

  useEffect(() => {
    if (!autoSpin) return;
    if (spinning) return;
    if (balance < bet) return;

    const id = window.setTimeout(() => {
      void doSpin();
    }, turbo ? 250 : 900);

    return () => window.clearTimeout(id);
  }, [autoSpin, spinning, balance, bet, turbo]);

  return (
    <LobbyLayout title="Candy Multiverse">
      <section
        className="rounded-lg border border-border overflow-hidden"
        style={{
          backgroundImage: `url(${candyMultiverseBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-background/80 backdrop-blur-sm p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-foreground text-xl md:text-2xl uppercase tracking-wide">
              Candy Multiverse
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Cluster Pays • Cascades • Chain Reaction
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saldo</p>
              <p className="font-display text-foreground tabular-nums">{formatCredits(balance)}</p>
            </div>
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Aposta</p>
              <p className="font-display text-foreground tabular-nums">{formatCredits(bet)}</p>
            </div>
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ganho</p>
              <p className="font-display text-gold tabular-nums">{formatCredits(win)}</p>
            </div>
          </div>
        </div>

        <div className="bg-background/40 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Modo</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{modeLabel}</p>
          </div>
          <div className="flex justify-center">
            <GridView grid={grid} />
          </div>

          {lastResult ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Cascades: <span className="text-foreground">{lastResult.cascades.length}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Portais: <span className="text-foreground">{lastResult.portalsHit}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Board: <span className="text-foreground">{lastResult.gridSize.cols}x{lastResult.gridSize.rows}</span>
              </span>
            </div>
          ) : null}
        </div>

        <div className="bg-muted/20 rounded-lg border border-border p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
            <div className="col-span-2 md:col-span-2 flex items-center gap-2">
              <button
                className="bg-primary text-primary-foreground font-display uppercase text-xs tracking-wider px-6 py-3 rounded-md hover:bg-primary/90 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none w-full"
                disabled={spinning || balance < bet}
                onClick={() => void doSpin()}
              >
                {spinning ? "Spinning…" : "Spin"}
              </button>
            </div>

            <button
              className={`border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md transition-colors active:scale-[0.98] ${
                autoSpin ? "bg-primary/10 text-primary" : "bg-background text-foreground hover:bg-muted/30"
              }`}
              onClick={() => setAutoSpin((v) => !v)}
              disabled={spinning}
            >
              Auto
            </button>

            <button
              className={`border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md transition-colors active:scale-[0.98] ${
                turbo ? "bg-primary/10 text-primary" : "bg-background text-foreground hover:bg-muted/30"
              }`}
              onClick={() => setTurbo((v) => !v)}
              disabled={spinning}
            >
              Turbo
            </button>

            <button
              className="border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md bg-background text-foreground hover:bg-muted/30 transition-colors active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              onClick={() => void doBuyBonus()}
              disabled={spinning || balance < bet * 100}
              title="Compra Sugar Storm (protótipo)"
            >
              Buy Bonus
            </button>

            <div className="col-span-2 md:col-span-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <button
                  className="border border-border px-3 py-2 rounded-md bg-background hover:bg-muted/30 transition-colors"
                  onClick={() => setBet((b) => clamp(b - 1, 1, 9999))}
                  disabled={spinning}
                  aria-label="Diminuir aposta"
                >
                  −
                </button>
                <button
                  className="border border-border px-3 py-2 rounded-md bg-background hover:bg-muted/30 transition-colors"
                  onClick={() => setBet((b) => clamp(b + 1, 1, 9999))}
                  disabled={spinning}
                  aria-label="Aumentar aposta"
                >
                  +
                </button>

                <button
                  className={`border border-border px-3 py-2 rounded-md transition-colors ${
                    sound ? "bg-primary/10 text-primary" : "bg-background text-foreground hover:bg-muted/30"
                  }`}
                  onClick={() => setSound((v) => !v)}
                  disabled={spinning}
                >
                  Settings
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Smart bet: <span className="text-foreground font-medium">{formatCredits(suggestedBet)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="uppercase tracking-widest text-[10px]">Mecânicas</p>
          <p className="mt-1">
            Cluster win mínimo: <span className="text-foreground">9 símbolos</span>. Cada cascade aumenta o Chain Reaction
            (1x→2x→3x→5x→8x→12x→20x). Portais aplicam efeitos aleatórios e 4 portais iniciam Sugar Storm.
          </p>
        </div>
        </div>
      </section>
    </LobbyLayout>
  );
}
