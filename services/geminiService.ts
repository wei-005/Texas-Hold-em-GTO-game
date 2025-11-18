import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GameStateSchema } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
You are an advanced Poker GTO (Game Theory Optimal) Solver and Coach.
Your goal is to simulate a high-stakes Texas Hold'em hand and provide real-time strategic feedback.
You act as the Game Engine (dealing cards, managing chips) AND the Opponent (Villain) AND the Coach.

Behavior:
1. Maintain the integrity of the poker game logic (stacks, pot sizes, legal moves).
2. Play the Villain optimally (or exploitatively if the user makes a mistake).
3. Provide concise, high-level GTO commentary in the 'analysis' field. Focus on ranges, equity, blockers, and frequencies.
4. Do not reveal the Villain's hand until the 'Showdown' stage.
5. Output pure JSON matching the schema.

When generating a new scenario, set up a classic interesting spot (e.g., 3-bet pot, monochrome flop, paired board).
`;

export const startNewScenario = async (): Promise<GameState> => {
  const ai = getClient();
  
  const prompt = `
    Create a new, challenging Texas Hold'em scenario. 
    - Hero is a serious player.
    - Set effective stacks to 100BB (assume 100BB = 1000 chips).
    - Start either Preflop facing a specific action, or on the Flop.
    - Ensure 'heroHand' is defined (2 cards).
    - Ensure 'board' matches the street (0 for preflop, 3 for flop).
    - Provide an initial 'analysis' describing the setup and preflop ranges involved.
    - 'isHeroTurn' should be true.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
           // We need to include heroHand here explicitly for initialization
           heroHand: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: { rank: { type: Type.STRING }, suit: { type: Type.STRING } }
             }
           },
           ...GameStateSchema.properties
        },
        required: ["heroHand", "street", "pot", "board", "heroStack", "villainStack", "isHeroTurn", "analysis"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate scenario");
  return JSON.parse(response.text) as GameState;
};

export const processPlayerAction = async (currentState: GameState, action: string, amount?: number): Promise<GameState> => {
  const ai = getClient();

  // We strip analysis from input to save tokens, the model only needs the state facts
  const statePayload = {
    street: currentState.street,
    pot: currentState.pot,
    board: currentState.board,
    heroHand: currentState.heroHand,
    heroStack: currentState.heroStack,
    villainStack: currentState.villainStack,
    currentBet: currentState.currentBet
  };

  const prompt = `
    Current Game State: ${JSON.stringify(statePayload)}
    
    HERO ACTION: ${action} ${amount ? `Amount: ${amount}` : ''}
    
    Task:
    1. Update the game state based on Hero's action.
    2. Analyze Hero's action against GTO solution (Mistake? Standard? Brilliant?).
    3. Determine Villain's response (Call, Fold, Raise) based on optimal strategy.
    4. Advance street if necessary (deal cards).
    5. Update stacks and pot.
    6. Return the NEW full Game State.
    
    Note: If Hero folds, end the game. If Showdown, reveal villain hand.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: GameStateSchema
    }
  });

  if (!response.text) throw new Error("Failed to process turn");
  const newState = JSON.parse(response.text);
  
  // Persist the static hero hand/position as the model might not return them in the simplified schema or strictly
  return {
    ...newState,
    heroHand: currentState.heroHand,
    heroPosition: currentState.heroPosition,
    villainPosition: currentState.villainPosition,
    scenarioId: currentState.scenarioId
  };
};
