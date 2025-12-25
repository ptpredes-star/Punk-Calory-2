import React, { useState } from 'react';
import { analyzeExerciseBulk } from '../services/geminiService';
import { Exercise, UserProfile } from '../types';
import { playPowerChord, playFeedbackSqueal, playPalmMute } from '../utils/audio';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
  userProfile: UserProfile;
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onAdd, userProfile }) => {
  const [input, setInput] = useState('');
  const [time, setTime] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    playPowerChord();
    setIsAnalyzing(true);
    setError('');

    try {
      const items = await analyzeExerciseBulk(input, userProfile);
      if (items && items.length > 0) {
        items.forEach(item => {
          const newExercise: Exercise = {
            id: Date.now().toString() + Math.random().toString(),
            timestamp: Date.now(),
            ...item,
            scheduledTime: time || undefined
          };
          onAdd(newExercise);
        });
        playFeedbackSqueal();
        setInput('');
        setTime('');
        onClose();
      } else {
        setError("NO ENTENDÍ ESA RUTINA, MÁQUINA.");
      }
    } catch (err) {
      setError("ERROR DE SISTEMA. INTENTA DE NUEVO.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-fuchsia-500 w-full max-w-md p-6 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-punk font-bold text-fuchsia-500 tracking-wider">PROGRAMAR DOLOR</h2>
          <button onClick={() => { playPalmMute(); onClose(); }} className="text-zinc-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
             <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase">HORA DEL SACRIFICIO</label>
             <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-4 bg-black border-2 border-zinc-700 text-white focus:border-fuchsia-500 focus:outline-none font-mono text-xl"
             />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase">¿QUÉ TOCA HOY?</label>
            <textarea
              className="w-full p-4 bg-black border-2 border-zinc-700 text-white focus:border-fuchsia-500 focus:outline-none h-32 text-lg font-mono placeholder-zinc-600"
              placeholder="Ej: Pecho y Tríceps, 4 series de..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAnalyzing}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-500 font-bold uppercase">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !input.trim()}
            className="w-full py-4 px-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-punk font-bold text-xl uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isAnalyzing ? 'CALCULANDO EL CASTIGO...' : 'GUARDAR ENTRENO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExerciseModal;
