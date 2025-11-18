import React, { useState } from 'react';
import { GameState } from '../types';

interface ControlPanelProps {
  gameState: GameState;
  onAction: (action: string, amount?: number) => void;
  disabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ gameState, onAction, disabled }) => {
  const [raiseAmount, setRaiseAmount] = useState<number>(
    Math.min(gameState.heroStack, (gameState.currentBet || 0) * 2 || (gameState.pot > 0 ? Math.floor(gameState.pot / 2) : 50))
  );

  const canCheck = gameState.currentBet === 0;
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(Number(e.target.value));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
      
      {/* Actions */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Your Action</h3>
            {gameState.currentBet > 0 && (
                <span className="text-red-400 text-sm font-mono">To Call: ${gameState.currentBet}</span>
            )}
        </div>

        <div className="grid grid-cols-3 gap-3 h-full">
            <button
                onClick={() => onAction('Fold')}
                disabled={disabled}
                className="bg-red-900/80 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-200 font-bold rounded-lg border border-red-700 transition-colors py-4"
            >
                FOLD
            </button>

            <button
                onClick={() => onAction(canCheck ? 'Check' : 'Call')}
                disabled={disabled}
                className="bg-blue-900/80 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-blue-200 font-bold rounded-lg border border-blue-700 transition-colors py-4"
            >
                {canCheck ? 'CHECK' : 'CALL'}
            </button>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => onAction('Raise', raiseAmount)}
                    disabled={disabled}
                    className="flex-1 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg border border-yellow-600 transition-colors shadow-lg py-2"
                >
                    RAISE ${raiseAmount}
                </button>
                <input 
                    type="range" 
                    min={gameState.currentBet * 2 || 50} 
                    max={gameState.heroStack} 
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
        <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">Last Action</h3>
        <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg font-medium text-white">
                {gameState.lastActionDescription || "Scenario Start"}
            </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm text-gray-400">
            <span>Street: <span className="text-white">{gameState.street}</span></span>
        </div>
      </div>

    </div>
  );
};

export default ControlPanel;
