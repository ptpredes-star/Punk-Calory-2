import React, { useState } from 'react';
import { consultOracle } from '../services/geminiService';
import { playPowerChord, playFeedbackSqueal, playPalmMute } from '../utils/audio';
import ReactMarkdown from 'react-markdown';

interface ConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultModal: React.FC<ConsultModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'FOOD' | 'EXERCISE'>('FOOD');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    playFeedbackSqueal();
    setLoading(true);
    setResult('');

    const analysis = await consultOracle(text, url, type);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-zinc-900 border-4 border-cyan-500 w-full max-w-lg p-6 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative">
        
        {/* Close Button */}
        <button 
            onClick={() => { playPalmMute(); onClose(); }} 
            className="absolute top-4 right-4 text-cyan-500 hover:text-white font-bold text-2xl"
        >
            ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-cyan-900 pb-4">
          <h2 className="text-3xl font-punk font-bold text-cyan-400 italic tracking-tighter transform -skew-x-12">
            EL ORÁCULO
          </h2>
          <p className="text-xs font-mono text-cyan-700 tracking-widest mt-1">¿TE LO COMES O TE ENGAÑAS?</p>
        </div>

        {/* Toggle Type */}
        <div className="flex gap-2 mb-6">
            <button 
                type="button"
                onClick={() => { playPalmMute(); setType('FOOD'); }}
                className={`flex-1 py-3 font-punk text-xl uppercase border-2 transition-all ${type === 'FOOD' ? 'bg-lime-400 text-black border-lime-400' : 'bg-black text-zinc-500 border-zinc-800'}`}
            >
                🍔 COMIDA
            </button>
            <button 
                type="button"
                onClick={() => { playPalmMute(); setType('EXERCISE'); }}
                className={`flex-1 py-3 font-punk text-xl uppercase border-2 transition-all ${type === 'EXERCISE' ? 'bg-fuchsia-500 text-black border-fuchsia-500' : 'bg-black text-zinc-500 border-zinc-800'}`}
            >
                💪 RUTINA
            </button>
        </div>

        {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase font-mono">
                        {type === 'FOOD' ? '¿QUÉ PIENSAS COMER?' : '¿QUÉ VAS A ENTRENAR?'}
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-cyan-400 outline-none min-h-[100px]"
                        placeholder={type === 'FOOD' ? "Ej: Una pizza familiar entera yo solo..." : "Ej: Rutina de pecho de Arnold..."}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase font-mono flex items-center gap-2">
                        <span>LINK DE YOUTUBE (OPCIONAL)</span>
                        <span className="bg-red-600 text-white text-[9px] px-1 py-0.5 rounded">BETA</span>
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-cyan-400 outline-none"
                        placeholder="https://youtube.com/watch?v=..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={!text.trim() || loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-punk text-2xl py-4 uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_#000] border border-cyan-400"
                >
                    {loading ? 'INVOCANDO A LOS DIOSES...' : 'ANALIZAR AHORA'}
                </button>
            </form>
        ) : (
            <div className="animate-fade-in">
                <div className="bg-black/50 border border-cyan-900 p-4 max-h-[300px] overflow-y-auto mb-4 font-mono text-sm text-zinc-300">
                     {/* We use a simple whitespace preserve since we don't have react-markdown installed in importmap yet, but lets assume text is plain or basic markdown */}
                     <div className="whitespace-pre-wrap leading-relaxed">
                        {result}
                     </div>
                </div>
                <button
                    onClick={() => { playPalmMute(); setResult(''); }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-punk text-xl py-3 uppercase tracking-widest border border-zinc-600"
                >
                    OTRA CONSULTA
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ConsultModal;