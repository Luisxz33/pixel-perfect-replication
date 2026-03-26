import LobbyLayout from "@/components/LobbyLayout";
import { olympusThunderConfig } from "@/game/olympus/engine/config";
import { OlympusThunderEngine } from "@/game/olympus/engine/OlympusThunderEngine";
import { formatOlympusCredits } from "@/game/olympus/uiManager/formatters";
import { symbolIcons } from "@/game/olympus/symbolManager/symbols";
import type { OlympusGrid, OlympusMode, OlympusSymbolId, OlympusSpinResult } from "@/game/olympus/types";
import { useEffect, useMemo, useRef, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function modeLabel(mode: OlympusMode, freeSpinsLeft: number) {
  if (mode === "wrath_of_olympus") return `Wrath of Olympus (${freeSpinsLeft} FS)`;
  if (mode === "divine_storm") return "Divine Storm Mode";
  return "Base";
}

function symbolName(id: OlympusSymbolId) {
  switch (id) {
    case "blue_gem":
      return "Blue Gem";
    case "green_gem":
      return "Green Gem";
    case "purple_gem":
      return "Purple Gem";
    case "yellow_gem":
      return "Yellow Gem";
    case "ring":
      return "Ring";
    case "chalice":
      return "Chalice";
    case "crown":
      return "Crown";
    case "shield":
      return "Shield";
    case "lightning_relic":
      return "Lightning Relic";
    case "golden_temple":
      return "Golden Temple";
    case "titan_crown":
      return "Titan Crown";
    case "scatter_storm_eye":
      return "Storm Eye";
    default:
      return id.replace("orb_", "⚡").replace("x", "");
  }
}

function cellStyle(id: OlympusSymbolId) {
  if (id === "scatter_storm_eye") return "bg-primary/20 border-primary/40 text-primary";
  if (id.startsWith("orb_")) return "bg-muted/60 border-border text-gold";
  if (id === "titan_crown" || id === "golden_temple" || id === "lightning_relic") return "bg-muted/50 border-border text-foreground";
  return "bg-muted/30 border-border text-foreground";
}

function GridView({ grid }: { grid: OlympusGrid }) {
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="w-full max-w-[760px] mx-auto"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "6px",
      }}
      role="grid"
      aria-label="Olympus Thunder Reign grid"
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const icon = cell ? symbolIcons[cell.id] : "";
          return (
            <div
              key={`${r}:${c}:${cell?.uid ?? "empty"}`}
              role="gridcell"
              className={`aspect-square rounded-md border flex flex-col items-center justify-center select-none ${
                cell ? cellStyle(cell.id) : "bg-muted/10 border-border"
              }`}
              title={cell ? symbolName(cell.id) : ""}
            >
              {cell ? (
                <>
                  <span className="text-lg md:text-2xl leading-none">{icon}</span>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest mt-1 text-foreground/85">
                    {symbolName(cell.id)}
                  </span>
                </>
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
}

export default function OlympusThunderReign() {
  const engineRef = useRef<OlympusThunderEngine | null>(null);
  if (!engineRef.current) engineRef.current = new OlympusThunderEngine(olympusThunderConfig);

  const [balance, setBalance] = useState(3000);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);

  const [grid, setGrid] = useState<OlympusGrid>(() =>
    Array.from({ length: olympusThunderConfig.gridBase.rows }, () =>
      Array.from({ length: olympusThunderConfig.gridBase.cols }, () => null),
    ),
  );
  const [lastResult, setLastResult] = useState<OlympusSpinResult | null>(null);

  const smartBet = useMemo(() => Math.max(1, Math.floor(balance * 0.012)), [balance]);

  const animateSpin = async (result: OlympusSpinResult) => {
    setLastResult(result);
    setGrid(result.startingGrid);
    setWin(result.totalWin);

    const delay = turbo ? 140 : 380;
    for (const cascade of result.cascades) {
      setGrid(cascade.gridAfter);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const spin = async () => {
    if (spinning) return;
    const freeSpin = engineRef.current!.getBonusState().freeSpinsLeft > 0;
    const cost = freeSpin ? 0 : bet;
    if (balance < cost) return;

    setSpinning(true);
    setWin(0);
    if (cost > 0) setBalance((b) => b - cost);

    const result = engineRef.current!.spin(bet);
    await animateSpin(result);

    setBalance((b) => b + result.totalWin);
    setSpinning(false);
  };

  const buyBonus = async () => {
    if (spinning) return;
    const cost = bet * 100;
    if (balance < cost) return;

    setSpinning(true);
    setWin(0);
    setBalance((b) => b - cost);

    engineRef.current!.buyWrathOfOlympus();
    const result = engineRef.current!.spin(bet);
    await animateSpin(result);

    setBalance((b) => b + result.totalWin);
    setSpinning(false);
  };

  useEffect(() => {
    if (!autoSpin || spinning) return;
    const freeSpin = engineRef.current!.getBonusState().freeSpinsLeft > 0;
    const cost = freeSpin ? 0 : bet;
    if (balance < cost) return;

    const id = window.setTimeout(() => {
      void spin();
    }, turbo ? 220 : 900);

    return () => window.clearTimeout(id);
  }, [autoSpin, spinning, balance, bet, turbo]);

  const bonusState = engineRef.current.getBonusState();

  return (
    <LobbyLayout title="Olympus Thunder Reign">
      <section className="bg-card rounded-lg border border-border p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-foreground text-xl md:text-2xl uppercase tracking-wide">
              Olympus Thunder Reign
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Olympus • Lightning • Divine Multipliers
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saldo</p>
              <p className="font-display text-foreground tabular-nums">{formatOlympusCredits(balance)}</p>
            </div>
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Aposta</p>
              <p className="font-display text-foreground tabular-nums">{formatOlympusCredits(bet)}</p>
            </div>
            <div className="bg-muted/20 rounded-md border border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ganho</p>
              <p className="font-display text-gold tabular-nums">{formatOlympusCredits(win)}</p>
            </div>
          </div>
        </div>

        <div className="bg-background/40 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Modo</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {modeLabel(bonusState.mode, bonusState.freeSpinsLeft)}
            </p>
          </div>

          <div className="flex justify-center">
            <GridView grid={grid} />
          </div>

          {lastResult ? (
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>
                Cascades: <span className="text-foreground">{lastResult.cascades.length}</span>
              </span>
              <span>
                Storm Eyes: <span className="text-foreground">{lastResult.scattersOnStart}</span>
              </span>
              <span>
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
                disabled={spinning}
                onClick={() => void spin()}
              >
                {spinning ? "Spinning…" : "Spin"}
              </button>
            </div>

            <button
              className={`border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md transition-colors active:scale-[0.98] ${
                autoSpin ? "bg-primary/10 text-primary" : "bg-background text-foreground hover:bg-muted/30"
              }`}
              onClick={() => setAutoSpin((value) => !value)}
              disabled={spinning}
            >
              Auto
            </button>

            <button
              className={`border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md transition-colors active:scale-[0.98] ${
                turbo ? "bg-primary/10 text-primary" : "bg-background text-foreground hover:bg-muted/30"
              }`}
              onClick={() => setTurbo((value) => !value)}
              disabled={spinning}
            >
              Turbo
            </button>

            <button
              className="border border-border font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md bg-background text-foreground hover:bg-muted/30 transition-colors active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              onClick={() => void buyBonus()}
              disabled={spinning || balance < bet * 100}
              title="Buy bonus: Wrath of Olympus"
            >
              Buy Bonus
            </button>

            <div className="col-span-2 md:col-span-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <button
                  className="border border-border px-3 py-2 rounded-md bg-background hover:bg-muted/30 transition-colors"
                  onClick={() => setBet((value) => clamp(value - 1, 1, 9999))}
                  disabled={spinning}
                >
                  −
                </button>
                <button
                  className="border border-border px-3 py-2 rounded-md bg-background hover:bg-muted/30 transition-colors"
                  onClick={() => setBet((value) => clamp(value + 1, 1, 9999))}
                  disabled={spinning}
                >
                  +
                </button>
                <button className="border border-border px-3 py-2 rounded-md bg-background text-foreground hover:bg-muted/30 transition-colors" disabled>
                  Settings
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Smart bet: <span className="text-foreground font-medium">{formatOlympusCredits(smartBet)}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </LobbyLayout>
  );
}
