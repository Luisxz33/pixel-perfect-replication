import { useScrollReveal } from "@/hooks/useScrollReveal";

type StandingRow = {
  pos: number;
  name: string;
  team: string;
  points: number;
};

const driverStandings: StandingRow[] = [
  { pos: 1, name: "George Russell", team: "Mercedes", points: 51 },
  { pos: 2, name: "Kimi Antonelli", team: "Mercedes", points: 47 },
  { pos: 3, name: "Charles Leclerc", team: "Ferrari", points: 34 },
  { pos: 4, name: "Lewis Hamilton", team: "Ferrari", points: 33 },
  { pos: 5, name: "Oliver Bearman", team: "Haas", points: 17 },
  { pos: 6, name: "Lando Norris", team: "McLaren", points: 15 },
  { pos: 7, name: "Pierre Gasly", team: "Alpine", points: 9 },
  { pos: 8, name: "Max Verstappen", team: "Red Bull", points: 8 },
  { pos: 9, name: "Liam Lawson", team: "Racing Bulls", points: 8 },
  { pos: 10, name: "Arvid Lindblad", team: "Racing Bulls", points: 4 },
];

const constructorStandings: StandingRow[] = [
  { pos: 1, name: "Mercedes", team: "Construtores", points: 98 },
  { pos: 2, name: "Ferrari", team: "Construtores", points: 67 },
  { pos: 3, name: "McLaren", team: "Construtores", points: 18 },
  { pos: 4, name: "Haas", team: "Construtores", points: 17 },
  { pos: 5, name: "Red Bull", team: "Construtores", points: 12 },
  { pos: 6, name: "Racing Bulls", team: "Construtores", points: 12 },
  { pos: 7, name: "Alpine", team: "Construtores", points: 1 },
  { pos: 8, name: "Audi", team: "Construtores", points: 2 },
  { pos: 9, name: "Williams", team: "Construtores", points: 2 },
  { pos: 10, name: "Cadillac", team: "Construtores", points: 0 },
];

const posColors: Record<number, string> = {
  1: "text-gold",
  2: "text-secondary-foreground",
  3: "text-primary",
};

const formatPoints = (points: number) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(points);

export default function Leaderboard() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="reveal bg-card rounded-lg border border-border p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-display text-foreground text-xl uppercase tracking-wide">
          🏁 F1 — Campeonato Mundial
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Pontos</span>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="font-display text-foreground uppercase text-sm tracking-wide mb-2">
            Pilotos
          </h3>
          <div className="space-y-2">
            {driverStandings.map((row) => (
              <div
                key={`${row.pos}-${row.name}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 hover:bg-muted/50 ${
                  row.pos <= 3 ? "bg-muted/30" : ""
                }`}
              >
                <span
                  className={`font-display text-lg font-bold w-8 text-center ${
                    posColors[row.pos] || "text-muted-foreground"
                  }`}
                >
                  {row.pos}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium truncate">{row.name}</p>
                  <p className="text-muted-foreground text-[11px] uppercase tracking-widest truncate">
                    {row.team}
                  </p>
                </div>
                <span className="text-gold font-display font-semibold text-sm tabular-nums">
                  {formatPoints(row.points)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-foreground uppercase text-sm tracking-wide mb-2">
            Construtores
          </h3>
          <div className="space-y-2">
            {constructorStandings.map((row) => (
              <div
                key={`${row.pos}-${row.name}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 hover:bg-muted/50 ${
                  row.pos <= 3 ? "bg-muted/30" : ""
                }`}
              >
                <span
                  className={`font-display text-lg font-bold w-8 text-center ${
                    posColors[row.pos] || "text-muted-foreground"
                  }`}
                >
                  {row.pos}
                </span>
                <span className="text-foreground text-sm font-medium flex-1 truncate">{row.name}</span>
                <span className="text-gold font-display font-semibold text-sm tabular-nums">
                  {formatPoints(row.points)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
