import { Home, Gamepad2, Radio, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/providers/AuthProvider";
import { getBalance } from "@/lib/casino";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Trophy, label: "Apostas Esportivas", to: "/sports" },
  { icon: Radio, label: "Cassino Ao Vivo", to: "/live" },
  { icon: Gamepad2, label: "Slots", to: "/slots" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isReady } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isReady) return;
      if (!user) {
        setBalance(null);
        return;
      }

      try {
        const next = await getBalance();
        if (!cancelled) setBalance(next);
      } catch (err) {
        console.error(err);
        if (!cancelled) setBalance(null);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  const formattedBalance =
    balance === null
      ? "R$ —"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(balance);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar z-50 border-r border-sidebar-border flex flex-col transition-[width] duration-300 ease-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shrink-0">
          <span className="font-display text-primary-foreground text-sm font-bold">GP</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-display text-foreground text-sm font-bold tracking-wide whitespace-nowrap">
              GRAND PRIX
            </span>
            <span className="block text-gold text-[10px] font-medium tracking-widest uppercase">
              Casino
            </span>
          </div>
        )}
      </div>

      {/* Balance */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saldo</p>
          <p className="text-gold font-display text-lg font-bold">{formattedBalance}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm transition-colors duration-150 active:scale-[0.97] text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground [&>svg]:text-primary"
          >
            <item.icon size={18} />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 border-t border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
