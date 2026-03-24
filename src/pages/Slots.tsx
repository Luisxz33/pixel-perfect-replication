import LobbyLayout from "@/components/LobbyLayout";
import HotGames from "@/components/HotGames";
import { defaultHotGames } from "@/lib/hotGames";
import sweetBonanzaImg from "@/assets/Gemini_Generated_Image_vo6hyvvo6hyvvo6h (1).png";
import gatesOfOlympusImg from "@/assets/Gemini_Generated_Image_lugipglugipglugi.png";
import bookOfDeadBlackjackImg from "@/assets/Gemini_Generated_Image_f9qulcf9qulcf9qu.png";
import starlightPrincessImg from "@/assets/Gemini_Generated_Image_ridbweridbweridb.png";
import senninhaImg from "@/assets/Gemini_Generated_Image_6cmjx36cmjx36cmj (1).png";

const slotHotGames = defaultHotGames.map((game) => {
  switch (game.key) {
    case "poker-slots":
      return { ...game, title: "Sweet Bonanza", img: sweetBonanzaImg };
    case "roulette-raceway":
      return { ...game, title: "Book of Dead casino", img: gatesOfOlympusImg };
    case "blackjack-speedway":
      return { ...game, title: "Book of Dead casino", img: bookOfDeadBlackjackImg };
    case "live-casino-grand-prix":
      return { ...game, title: "Starlight Princess", img: starlightPrincessImg };
    default:
      return game;
  }
});

slotHotGames.push({
  key: "senninha",
  img: senninhaImg,
  title: "SENNINHA",
  subtitle: "F1 Red Car",
  category: "Slots",
});

export default function Slots() {
  return (
    <LobbyLayout title="Slots">
      <HotGames games={slotHotGames} />
    </LobbyLayout>
  );
}
