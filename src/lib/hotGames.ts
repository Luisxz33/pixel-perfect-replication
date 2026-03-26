import gamePokerSlots from "@/assets/game-poker-slots.jpg";
import gameRoulette from "@/assets/game-roulette.jpg";
import gameBlackjack from "@/assets/game-blackjack.jpg";
import gameLiveCasino from "@/assets/game-live-casino.jpg";

export type HotGame = {
  key: string;
  img: string;
  title: string;
  subtitle: string;
  category: string;
  playPath?: string;
};

export const defaultHotGames: HotGame[] = [
  { key: "poker-slots", img: gamePokerSlots, title: "Poker Slots", subtitle: "F1 Red Car", category: "Slots" },
  { key: "roulette-raceway", img: gameRoulette, title: "Roulette Raceway", subtitle: "Wheel & Paddock", category: "Slots" },
  { key: "blackjack-speedway", img: gameBlackjack, title: "Blackjack Speedway", subtitle: "Cards & Helmets", category: "Slots" },
  { key: "live-casino-grand-prix", img: gameLiveCasino, title: "Live Casino Grand Prix", subtitle: "Dealer & Track", category: "Slots" },
];
