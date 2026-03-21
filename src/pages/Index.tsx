import LobbyLayout from "@/components/LobbyLayout";
import HeroBanner from "@/components/HeroBanner";
import HotGames from "@/components/HotGames";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  return (
    <LobbyLayout title="Lobby">
      <HeroBanner />
      <HotGames />

      <Leaderboard />
    </LobbyLayout>
  );
};

export default Index;
