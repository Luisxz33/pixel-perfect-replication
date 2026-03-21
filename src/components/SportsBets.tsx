import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAuth } from "@/providers/AuthProvider";
import { logSportsSelection, placeBet } from "@/lib/casino";
import { useState } from "react";

type ThreeWayMarket = {
  kind: "threeway";
  home: number;
  draw: number;
  away: number;
};

type TwoWayMarket = {
  kind: "twoway";
  home: number;
  away: number;
};

type Market = ThreeWayMarket | TwoWayMarket;

function isThreeWayMarket(market: Market): market is ThreeWayMarket {
  return market.kind === "threeway";
}

type EventItem = {
  id: string;
  league: string;
  start: string;
  home: string;
  away: string;
  market: Market;
};

type SportSection = {
  title: string;
  subtitle: string;
  events: EventItem[];
};

type SlipItem = {
  eventId: string;
  sportKey: string;
  marketKey: string;
  selectionKey: string;
  selectionLabel: string;
  odd: number;
  home: string;
  away: string;
  league: string;
  start: string;
};

const sections: SportSection[] = [
  {
    title: "⚽ Futebol",
    subtitle: "1X2 (Casa / Empate / Fora)",
    events: [
      {
        id: "soccer-1",
        league: "Brasil • Série A",
        start: "Hoje 21:30",
        home: "Flamengo",
        away: "Palmeiras",
        market: { kind: "threeway", home: 2.10, draw: 3.25, away: 3.40 },
      },
      {
        id: "soccer-2",
        league: "Inglaterra • Premier League",
        start: "Amanhã 16:00",
        home: "Arsenal",
        away: "Liverpool",
        market: { kind: "threeway", home: 2.55, draw: 3.35, away: 2.75 },
      },
      {
        id: "soccer-3",
        league: "Espanha • LaLiga",
        start: "Sáb 18:30",
        home: "Real Madrid",
        away: "Barcelona",
        market: { kind: "threeway", home: 2.30, draw: 3.50, away: 2.85 },
      },
    ],
  },
  {
    title: "🏀 Basquete",
    subtitle: "Vencedor (Casa / Fora)",
    events: [
      {
        id: "basket-1",
        league: "NBA",
        start: "Hoje 23:00",
        home: "Lakers",
        away: "Warriors",
        market: { kind: "twoway", home: 1.95, away: 1.90 },
      },
      {
        id: "basket-2",
        league: "EuroLeague",
        start: "Amanhã 15:45",
        home: "Real Madrid",
        away: "Fenerbahçe",
        market: { kind: "twoway", home: 1.70, away: 2.20 },
      },
      {
        id: "basket-3",
        league: "NBB (Brasil)",
        start: "Dom 19:00",
        home: "Franca",
        away: "Minas",
        market: { kind: "twoway", home: 1.85, away: 1.98 },
      },
    ],
  },
  {
    title: "🏐 Vôlei",
    subtitle: "Vencedor (Casa / Fora)",
    events: [
      {
        id: "volley-1",
        league: "Superliga (Brasil)",
        start: "Hoje 20:00",
        home: "Sada Cruzeiro",
        away: "SESI Bauru",
        market: { kind: "twoway", home: 1.62, away: 2.35 },
      },
      {
        id: "volley-2",
        league: "Itália • Serie A1",
        start: "Amanhã 14:00",
        home: "Trentino",
        away: "Perugia",
        market: { kind: "twoway", home: 2.05, away: 1.75 },
      },
      {
        id: "volley-3",
        league: "Liga das Nações",
        start: "Sáb 12:00",
        home: "Brasil",
        away: "Polônia",
        market: { kind: "twoway", home: 2.20, away: 1.68 },
      },
    ],
  },
];

