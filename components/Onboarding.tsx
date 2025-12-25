import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, Macros } from '../types';
import { playPowerChord, playFeedbackSqueal, playPalmMute } from '../utils/audio';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: Gender.MALE,
    activityLevel: ActivityLevel.SEDENTARY,
    goal: Goal.LOSE_WEIGHT
  });

  const handleNext = () => { playPalmMute(); setStep(prev => prev + 1); };
  const handleBack = () => { playPalmMute(); setStep(prev => prev - 1); };

  const calculatePlan = (): { calories: number, macros: Macros } => {
    const { weight, height, age, gender, activityLevel, goal } = formData;
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      return { calories: 2000, macros: { protein: 150, carbs: 200, fat: 65 } };
    }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === Gender.MALE) bmr += 5; else bmr -= 161;
    let multiplier = 1.2;
    switch (activityLevel) {
      case ActivityLevel.LIGHT: multiplier = 1.375; break;
      case ActivityLevel.MODERATE: multiplier = 1.55; break;
      case ActivityLevel.ACTIVE: multiplier = 1.725; break;
      case ActivityLevel.VERY_ACTIVE: multiplier = 1.9; break;
    }
    const tdee = bmr * multiplier;
    let targetCalories = tdee;
    switch (goal) {
      case Goal.LOSE_WEIGHT: targetCalories = tdee - 500; break;
      case Goal.GAIN_MUSCLE: targetCalories = tdee + 300; break;
      case Goal.MAINTAIN: default: targetCalories = tdee;
    }
    const minCalories = gender === Gender.MALE ? 1500 : 1200;
    if (targetCalories < minCalories) targetCalories = minCalories;
    targetCalories = Math.round(targetCalories);

    let proteinRatio, fatRatio, carbsRatio;
    if (goal === Goal.LOSE_WEIGHT) { proteinRatio = 0.35; fatRatio = 0.35; carbsRatio = 0.30; } 
    else if (goal === Goal.GAIN_MUSCLE) { proteinRatio = 0.30; fatRatio = 0.25; carbsRatio = 0.45; } 
    else { proteinRatio = 0.30; fatRatio = 0.30; carbsRatio = 0.40; }

    const macros: Macros = {
      protein: Math.round((targetCalories * proteinRatio) / 4),
      fat: Math.round((targetCalories * fatRatio) / 9),
      carbs: Math.round((targetCalories * carbsRatio) / 4),
    };
    return { calories: targetCalories, macros };
  };

  const finish = () => {
    playFeedbackSqueal();
    const { calories, macros } = calculatePlan();
    onComplete({
      ...formData as UserProfile,
      targetCalories: calories,
      macroTargets: macros,
      hasOnboarded: true,
      name: formData.name || 'PUNK'
    });
  };

  const inputClass = "w-full p-4 bg-black border-2 border-zinc-800 text-white font-mono focus:border-lime-400 outline-none transition-all placeholder-zinc-700";
  const labelClass = "block text-sm font-bold text-lime-400 mb-2 uppercase tracking-widest font-punk";
  const btnClass = "flex-1 py-4 px-6 font-bold font-punk uppercase tracking-widest transition-all hover:skew-x-2";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-200">
      <div className="max-w-md w-full border-4 border-zinc-800 bg-zinc-900/50 p-8 shadow-[10px_10px_0px_0px_#a3e635]">
        
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center border-b-2 border-zinc-800 pb-6">
              <h1 className="text-5xl font-punk font-bold text-white mb-2 italic">PUNK<span className="text-lime-400">CALORY</span></h1>
              <p className="text-zinc-500 font-mono text-sm">SIN EXCUSAS. SOLO RESULTADOS.</p>
            </div>
            
            <div>
              <label className={labelClass}>NOMBRE DE GUERRA</label>
              <input 
                type="text" 
                className={inputClass}
                placeholder="TU APODO, MÁQUINA"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
              />
            </div>
            
            <div>
              <label className={labelClass}>GENÉTICA</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { playPalmMute(); setFormData({...formData, gender: Gender.MALE}); }}
                  className={`p-4 border-2 font-punk text-xl ${formData.gender === Gender.MALE ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'}`}
                >
                  HOMBRE
                </button>
                <button 
                  onClick={() => { playPalmMute(); setFormData({...formData, gender: Gender.FEMALE}); }}
                  className={`p-4 border-2 font-punk text-xl ${formData.gender === Gender.FEMALE ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'}`}
                >
                  MUJER
                </button>
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!formData.name}
              className={`${btnClass} w-full bg-lime-400 text-black disabled:opacity-20 disabled:skew-x-0`}
            >
              INICIAR PROTOCOLO
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
             <div className="text-center">
              <h2 className="text-3xl font-punk font-bold text-white">TU ADN</h2>
              <p className="text-zinc-600 font-mono text-xs">NO MIENTAS A LA BÁSCULA.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>EDAD</label>
                <input type="number" className={inputClass} placeholder="AÑOS" 
                  value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
              </div>
              <div>
                <label className={labelClass}>PESO (KG)</label>
                <input type="number" className={inputClass} placeholder="KG" 
                  value={formData.weight || ''} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
              </div>
            </div>

            <div>
               <label className={labelClass}>ALTURA (CM)</label>
               <input type="number" className={inputClass} placeholder="CM" 
                  value={formData.height || ''} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
            </div>

            <div className="flex gap-4 pt-4">
               <button onClick={handleBack} className={`${btnClass} bg-zinc-800 text-zinc-400 hover:text-white`}>ATRÁS</button>
               <button 
                 onClick={handleNext} 
                 disabled={!formData.age || !formData.weight || !formData.height}
                 className={`${btnClass} bg-lime-400 text-black disabled:opacity-20`}
               >
                 SIGUIENTE
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
             <div className="text-center">
              <h2 className="text-3xl font-punk font-bold text-white">NIVEL DE ACTIVIDAD</h2>
              <p className="text-zinc-600 font-mono text-xs">SÉ REALISTA, BRO.</p>
            </div>

            <div className="space-y-2">
              {[
                { val: ActivityLevel.SEDENTARY, label: "MODO NPC (SEDENTARIO)", desc: "Todo el día sentado, cero movimiento" },
                { val: ActivityLevel.LIGHT, label: "DOMINGUERO (LIGERO)", desc: "Entreno suave 1-3 días" },
                { val: ActivityLevel.MODERATE, label: "DISCIPLINADO (MODERADO)", desc: "Entreno serio 3-5 días" },
                { val: ActivityLevel.ACTIVE, label: "MODO BESTIA (INTENSO)", desc: "6-7 días a fuego" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => { playPalmMute(); setFormData({...formData, activityLevel: opt.val as ActivityLevel}); }}
                  className={`w-full text-left p-4 border-2 transition-all ${formData.activityLevel === opt.val ? 'border-lime-400 bg-lime-900/20' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                  <div className={`font-punk text-xl ${formData.activityLevel === opt.val ? 'text-lime-400' : 'text-zinc-500'}`}>{opt.label}</div>
                  <div className="text-xs font-mono text-zinc-600">{opt.desc}</div>
                </button>
              ))}
            </div>

             <div className="flex gap-4 pt-4">
               <button onClick={handleBack} className={`${btnClass} bg-zinc-800 text-zinc-400`}>ATRÁS</button>
               <button onClick={handleNext} className={`${btnClass} bg-lime-400 text-black`}>SIGUIENTE</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
             <div className="text-center">
              <h2 className="text-3xl font-punk font-bold text-white">TU MISIÓN</h2>
              <p className="text-zinc-600 font-mono text-xs">ESCOGE TU CAMINO.</p>
            </div>

            <div className="space-y-3">
              {[
                { val: Goal.LOSE_WEIGHT, label: "DEFINICIÓN / CORTAR", desc: "Déficit Calórico (Perder Grasa)" },
                { val: Goal.MAINTAIN, label: "MANTENIMIENTO", desc: "Ni subir ni bajar, quedarse fino" },
                { val: Goal.GAIN_MUSCLE, label: "VOLUMEN / CRECER", desc: "Superávit Calórico (Ganar Músculo)" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => { playPalmMute(); setFormData({...formData, goal: opt.val as Goal}); }}
                  className={`w-full text-left p-4 border-2 transition-all ${formData.goal === opt.val ? 'border-fuchsia-500 bg-fuchsia-900/20' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                  <div className={`font-punk text-xl ${formData.goal === opt.val ? 'text-fuchsia-500' : 'text-zinc-500'}`}>{opt.label}</div>
                  <div className="text-xs font-mono text-zinc-600">{opt.desc}</div>
                </button>
              ))}
            </div>

             <div className="flex gap-4 pt-4">
               <button onClick={handleBack} className={`${btnClass} bg-zinc-800 text-zinc-400`}>ATRÁS</button>
               <button onClick={finish} className={`${btnClass} bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[4px_4px_0px_0px_#fff]`}>
                 FINALIZAR
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;