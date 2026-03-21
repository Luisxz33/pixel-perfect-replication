import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/providers/AuthProvider";
import { signInWithEmailPassword, signOut, signUpWithEmailPassword } from "@/lib/auth";
import { createContext, useContext, useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

type LobbyActions = {
  login: () => Promise<void>;
  signUp: () => Promise<void>;
  logout: () => Promise<void>;
};

const LobbyActionsContext = createContext<LobbyActions | null>(null);

export function useLobbyActions() {
  return useContext(LobbyActionsContext);
}

export default function LobbyLayout({ title, children }: Props) {
  const { user, isConfigured, isReady } = useAuth();
  const [authBusy, setAuthBusy] = useState(false);

  const requireConfigured = () => {
    if (!isConfigured) {
      window.alert(
        "Supabase Auth não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local/.env"
      );
      return false;
    }
    return true;
  };

  const promptEmailPassword = (promptTitle: string) => {
    const email = window.prompt(`${promptTitle}\n\nEmail:`);
    if (!email) return null;
    const password = window.prompt(`${promptTitle}\n\nSenha:`);
    if (!password) return null;
    return { email: email.trim(), password };
  };

  const login = async () => {
    if (!requireConfigured()) return;
    const creds = promptEmailPassword("Log In");
    if (!creds) return;

    setAuthBusy(true);
    try {
      await signInWithEmailPassword(creds.email, creds.password);
    } catch (err) {
      console.error(err);
      window.alert("Falha no login. Veja o console para detalhes.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signUp = async () => {
    if (!requireConfigured()) return;
    const creds = promptEmailPassword("Sign Up");
    if (!creds) return;

    setAuthBusy(true);
    try {
      const data = await signUpWithEmailPassword(creds.email, creds.password);
      if (!data.session) {
        window.alert(
          "Cadastro criado! Se o projeto exigir confirmação, verifique seu email para ativar a conta."
        );
      }
    } catch (err) {
      console.error(err);
      window.alert("Falha ao cadastrar. Veja o console para detalhes.");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    if (!requireConfigured()) return;
    setAuthBusy(true);
    try {
      await signOut();
    } catch (err) {
      console.error(err);
      window.alert("Falha ao sair. Veja o console para detalhes.");
    } finally {
      setAuthBusy(false);
    }
  };

  const actions: LobbyActions = { login, signUp, logout };

  return (
    <LobbyActionsContext.Provider value={actions}>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <main className="ml-16 md:ml-56 transition-[margin] duration-300">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-foreground text-sm uppercase tracking-widest">{title}</h2>
            </div>

            <div className="flex items-center gap-3">
              {isReady && user?.email ? (
                <span className="hidden sm:inline text-xs text-muted-foreground">{user.email}</span>
              ) : null}

              <button
                disabled={!isReady || authBusy}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                onClick={() => {
                  if (user) {
                    void logout();
                    return;
                  }
                  void login();
                }}
              >
                {user ? "Log Out" : "Log In"}
              </button>

              <button
                disabled={!isReady || authBusy || Boolean(user)}
                className="bg-primary text-primary-foreground font-display uppercase text-xs tracking-wider px-4 py-2 rounded-md hover:bg-primary/90 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
                onClick={() => {
                  void signUp();
                }}
              >
                Sign Up
              </button>
            </div>
          </header>

          <div className="p-6 space-y-8 max-w-[1200px]">
            {children}

            <footer className="border-t border-border pt-6 pb-8 text-center">
              <p className="text-muted-foreground text-xs">
                © 2026 Grand Prix Casino. All rights reserved. 18+ Only. Gamble responsibly.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </LobbyActionsContext.Provider>
  );
}