function OddButton({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-2 transition-colors rounded-md px-3 py-2 border active:scale-[0.99] ${
        selected
          ? "bg-sidebar-accent text-sidebar-accent-foreground border-primary/40"
          : "bg-muted/30 hover:bg-muted/50 border-border"
      }`}
    >
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium tabular-nums">{value.toFixed(2)}</span>
    </button>
  );
}

export default function SportsBets() {
  const ref = useScrollReveal();
  const { user, isReady } = useAuth();
  const [selectedByEvent, setSelectedByEvent] = useState<Record<string, string>>({});
  const [slipByEvent, setSlipByEvent] = useState<Record<string, SlipItem>>({});

  const handleSelect = async (params: {
    sportKey: string;
    eventId: string;
    marketKey: string;
    selectionKey: string;
    selectionLabel: string;
    odd: number;
    metadata: Record<string, unknown>;
    slip: Omit<SlipItem, "odd" | "selectionKey" | "selectionLabel" | "sportKey" | "marketKey" | "eventId">;
  }) => {
    if (!isReady || !user) {
      window.alert("Faça login para registrar sua seleção.");
      return;
    }

    setSelectedByEvent((prev) => ({ ...prev, [params.eventId]: params.selectionKey }));
    setSlipByEvent((prev) => ({
      ...prev,
      [params.eventId]: {
        eventId: params.eventId,
        sportKey: params.sportKey,
        marketKey: params.marketKey,
        selectionKey: params.selectionKey,
        selectionLabel: params.selectionLabel,
        odd: params.odd,
        ...params.slip,
      },
    }));

    try {
      await logSportsSelection({
        sportKey: params.sportKey,
        eventId: params.eventId,
        marketKey: params.marketKey,
        selectionKey: params.selectionKey,
        odd: params.odd,
        metadata: params.metadata,
      });
    } catch (err) {
      console.error(err);
      window.alert("Não foi possível registrar sua seleção. Veja o console para detalhes.");
    }
  };

  const slipItems: SlipItem[] = sections
    .flatMap((s) => s.events)
    .map((ev) => slipByEvent[ev.id])
    .filter(Boolean);

  const confirmBet = async () => {
    if (!isReady || !user) {
      window.alert("Faça login para confirmar a aposta.");
      return;
    }

    if (slipItems.length === 0) {
      window.alert("Selecione pelo menos uma odd.");
      return;
    }

    const stakeRaw = window.prompt("Valor da aposta:");
    if (!stakeRaw) return;

    const stake = Number(String(stakeRaw).replace(",", "."));
    if (!Number.isFinite(stake) || stake <= 0) {
      window.alert("Valor inválido.");
      return;
    }

    try {
      await placeBet("sports-betslip", stake, {
        slip: slipItems,
      });

      setSelectedByEvent({});
      setSlipByEvent({});
      window.alert("Aposta registrada!");
    } catch (err) {
      console.error(err);
      window.alert("Não foi possível confirmar a aposta. Veja o console para detalhes.");
    }
  };

  return (
    <section ref={ref} className="reveal space-y-6">
      <div>
        <h2 className="font-display text-foreground text-xl md:text-2xl uppercase tracking-wide">
          🏟️ Apostas Esportivas
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Jogos e odds de exemplo (layout inspirado de forma geral em casas de aposta).
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-foreground uppercase text-base font-semibold">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest">
                    {section.subtitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Hoje</span>
              </div>

              <div className="divide-y divide-border">
                {section.events.map((ev) => {
                  const market = ev.market;
                  const commonSlip = {
                    home: ev.home,
                    away: ev.away,
                    league: ev.league,
                    start: ev.start,
                  };

                  return (
                    <div key={ev.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {ev.league} • {ev.start}
                          </p>
                          <p className="text-foreground text-sm font-medium mt-1 truncate">
                            {ev.home} <span className="text-muted-foreground">vs</span> {ev.away}
                          </p>
                        </div>

                        {isThreeWayMarket(market) ? (
                          <div className="grid grid-cols-3 gap-2 w-[330px] shrink-0">
                            <OddButton
                              label="1"
                              value={market.home}
                              selected={selectedByEvent[ev.id] === "home"}
                              onClick={() => {
                                void handleSelect({
                                  sportKey: "soccer",
                                  eventId: ev.id,
                                  marketKey: "1x2",
                                  selectionKey: "home",
                                  selectionLabel: "1",
                                  odd: market.home,
                                  slip: commonSlip,
                                  metadata: {
                                    ...commonSlip,
                                  },
                                });
                              }}
                            />
                            <OddButton
                              label="X"
                              value={market.draw}
                              selected={selectedByEvent[ev.id] === "draw"}
                              onClick={() => {
                                void handleSelect({
                                  sportKey: "soccer",
                                  eventId: ev.id,
                                  marketKey: "1x2",
                                  selectionKey: "draw",
                                  selectionLabel: "X",
                                  odd: market.draw,
                                  slip: commonSlip,
                                  metadata: {
                                    ...commonSlip,
                                  },
                                });
                              }}
                            />
                            <OddButton
                              label="2"
                              value={market.away}
                              selected={selectedByEvent[ev.id] === "away"}
                              onClick={() => {
                                void handleSelect({
                                  sportKey: "soccer",
                                  eventId: ev.id,
                                  marketKey: "1x2",
                                  selectionKey: "away",
                                  selectionLabel: "2",
                                  odd: market.away,
                                  slip: commonSlip,
                                  metadata: {
                                    ...commonSlip,
                                  },
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 w-[220px] shrink-0">
                            <OddButton
                              label="Casa"
                              value={market.home}
                              selected={selectedByEvent[ev.id] === "home"}
                              onClick={() => {
                                const sportKey = ev.id.startsWith("basket-") ? "basketball" : "volleyball";
                                void handleSelect({
                                  sportKey,
                                  eventId: ev.id,
                                  marketKey: "winner",
                                  selectionKey: "home",
                                  selectionLabel: "Casa",
                                  odd: market.home,
                                  slip: commonSlip,
                                  metadata: {
                                    ...commonSlip,
                                  },
                                });
                              }}
                            />
                            <OddButton
                              label="Fora"
                              value={market.away}
                              selected={selectedByEvent[ev.id] === "away"}
                              onClick={() => {
                                const sportKey = ev.id.startsWith("basket-") ? "basketball" : "volleyball";
                                void handleSelect({
                                  sportKey,
                                  eventId: ev.id,
                                  marketKey: "winner",
                                  selectionKey: "away",
                                  selectionLabel: "Fora",
                                  odd: market.away,
                                  slip: commonSlip,
                                  metadata: {
                                    ...commonSlip,
                                  },
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-1 lg:sticky lg:top-20">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-foreground uppercase text-base font-semibold">Bet Slip</h3>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                {slipItems.length}
              </span>
            </div>

            <div className="p-5 space-y-3">
              {slipItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Selecione uma odd para montar seu cupom.</p>
              ) : (
                <div className="space-y-2">
                  {slipItems.map((item) => (
                    <div key={item.eventId} className="border border-border rounded-md p-3 bg-muted/20">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {item.league} • {item.start}
                      </p>
                      <p className="text-sm text-foreground font-medium mt-1">
                        {item.home} <span className="text-muted-foreground">vs</span> {item.away}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          {item.selectionLabel}
                        </span>
                        <span className="text-sm text-foreground font-medium tabular-nums">
                          {item.odd.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                disabled={!isReady || !user || slipItems.length === 0}
                className="w-full bg-primary text-primary-foreground font-display uppercase text-xs tracking-wider px-4 py-3 rounded-md hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                onClick={() => {
                  void confirmBet();
                }}
              >
                Confirmar aposta
              </button>
              {!user ? (
                <p className="text-[11px] text-muted-foreground">
                  Faça login para confirmar.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
