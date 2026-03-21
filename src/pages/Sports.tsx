import LobbyLayout from "@/components/LobbyLayout";
import SportsBets from "@/components/SportsBets";
import Leaderboard from "@/components/Leaderboard";

export default function Sports() {
  return (
    <LobbyLayout title="Apostas Esportivas">
      <SportsBets />
      <Leaderboard />
    </LobbyLayout>
  );
}
