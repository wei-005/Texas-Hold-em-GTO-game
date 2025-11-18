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

export enum PlayerPosition {
  BTN = 'BTN',
  SB = 'SB',
  BB = 'BB',
  UTG = 'UTG',
  HJ = 'HJ',
  CO = 'CO'
}

export interface GameState {
  scenarioId: string;
  description: string;
  street: Street;
  pot: number;
  board: CardData[];
  heroHand: CardData[];
  heroStack: number;
  villainStack: number;
  heroPosition: string;
  villainPosition: string;
  currentBet: number; // The amount to call
  lastActionDescription: string;
  isHeroTurn: boolean;
  gameEnded: boolean;
  analysis: string; // The GTO feedback for the previous move
}

// Schema for Gemini response
export const GameStateSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Short narrative of what just happened." },
    street: { type: Type.STRING, description: "Current street: Preflop, Flop, Turn, River, Showdown" },
    pot: { type: Type.NUMBER, description: "Total chips in pot" },
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
    heroStack: { type: Type.NUMBER },
    villainStack: { type: Type.NUMBER },
    currentBet: { type: Type.NUMBER, description: "Amount hero needs to match to call, or 0 if checked." },
    lastActionDescription: { type: Type.STRING, description: "Description of the last action (e.g., Villain bets 50)." },
    isHeroTurn: { type: Type.BOOLEAN },
    gameEnded: { type: Type.BOOLEAN },
    analysis: { type: Type.STRING, description: "GTO strategic analysis of the previous move and current situation." },
    villainHand: {
       type: Type.ARRAY,
       description: "Reveal villain hand only at Showdown, otherwise empty.",
       items: {
        type: Type.OBJECT,
        properties: {
          rank: { type: Type.STRING },
          suit: { type: Type.STRING }
        }
      }
    }
  },
  required: ["street", "pot", "board", "heroStack", "villainStack", "isHeroTurn", "analysis"]
};