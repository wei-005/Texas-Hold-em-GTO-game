
import React from 'react';
import { GameState, Player } from '../types';
import Card from './Card';

interface PokerTableProps {
  gameState: GameState | null;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  if (!gameState) return <div className="w-full h-full flex items-center justify-center text-felt-light animate-pulse">Waiting for game...</div>;

  // We need to rotate the players array so Hero is visually at the bottom (Seat index 0 for visual array)
  // Assuming the API returns an array where one player has isHero: true
  const heroIndex = gameState.players.findIndex(p => p.isHero);
  const playerCount = gameState.players.length;
  
  // Create a visual order starting from Hero and going clockwise
  const rotatedPlayers = [
    ...gameState.players.slice(heroIndex),
    ...gameState.players.slice(0, heroIndex)
  ];

  // 6-max visual positions (CSS classes)
  // Index 0 is Hero (Bottom Center)
  // Index 1 is Bottom Left
  // Index 2 is Top Left
  // Index 3 is Top Center
  // Index 4 is Top Right
  // Index 5 is Bottom Right
  const seatPositions = [
    "bottom-2 left-1/2 -translate-x-1/2", // Hero
    "bottom-20 -left-4 md:left-4 origin-bottom-left", // Left 1
    "top-20 -left-4 md:left-4 origin-top-left", // Left 2
    "top-4 left-1/2 -translate-x-1/2", // Top Center
    "top-20 -right-4 md:right-4 origin-top-right", // Right 1
    "bottom-20 -right-4 md:right-4 origin-bottom-right", // Right 2
  ];

  return (
    <div className="relative w-full max-w-5xl aspect-[1.8/1] bg-felt rounded-[10rem] border-[1rem] border-gray-800 shadow-inner-felt mx-auto flex items-center justify-center">
      
      {/* Branding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-felt-dark opacity-30 font-bold text-6xl tracking-widest select-none pointer-events-none whitespace-nowrap">
        GTO LIVE
      </div>

      {/* Board Area */}
      <div className="z-10 flex items-center justify-center gap-2 mb-8 h-24">
        {gameState.board && gameState.board.map((card, idx) => (
          <Card key={`board-${idx}`} card={card} size="lg" className="shadow-2xl" />
        ))}
        {gameState.board.length === 0 && (
             <div className="text-felt-light/50 font-bold text-xs uppercase tracking-widest border-2 border-felt-light/30 rounded-lg p-4 border-dashed">
                Preflop
             </div>
        )}
      </div>

      {/* Pot Display */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 flex flex-col items-center z-0">
        <div className="bg-black/40 backdrop-blur-sm text-gold font-mono text-lg border border-gold/30 px-6 py-1 rounded-full shadow-lg flex items-center gap-2">
           <span className="text-xs text-gray-400 uppercase">Pot</span>
           <span>${gameState.pot}</span>
        </div>
      </div>

      {/* Players */}
      {rotatedPlayers.map((player, idx) => {
        // Fallback if more players than positions defined (shouldn't happen in 6max)
        const posClass = seatPositions[idx] || "hidden"; 
        const isHero = idx === 0;
        const isWinner = gameState.winnerId === player.id;

        return (
          <div key={player.id} className={`absolute ${posClass} flex flex-col items-center transition-all duration-500 ${!player.isActive ? 'opacity-50 grayscale' : ''}`}>
            
            {/* Action Bubble */}
            {player.lastAction && !isWinner && (
                <div className={`mb-1 px-2 py-0.5 rounded text-xs font-bold shadow animate-bounce
                    ${player.lastAction.includes('Fold') ? 'bg-red-800 text-white' : 'bg-white text-black'}
                `}>
                    {player.lastAction}
                </div>
            )}

            {/* Winner Indicator */}
            {isWinner && (
                <div className="mb-2 text-gold font-bold text-xl animate-bounce drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    WINNER!
                </div>
            )}

            {/* Cards */}
            <div className={`flex gap-1 ${isHero ? 'mb-2 transform scale-110' : 'mb-1 scale-90'}`}>
                {player.isActive ? (
                    player.cards && player.cards.length > 0 ? (
                        player.cards.map((c, i) => <Card key={i} card={c} size={isHero ? 'lg' : 'sm'} />)
                    ) : (
                        <>
                           <Card hidden size={isHero ? 'lg' : 'sm'} />
                           <Card hidden size={isHero ? 'lg' : 'sm'} />
                        </>
                    )
                ) : (
                    // Folded cards ghost
                    <div className="w-10 h-14 border-2 border-white/20 rounded bg-black/20"></div>
                )}
            </div>

            {/* Dealer Button */}
            {player.isDealer && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-gray-400 shadow flex items-center justify-center text-black font-bold text-[10px] z-20">
                    D
                </div>
            )}

            {/* Player Info Plate */}
            <div className={`
                relative px-4 py-1 rounded-full border flex flex-col items-center min-w-[100px] shadow-xl z-10
                ${isHero ? 'bg-gray-900/90 border-gold' : 'bg-gray-800/90 border-gray-600'}
                ${isWinner ? 'ring-4 ring-gold ring-opacity-50' : ''}
            `}>
              <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm truncate max-w-[80px] ${isHero ? 'text-blue-200' : 'text-gray-300'}`}>
                    {player.position}
                  </span>
              </div>
              <span className="text-gold font-mono text-sm font-bold">${player.stack}</span>
            </div>

          </div>
        );
      })}

    </div>
  );
};

export default PokerTable;
