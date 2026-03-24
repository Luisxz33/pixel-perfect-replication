import { useScrollReveal } from "@/hooks/useScrollReveal";
import { logGameAccess } from "@/lib/casino";
import { NavLink } from "@/components/NavLink";
import { defaultHotGames, type HotGame } from "@/lib/hotGames";

type HotGamesProps = {
  games?: HotGame[];
};

export default function HotGames({ games = defaultHotGames }: HotGamesProps) {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="reveal">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-foreground text-xl md:text-2xl uppercase tracking-wide">
          🔥 kingdom of legends
        </h2>
        <NavLink
          to="/slots"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium"
        >
          View All
        </NavLink>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map((game, i) => (
          <div
            key={game.key}
            className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer"
            style={{ transitionDelay: `${i * 60}ms` }}
            onClick={() => {
              void logGameAccess(game.key, {
                title: game.title,
                category: game.category,
              });
            }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={game.img}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-primary font-medium">{game.category}</p>
              <h3 className="font-display text-foreground text-sm font-semibold mt-0.5 uppercase">{game.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{game.subtitle}</p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <NavLink
                to="/candy-multiverse"
                className="bg-primary text-primary-foreground font-display uppercase text-xs tracking-wider px-5 py-2.5 rounded-md active:scale-95 transition-transform"
              >
                Play Now
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
