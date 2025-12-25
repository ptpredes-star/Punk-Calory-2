import React, { useState } from 'react';
import { getMealSuggestions } from '../services/geminiService';
import { Suggestion } from '../types';
import { playPalmMute, playFeedbackSqueal } from '../utils/audio';

interface MealSuggestionsProps {
  remainingCalories: number;
}

const MealSuggestions: React.FC<MealSuggestionsProps> = ({ remainingCalories }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuggestions = async () => {
    playFeedbackSqueal();
    setLoading(true);
    const data = await getMealSuggestions(remainingCalories);
    setSuggestions(data);
    setLoading(false);
    setHasLoaded(true);
  };

  return (
    <div className="border border-lime-900 bg-lime-900/10 p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-punk text-lime-500">IDEAS PARA TRAGAR</h3>
          <p className="text-xs font-mono text-lime-800">PRESUPUESTO: {remainingCalories} KCAL</p>
        </div>
        {!hasLoaded ? (
          <button 
            onClick={fetchSuggestions}
            disabled={loading}
            className="text-xs font-bold bg-lime-600 text-black px-3 py-1 font-punk uppercase hover:bg-lime-500"
          >
            {loading ? 'COCINANDO...' : 'GENERAR'}
          </button>
        ) : (
            <button 
                onClick={fetchSuggestions} 
                disabled={loading}
                className="text-xs font-bold bg-zinc-800 text-lime-500 border border-lime-500 px-3 py-1 font-punk uppercase hover:bg-lime-500 hover:text-black transition-colors"
            >
                {loading ? '...' : 'OTRO MENÚ ↻'}
            </button>
        )}
      </div>

      {loading && !suggestions.length && (
        <div className="space-y-2 animate-pulse">
           <div className="h-12 bg-lime-900/20"></div>
           <div className="h-12 bg-lime-900/20"></div>
        </div>
      )}

      <div className="space-y-2">
        {suggestions.map((s, idx) => (
          <div key={idx} className="p-3 bg-black border border-lime-900 hover:border-lime-500 transition-colors">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-zinc-300 font-mono uppercase text-sm">{s.name}</h4>
              <span className="text-xs font-bold text-lime-400">{s.calories} kcal</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealSuggestions;