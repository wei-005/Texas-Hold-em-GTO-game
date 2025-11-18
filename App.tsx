
import React, { useState, useEffect, useRef } from 'react';
import PokerTable from './components/PokerTable';
import ControlPanel from './components/ControlPanel';
import AnalysisFeed from './components/AnalysisFeed';
import { startNewScenario, processPlayerAction } from './services/geminiService';
import { audioService } from './services/audioService';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]);
  
  // Track previous state to trigger sounds
  const prevStreetRef = useRef<string | null>(null);
  const prevIsHeroTurnRef = useRef<boolean>(false);

  useEffect(() => {
    // Audio triggers based on state changes
    if (!gameState) return;

    // New Street dealt
    if (prevStreetRef.current !== gameState.street && gameState.street !== 'Preflop') {
        audioService.playCardSlide();
    }

    // Hero's turn notification
    if (!prevIsHeroTurnRef.current && gameState.isHeroTurn && !gameState.gameEnded) {
        audioService.playTurnAlert();
    }

    // Game End
    if (gameState.gameEnded && gameState.winnerId) {
        const hero = gameState.players.find(p => p.isHero);
        if (hero && hero.id === gameState.winnerId) {
            audioService.playWinSound();
        }
    }

    prevStreetRef.current = gameState.street;
    prevIsHeroTurnRef.current = gameState.isHeroTurn;
  }, [gameState]);

  const handleStartGame = async () => {
    // Initialize audio on user interaction
    audioService.init();
    audioService.playCardSlide();

    setLoading(true);
    setError(null);
    setGameState(null);
    setAnalysisHistory([]);
    prevStreetRef.current = null;
    
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
             <h1 className="text-xl font-bold tracking-wide hidden md:block">GTO Poker Master</h1>
             <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">6-MAX LIVE</span>
          </div>
          <button 
            onClick={handleStartGame} 
            disabled={loading}
            className="bg-gold hover:bg-gold-light text-black font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? "Dealing..." : "New Hand"}
          </button>
        </header>

        {/* Game Content */}
        <main className="flex-1 p-2 md:p-4 overflow-y-auto flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black relative">
           
           {/* Background Texture */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

           {error && (
             <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg max-w-md text-center z-50">
               {error}
             </div>
           )}
           
           {!gameState && !loading && !error && (
             <div className="text-center max-w-lg z-10">
               <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Master the Table</h2>
               <p className="text-gray-400 mb-8 text-lg">
                 Experience high-stakes 6-Max Hold'em. 
                 <br/>
                 Real-time GTO coaching. Immersive audio.
               </p>
               <button 
                 onClick={handleStartGame}
                 className="bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-xl py-4 px-10 rounded-xl shadow-2xl hover:shadow-gold/50 transition-all hover:-translate-y-1"
               >
                 Sit Down & Deal
               </button>
             </div>
           )}

           {gameState && (
             <>
               <PokerTable gameState={gameState} />
               <ControlPanel 
                  gameState={gameState} 
                  onAction={handleAction} 
                  disabled={loading || !gameState.isHeroTurn || gameState.gameEnded} 
               />
               {gameState.gameEnded && (
                 <div className="mt-6 z-30 animate-fade-in">
                   <button 
                     onClick={handleStartGame}
                     className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-100 hover:scale-110 transition-all"
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
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-gold font-bold tracking-widest animate-pulse">THINKING...</span>
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
