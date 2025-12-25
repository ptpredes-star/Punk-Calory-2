import React, { useState, useRef } from 'react';
import { analyzeFoodBulk } from '../services/geminiService';
import { Meal, MealCategory } from '../types';
import { playPowerChord, playFeedbackSqueal, playPalmMute } from '../utils/audio';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meal: Meal) => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<MealCategory>('ALMUERZO');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    playPalmMute();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;

    playPowerChord();
    setIsAnalyzing(true);
    setError('');

    try {
      const items = await analyzeFoodBulk(input, image || undefined);
      if (items && items.length > 0) {
        items.forEach(item => {
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(),
            timestamp: Date.now(),
            ...item,
            description: input || "Foto del Rancho",
            category: category
          };
          onAdd(newMeal);
        });
        playFeedbackSqueal();
        setInput('');
        setImage(null);
        onClose();
      } else {
        setError("NO VEO COMIDA AHÍ, BRO.");
      }
    } catch (err) {
      setError("ERROR DEL SISTEMA. PRUEBA OTRA VEZ.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categories: MealCategory[] = ['DESAYUNO', 'ALMUERZO', 'CENA', 'SNACK'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-lime-400 w-full max-w-md p-6 shadow-[0_0_20px_rgba(163,230,53,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-punk font-bold text-lime-400 tracking-wider">CARGAR GASOLINA</h2>
          <button onClick={() => { playPalmMute(); onClose(); }} className="text-zinc-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-6">
             <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase">¿QUÉ TOCA COMER?</label>
             <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => { playPalmMute(); setCategory(cat); }}
                        className={`p-2 font-punk uppercase tracking-widest border-2 transition-all text-sm ${
                            category === cat 
                            ? 'bg-lime-400 text-black border-lime-400' 
                            : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase cursor-pointer hover:text-lime-400 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              SUBIR FOTO DEL RANCHO
            </label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-32 border-2 border-dashed ${image ? 'border-lime-400' : 'border-zinc-700'} flex items-center justify-center bg-black cursor-pointer overflow-hidden relative`}
            >
              {image ? (
                <img src={`data:image/jpeg;base64,${image}`} alt="Preview" className="w-full h-full object-cover opacity-80" />
              ) : (
                <span className="text-zinc-600 font-punk text-xl">TOCA PARA FOTO</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase">TEXTO (OPCIONAL SI HAY FOTO)</label>
            <textarea
              className="w-full p-4 bg-black border-2 border-zinc-700 text-white focus:border-lime-400 focus:outline-none h-24 text-lg font-mono placeholder-zinc-600"
              placeholder={`Ej: ${category}... Arroz, pollo y brócoli`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAnalyzing}
            />
            {error && <p className="mt-2 text-sm text-fuchsia-500 font-bold uppercase animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || (!input.trim() && !image)}
            className="w-full py-4 px-6 bg-lime-400 hover:bg-lime-300 text-black font-punk font-bold text-xl uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {isAnalyzing ? 'ANALIZANDO EL COMBUSTIBLE...' : 'REGISTRAR COMIDA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
