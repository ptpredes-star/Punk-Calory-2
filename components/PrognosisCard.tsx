import React, { useEffect, useState } from 'react';
import { getPrognosis } from '../services/geminiService';
import { UserProfile, Prognosis } from '../types';

interface PrognosisCardProps {
  user: UserProfile;
  netCalories: number;
}

const PrognosisCard: React.FC<PrognosisCardProps> = ({ user, netCalories }) => {
  const [prognosis, setPrognosis] = useState<Prognosis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrognosis();
    }, 2000);

    return () => clearTimeout(timer);
  }, [netCalories]);

  const fetchPrognosis = async () => {
    setLoading(true);
    const result = await getPrognosis(user, netCalories, 3);
    setPrognosis(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mt-6 p-4 border-2 border-zinc-800 bg-zinc-900/50 animate-pulse">
        <div className="h-4 bg-zinc-700 w-1/3 mb-2"></div>
        <div className="h-4 bg-zinc-800 w-full"></div>
      </div>
    );
  }

  if (!prognosis) return null;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ON_TRACK': return 'border-lime-500 text-lime-400';
      case 'WARNING': return 'border-red-500 text-red-500';
      default: return 'border-cyan-500 text-cyan-400';
    }
  };

  return (
    <div className={`mt-6 p-4 border-l-4 bg-black/50 ${getStatusColor(prognosis.status)}`}>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-punk text-lg uppercase tracking-wider">VEREDICTO IA</h3>
      </div>
      <p className="font-bold text-lg mb-1 font-mono uppercase leading-tight">{prognosis.prediction}</p>
      <p className="text-sm font-mono text-zinc-400">{prognosis.advice}</p>
    </div>
  );
};

export default PrognosisCard;