import { assertSupabase } from "@/lib/supabaseClient";

export type GameAccessMetadata = Record<string, unknown>;

export async function logGameAccess(gameKey: string, metadata: GameAccessMetadata = {}) {
  const supabase = assertSupabase();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;

  await supabase.rpc("log_game_access", {
    game_key: gameKey,
    metadata,
  });
}

export async function getBalance(): Promise<number> {
  const supabase = assertSupabase();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return 0;

  const { data, error } = await supabase.rpc("wallet_get_balance");
  if (error) throw error;

  // numeric pode vir como string dependendo do driver
  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function placeBet(gameKey: string, amount: number, metadata: Record<string, unknown> = {}) {
  const supabase = assertSupabase();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("Você precisa estar logado para apostar.");
  }

  const { data, error } = await supabase.rpc("wallet_place_bet", {
    game_key: gameKey,
    amount,
    metadata,
  });

  if (error) throw error;
  return data as string;
}

export type SportsSelectionPayload = {
  sportKey: string;
  eventId: string;
  marketKey: string;
  selectionKey: string;
  odd: number;
  metadata?: Record<string, unknown>;
};

export async function logSportsSelection(payload: SportsSelectionPayload) {
  const supabase = assertSupabase();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("Você precisa estar logado para registrar uma seleção.");
  }

  const { error } = await supabase.rpc("log_sports_selection", {
    sport_key: payload.sportKey,
    event_id: payload.eventId,
    market_key: payload.marketKey,
    selection_key: payload.selectionKey,
    odd: payload.odd,
    metadata: payload.metadata ?? {},
  });

  if (error) throw error;
}
