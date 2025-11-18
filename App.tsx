import React, { useState, useEffect } from 'react';
import PokerTable from './components/PokerTable';
import ControlPanel from './components/ControlPanel';
import AnalysisFeed from './components/AnalysisFeed';
import { startNewScenario, processPlayerAction } from './services/geminiService';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]);

  // Initialize metadata or setup only once if needed.
  // Since we don't need cameras, we just skip manual metadata calls here for simplicity as per instructions to include them in generated files.

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    setGameState(null);
    setAnalysisHistory([]);
    try {
      const initial = await startNewScenario();
      setGameState(initial);
      if (initial.analysis) {
        setAnalysisHistory([initial.analysis]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start scenario. Please check API Key configuration or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, amount?: number) => {
    if (!gameState) return;
    
    setLoading(true);
    setError(null);
    
    // Optimistic update (optional, skipping for strict correctness with GTO engine)
    
    try {
      const newState = await processPlayerAction(gameState, action, amount);
      setGameState(newState);
      if (newState.analysis) {
        setAnalysisHistory(prev => [...prev, newState.analysis]);
      }
    } catch (err) {
      console.error(err);
      setError("Error processing move. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="p-4 flex justify-between items-center bg-gray-900 border-b border-gray-800 z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center text-black font-bold text-lg shadow-lg">♠</div>
             <h1 className="text-xl font-bold tracking-wide">GTO Poker Master</h1>
          </div>
          <button 
            onClick={handleStartGame} 
            disabled={loading}
            className="bg-gold hover:bg-gold-light text-black font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Dealing..." : "New Scenario"}
          </button>
        </header>

        {/* Game Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
           {error && (
             <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg max-w-md text-center">
               {error}
             </div>
           )}
           
           {!gameState && !loading && !error && (
             <div className="text-center max-w-lg">
               <h2 className="text-3xl font-bold mb-4 text-white">Master GTO Strategy</h2>
               <p className="text-gray-400 mb-8">
                 Generate unlimited classic Texas Hold'em scenarios. 
                 Play against a world-class AI engine that adapts and explains every move.
               </p>
               <button 
                 onClick={handleStartGame}
                 className="bg-gold text-black font-bold text-xl py-3 px-8 rounded-lg shadow-card hover:shadow-gold/50 transition-all"
               >
                 Deal Cards
               </button>
             </div>
           )}

           {gameState && (
             <>
               <PokerTable gameState={gameState} villainHandRevealed={gameState.gameEnded} />
               <ControlPanel 
                  gameState={gameState} 
                  onAction={handleAction} 
                  disabled={loading || !gameState.isHeroTurn || gameState.gameEnded} 
               />
               {gameState.gameEnded && (
                 <div className="mt-6">
                   <button 
                     onClick={handleStartGame}
                     className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100"
                   >
                     Next Hand
                   </button>
                 </div>
               )}
             </>
           )}
        </main>
        
        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gold font-bold tracking-widest animate-pulse">CALCULATING GTO...</span>
                </div>
            </div>
        )}
      </div>

      {/* Sidebar Analysis */}
      <AnalysisFeed analysisHistory={analysisHistory} />

    </div>
  );
};

export default App;