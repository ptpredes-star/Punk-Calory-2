import React, { useState, useRef, useEffect } from 'react';
import { chatWithCoach } from '../services/geminiService';
import { playPalmMute } from '../utils/audio';

interface AiCoachProps {
  context: {
    caloriesLeft: number;
    macros: any;
    goal: string;
  };
}

const AiCoach: React.FC<AiCoachProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'coach', text: string}[]>([
    { role: 'coach', text: '¿QUÉ PASA FIERA? ¿TE FALTA MOTIVACIÓN O QUÉ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    playPalmMute();
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const response = await chatWithCoach(userMsg, context);
    setMessages(prev => [...prev, { role: 'coach', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-zinc-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex flex-col h-[450px]">
          {/* Header */}
          <div className="bg-cyan-900/30 p-3 border-b border-cyan-800 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
               <span className="font-punk text-cyan-400 tracking-wider">EL COACH IA</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-cyan-400 hover:text-white">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-zinc-800 text-white border-r-2 border-white' 
                    : 'bg-cyan-900/20 text-cyan-100 border-l-2 border-cyan-400'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-cyan-500 animate-pulse ml-2">MAQUINANDO...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-black border-t border-zinc-800 flex gap-2">
            <input 
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-cyan-400 outline-none"
              placeholder="Suelta la duda, máquina..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 font-bold font-punk">
              ENVIAR
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={() => { playPalmMute(); setIsOpen(!isOpen); }}
        className="h-16 w-16 bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-900/50 transition-all active:scale-95 border-2 border-white"
      >
        <span className="text-3xl">💀</span>
      </button>
    </div>
  );
};

export default AiCoach;