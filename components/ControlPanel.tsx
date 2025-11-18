
import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { audioService } from '../services/audioService';

interface ControlPanelProps {
  gameState: GameState;
  onAction: (action: string, amount?: number) => void;
  disabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ gameState, onAction, disabled }) => {
  const hero = gameState.players.find(p => p.isHero);
  const heroStack = hero ? hero.stack : 0;
  
  const [raiseAmount, setRaiseAmount] = useState<number>(0);

  useEffect(() => {
      // Reset reasonable default raise
      const minRaise = (gameState.currentToCall || 0) * 2 || (gameState.pot > 0 ? Math.floor(gameState.pot / 3) : 50);
      setRaiseAmount(Math.min(heroStack, minRaise));
  }, [gameState.currentToCall, gameState.pot, heroStack]);
  
  const canCheck = gameState.currentToCall === 0;
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(Number(e.target.value));
  };

  const handleActionClick = (type: string, val?: number) => {
      if (type === 'Fold') audioService.playFoldSound();
      else if (type === 'Check') audioService.playCheckSound();
      else audioService.playChipSound();

      onAction(type, val);
  };

  if (!hero) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 md:mt-6 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 z-20 relative">
      
      {/* Actions */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Your Action</h3>
            {gameState.currentToCall > 0 && (
                <span className="text-red-400 text-sm font-mono animate-pulse">To Call: ${gameState.currentToCall}</span>
            )}
        </div>

        <div className="grid grid-cols-3 gap-3 h-full">
            <button
                onClick={() => handleActionClick('Fold')}
                disabled={disabled}
                className="bg-red-900/80 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 font-bold rounded-lg border border-red-700 transition-colors py-4 shadow-inner"
            >
                FOLD
            </button>

            <button
                onClick={() => handleActionClick(canCheck ? 'Check' : 'Call')}
                disabled={disabled}
                className="bg-blue-900/80 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-blue-200 font-bold rounded-lg border border-blue-700 transition-colors py-4 shadow-inner"
            >
                {canCheck ? 'CHECK' : 'CALL'}
            </button>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => handleActionClick('Raise', raiseAmount)}
                    disabled={disabled}
                    className="flex-1 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg border border-yellow-600 transition-colors shadow-lg py-2"
                >
                    RAISE ${raiseAmount}
                </button>
                <input 
                    type="range" 
                    min={gameState.currentToCall * 2 || 20} 
                    max={heroStack} 
                    step={10}
                    value={raiseAmount}
                    onChange={handleSliderChange}
                    disabled={disabled}
                    className="w-full accent-gold h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
      </div>

      {/* Info / Last Action */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col">
        <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">Hand Status</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
             <div className="text-xs text-gray-500 uppercase">Previous Action</div>
            <p className="text-md font-medium text-white leading-tight">
                {gameState.lastActionDescription || "Game Start"}
            </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
            <span>Street: <span className="text-gold font-bold">{gameState.street}</span></span>
        </div>
      </div>

    </div>
  );
};

export default ControlPanel;
