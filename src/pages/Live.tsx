import LobbyLayout from "@/components/LobbyLayout";
import HotGames from "@/components/HotGames";
import Leaderboard from "@/components/Leaderboard";

export default function Live() {
  return (
    <LobbyLayout title="Cassino Ao Vivo">
      <HotGames />
      <Leaderboard />
    </LobbyLayout>
  );
}
