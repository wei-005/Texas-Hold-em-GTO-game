
import { Type } from "@google/genai";

export enum Suit {
  Spades = '♠',
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣'
}

export enum Rank {
  Two = '2', Three = '3', Four = '4', Five = '5', Six = '6',
  Seven = '7', Eight = '8', Nine = '9', Ten = 'T',
  Jack = 'J', Queen = 'Q', King = 'K', Ace = 'A'
}

export interface CardData {
  rank: string;
  suit: string;
}

export enum Street {
  Preflop = 'Preflop',
  Flop = 'Flop',
  Turn = 'Turn',
  River = 'River',
  Showdown = 'Showdown'
}

export interface Player {
  id: string;
  name: string; // e.g., "Hero", "Villain 1 (BTN)"
  position: string; // BTN, SB, BB, UTG, HJ, CO
  stack: number;
  isHero: boolean;
  isActive: boolean; // Folded or not
  isDealer: boolean;
  currentBet: number; // Bet in current street
  cards?: CardData[]; // Populated for Hero, or at showdown for others
  lastAction?: string; // "Check", "Bet 50", "Fold"
}

export interface GameState {
  scenarioId: string;
  description: string;
  street: Street;
  pot: number;
  board: CardData[];
  players: Player[];
  currentToCall: number; // The amount hero needs to match
  lastActionDescription: string;
  isHeroTurn: boolean;
  gameEnded: boolean;
  winnerId?: string;
  analysis: string;
}

// Schema for Gemini response
export const GameStateSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Short narrative of what just happened." },
    street: { type: Type.STRING },
    pot: { type: Type.NUMBER },
    board: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.STRING },
          suit: { type: Type.STRING }
        }
      }
    },
    players: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          position: { type: Type.STRING },
          stack: { type: Type.NUMBER },
          isHero: { type: Type.BOOLEAN },
          isActive: { type: Type.BOOLEAN },
          isDealer: { type: Type.BOOLEAN },
          currentBet: { type: Type.NUMBER },
          lastAction: { type: Type.STRING },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { rank: { type: Type.STRING }, suit: { type: Type.STRING } }
            }
          }
        }
      }
    },
    currentToCall: { type: Type.NUMBER, description: "Amount hero needs to call." },
    lastActionDescription: { type: Type.STRING },
    isHeroTurn: { type: Type.BOOLEAN },
    gameEnded: { type: Type.BOOLEAN },
    winnerId: { type: Type.STRING },
    analysis: { type: Type.STRING, description: "GTO strategic analysis." }
  },
  required: ["street", "pot", "board", "players", "isHeroTurn", "analysis"]
};
