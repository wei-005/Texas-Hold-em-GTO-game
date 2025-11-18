import React, { useEffect, useRef } from 'react';

interface AnalysisFeedProps {
  analysisHistory: string[];
}

const AnalysisFeed: React.FC<AnalysisFeedProps> = ({ analysisHistory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [analysisHistory]);

  return (
    <div className="bg-gray-900 border-l border-gray-800 h-full flex flex-col w-full md:w-96 shrink-0">
      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
        <h2 className="text-gold font-bold text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          GTO Coach
        </h2>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {analysisHistory.length === 0 ? (
           <div className="text-gray-500 text-center mt-10 italic">
             "Poker is a game of incomplete information. I'm here to help fill in the gaps."
             <br/><br/>
             Start a scenario to receive analysis.
           </div>
        ) : (
            analysisHistory.map((text, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Analysis #{idx + 1}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {text}
                </p>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AnalysisFeed;
