import heroImg from "@/assets/hero-racing.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useLobbyActions } from "@/components/LobbyLayout";

export default function HeroBanner() {
  const ref = useScrollReveal();
  const actions = useLobbyActions();

  return (
    <section ref={ref} className="reveal relative rounded-lg overflow-hidden">
      <img
        src={heroImg}
        alt="F1 racing car at night"
        className="w-full h-[340px] md:h-[420px] object-cover"
        loading="eager"
      />
      {/* Dark gradient from left */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 max-w-lg">
        <p className="text-gold font-display text-xs tracking-[0.3em] uppercase mb-2">
          Welcome Bonus
        </p>
        <h1
          className="font-display text-foreground text-3xl md:text-5xl font-bold uppercase leading-[1.05] text-balance"
        >
          Race to Win!
        </h1>
        <p className="text-secondary-foreground text-sm md:text-base mt-3 leading-relaxed">
          100% bonus up to <span className="text-gold font-semibold">R$ 1.000</span> + 50 Free Spins on your first deposit.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-display uppercase text-sm tracking-wider px-6 py-3 rounded-md transition-all duration-200 active:scale-[0.97] animate-pulse-glow"
            onClick={() => {
              void actions?.signUp();
            }}
          >
            Join the Grid Now
          </button>
          <button
            className="border border-border hover:border-foreground/30 text-foreground font-display uppercase text-sm tracking-wider px-6 py-3 rounded-md transition-all duration-200 active:scale-[0.97]"
            onClick={() => {
              void actions?.login();
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </section>
  );
}
