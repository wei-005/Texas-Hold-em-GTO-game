import React from 'react';
import { GameState } from '../types';
import Card from './Card';

interface PokerTableProps {
  gameState: GameState | null;
  villainHandRevealed?: boolean;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState, villainHandRevealed }) => {
  if (!gameState) return <div className="w-full h-full flex items-center justify-center text-felt-light">Waiting for game...</div>;

  return (
    <div className="relative w-full max-w-4xl aspect-[2/1] bg-felt rounded-[10rem] border-[1rem] border-gray-800 shadow-inner-felt mx-auto flex flex-col items-center justify-center p-8">
      
      {/* Table Branding */}
      <div className="absolute text-felt-dark opacity-30 font-bold text-4xl tracking-widest select-none pointer-events-none">
        GTO MASTER
      </div>

      {/* Villain Area (Top) */}
      <div className="absolute top-4 flex flex-col items-center gap-2">
        <div className="flex gap-2">
            {/* If showing down, show cards, else backs */}
            {villainHandRevealed && (gameState.gameEnded || gameState.street === 'Showdown') && (gameState as any).villainHand ? (
                (gameState as any).villainHand.map((c: any, i: number) => <Card key={i} card={c} />)
            ) : (
                <>
                    <Card hidden />
                    <Card hidden />
                </>
            )}
        </div>
        <div className="bg-gray-900/80 px-4 py-1 rounded-full text-white border border-gold/50 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-bold">Villain</span>
          <span className="text-gold font-mono">${gameState.villainStack}</span>
        </div>
        {/* Villain Action Bubble */}
        {!gameState.isHeroTurn && !gameState.gameEnded && (
            <div className="mt-2 bg-white text-black px-3 py-1 rounded-tr-xl rounded-bl-xl rounded-br-xl text-sm font-bold shadow animate-bounce">
                Thinking...
            </div>
        )}
      </div>

      {/* Board Area (Center) */}
      <div className="flex items-center justify-center gap-3 my-4 h-28 perspective-1000">
        {gameState.board && gameState.board.map((card, idx) => (
          <Card key={`${card.rank}-${card.suit}-${idx}`} card={card} size="lg" />
        ))}
        {gameState.board.length === 0 && (
             <div className="text-felt-light font-bold text-sm uppercase tracking-widest border-2 border-felt-light/30 rounded-lg p-4">
                Preflop
             </div>
        )}
      </div>

      {/* Pot Display */}
      <div className="absolute top-1/2 -translate-y-1/2 right-12 md:right-24 flex flex-col items-center">
        <div className="text-felt-light font-bold uppercase text-xs mb-1">Total Pot</div>
        <div className="bg-black/40 backdrop-blur-sm text-gold font-mono text-xl border border-gold/30 px-4 py-2 rounded-lg shadow-lg">
          ${gameState.pot}
        </div>
      </div>

      {/* Hero Area (Bottom) */}
      <div className="absolute bottom-4 flex flex-col items-center gap-2">
        {/* Hero Action Bubble (if recently acted) */}
        {/* <div className="mb-2 bg-gold text-black px-3 py-1 rounded-tl-xl rounded-tr-xl rounded-br-xl text-sm font-bold shadow">
             Checked
        </div> */}

        <div className="flex gap-2 transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
          {gameState.heroHand.map((card, idx) => (
            <Card key={idx} card={card} size="lg" />
          ))}
        </div>
        <div className="bg-gray-900/90 px-6 py-2 rounded-full text-white border-2 border-gold flex items-center gap-3 shadow-2xl z-10">
          <span className="font-bold text-lg text-blue-200">HERO</span>
          <div className="h-4 w-[1px] bg-gray-600"></div>
          <span className="text-gold font-mono text-xl font-bold">${gameState.heroStack}</span>
        </div>
      </div>
      
      {/* Dealer Button */}
      {/* Determine pos later, just aesthetic for now */}
      <div className="absolute top-[35%] left-[20%] w-8 h-8 bg-white rounded-full border-2 border-gray-300 shadow-md flex items-center justify-center font-bold text-black text-xs">
        D
      </div>

    </div>
  );
};

export default PokerTable;
