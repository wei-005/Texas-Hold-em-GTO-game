
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GameStateSchema } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
You are an advanced Poker GTO Solver and Engine.
You simulate a **6-max Texas Hold'em** game.
You control the Game State and all Opponents (Villains).
One player is the "Hero" (User).

Rules:
1. **Multiplayer**: Simulate 6 players (Seat 1-6). Hero is one of them.
2. **Positions**: Assign standard positions: BTN, SB, BB, UTG, HJ, CO.
3. **Integrity**: Manage pot, stacks, and legal moves accurately.
4. **Strategy**: Play opponents optimally (GTO) or exploitatively.
5. **Showdown**: Do not reveal opponent cards until 'Showdown' phase.
6. **Analysis**: In the 'analysis' field, explain the strategic situation for the Hero (Ranges, EV, Equity).
7. **Output**: Pure JSON matching the schema.

Behavior:
- If Hero folds, simulate the rest of the hand quickly or just end it and award pot to winner.
- If it is Hero's turn, wait.
`;

export const startNewScenario = async (): Promise<GameState> => {
  const ai = getClient();
  
  const prompt = `
    Create a new interesting 6-max Texas Hold'em scenario.
    - Effective stacks: 100BB (1000 chips).
    - Determine Hero's position randomly or pick an interesting spot (e.g., Hero in CO vs BTN 3-bet).
    - Define 6 players in the 'players' array.
    - Ensure Hero has 2 hole cards defined in 'cards'.
    - Opponents should have empty 'cards' arrays unless it is Showdown (initially invisible).
    - Set 'isHeroTurn' to true.
    - Provide initial GTO analysis.
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

  if (!response.text) throw new Error("Failed to generate scenario");
  return JSON.parse(response.text) as GameState;
};

export const processPlayerAction = async (currentState: GameState, action: string, amount?: number): Promise<GameState> => {
  const ai = getClient();

  // Strip heavy history/analysis to save tokens, keep state facts
  const statePayload = {
    street: currentState.street,
    pot: currentState.pot,
    board: currentState.board,
    players: currentState.players.map(p => ({
      ...p,
      // ensure we send hero cards back so AI remembers them
      cards: p.isHero ? p.cards : (currentState.street === 'Showdown' ? p.cards : []) 
    })),
    currentToCall: currentState.currentToCall
  };

  const prompt = `
    Current State: ${JSON.stringify(statePayload)}
    HERO ACTION: ${action} ${amount ? `Amount: ${amount}` : ''}
    
    Task:
    1. Validate Hero action.
    2. Update stacks/pot.
    3. If hand continues, simulate actions for other players until it returns to Hero or street ends.
    4. If street ends, deal next card(s).
    5. Provide GTO analysis of Hero's move and the new situation.
    6. If Showdown, reveal participating opponent hands in 'cards'.
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
  
  return {
    ...newState,
    scenarioId: currentState.scenarioId
  };
};
