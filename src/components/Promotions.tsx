import promoChampionship from "@/assets/promo-championship.jpg";
import promoFastlane from "@/assets/promo-fastlane.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const promos = [
  {
    img: promoChampionship,
    title: "F1 Championship Special",
    desc: "Win a trip to a real Grand Prix! Place bets during race weekends to earn entries.",
    cta: "Learn More",
  },
  {
    img: promoFastlane,
    title: "Fast Lane Bonus",
    desc: "Deposit within 15 minutes and get a 50% speed bonus up to R$ 500.",
    cta: "Claim Now",
  },
];

export default function Promotions() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="reveal">
      <h2 className="font-display text-foreground text-xl md:text-2xl uppercase tracking-wide mb-5">
        ⚡ Live Promotions
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {promos.map((promo) => (
          <div
            key={promo.title}
            className="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary/40 transition-all duration-300 cursor-pointer"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={promo.img}
                alt={promo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-display text-foreground uppercase text-base font-semibold">{promo.title}</h3>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{promo.desc}</p>
              <button className="mt-3 text-primary font-display uppercase text-xs tracking-wider hover:text-primary/80 transition-colors active:scale-95">
                {promo.cta} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
