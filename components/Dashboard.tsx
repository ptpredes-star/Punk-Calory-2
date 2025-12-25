import React, { useState, useEffect } from 'react';
import { UserProfile, Meal, Exercise, MealCategory } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AddMealModal from './AddMealModal';
import AddExerciseModal from './AddExerciseModal';
import ConsultModal from './ConsultModal';
import MealSuggestions from './MealSuggestions';
import ActivitySuggestions from './ActivitySuggestions';
import PrognosisCard from './PrognosisCard';
import AiCoach from './AiCoach';
import { playPalmMute, playPowerChord } from '../utils/audio';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - offset)).toISOString().slice(0, 10);
  });

  useEffect(() => {
    const storedMeals = localStorage.getItem(`meals_${currentDate}`);
    const storedExercises = localStorage.getItem(`exercises_${currentDate}`);
    setMeals(storedMeals ? JSON.parse(storedMeals) : []);
    setExercises(storedExercises ? JSON.parse(storedExercises) : []);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem(`meals_${currentDate}`, JSON.stringify(meals));
  }, [meals, currentDate]);

  useEffect(() => {
    localStorage.setItem(`exercises_${currentDate}`, JSON.stringify(exercises));
  }, [exercises, currentDate]);

  const addMeal = (meal: Meal) => setMeals(prev => [meal, ...prev]);
  const deleteMeal = (id: string) => {
    playPalmMute();
    setMeals(prev => prev.filter(m => m.id !== id));
  };
  
  const addExercise = (exercise: Exercise) => setExercises(prev => [exercise, ...prev]);
  const deleteExercise = (id: string) => {
    playPalmMute();
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const foodCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const exerciseCalories = exercises.reduce((acc, e) => acc + e.caloriesBurned, 0);
  const totalBudget = user.targetCalories + exerciseCalories;
  const remainingCalories = Math.max(0, totalBudget - foodCalories);
  const netCalories = foodCalories - exerciseCalories;
  const percentConsumed = Math.min(100, (foodCalories / totalBudget) * 100);
  
  const totalProtein = meals.reduce((acc, m) => acc + m.macros.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.macros.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.macros.fat, 0);

  const isOverBase = foodCalories > user.targetCalories;
  const caloriesToBurn = isOverBase ? (foodCalories - user.targetCalories) : 300;
  const getProgress = (current: number, target: number) => Math.min(100, (current / target) * 100);

  const isToday = () => {
     const now = new Date();
     const offset = now.getTimezoneOffset() * 60000;
     const todayISO = (new Date(now.getTime() - offset)).toISOString().slice(0, 10);
     return currentDate === todayISO;
  };

  const getMealsByCategory = (cat: MealCategory) => meals.filter(m => (m.category || 'SNACK') === cat);
  
  // Sort exercises: Scheduled ones first (by time), then unscheduled
  const sortedExercises = [...exercises].sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime);
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      return 0;
  });

  return (
    <div className="pb-32 bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-lime-400 selection:text-black">
      
      {/* PUNK HEADER */}
      <div className="bg-zinc-900 border-b-4 border-lime-400 p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 font-punk text-9xl text-white select-none pointer-events-none">PUNK</div>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <h1 className="text-4xl font-punk font-bold italic tracking-tighter text-white">
              PUNK <span className="text-lime-400">CALORY</span>
            </h1>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mt-1">PLANIFICA. EJECUTA. REPITE.</p>
          </div>
          <div className="flex flex-col items-end">
             <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => { playPalmMute(); setCurrentDate(e.target.value); }}
              className="bg-black border border-zinc-700 text-white font-mono p-1 text-sm outline-none focus:border-lime-400"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-xl mx-auto">
        
        {/* MAIN STATS CARD */}
        <div className="bg-black border-2 border-zinc-800 p-6 relative shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                     {foodCalories > totalBudget ? "TE PASASTE, FIERA" : "COMBUSTIBLE RESTANTE"}
                   </span>
                   <div className={`text-6xl font-punk font-bold tracking-tight ${foodCalories > totalBudget ? 'text-fuchsia-500' : 'text-white'}`}>
                     {foodCalories > totalBudget ? `+${Math.abs(foodCalories - totalBudget)}` : Math.abs(remainingCalories)}
                   </div>
                   <div className="text-xs font-mono text-zinc-500 mt-2">
                     META: {user.targetCalories} <span className="text-lime-400">+ QUEMADO: {exerciseCalories}</span>
                   </div>
                </div>
                
                <div className="h-28 w-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{value: percentConsumed}, {value: Math.max(0, 100 - percentConsumed)}]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={50}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell key="consumed" fill={percentConsumed >= 100 ? '#d946ef' : '#a3e635'} />
                            <Cell key="remaining" fill="#27272a" />
                          </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-bold font-punk text-white">{Math.round(percentConsumed)}%</span>
                    </div>
                </div>
            </div>

            {/* MACROS BARS */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: 'PROTES', current: totalProtein, target: user.macroTargets.protein, color: 'bg-lime-500' },
                  { label: 'CARBOS', current: totalCarbs, target: user.macroTargets.carbs, color: 'bg-cyan-500' },
                  { label: 'GRASAS', current: totalFat, target: user.macroTargets.fat, color: 'bg-fuchsia-500' }
                ].map(m => (
                  <div key={m.label} className="bg-zinc-900 p-2 border border-zinc-800">
                     <div className="flex justify-between text-[10px] font-mono mb-1 text-zinc-400">
                        <span>{m.label}</span>
                        <span>{m.current}/{m.target}g</span>
                     </div>
                     <div className="h-1.5 bg-zinc-800 w-full">
                        <div className={`h-full ${m.color}`} style={{ width: `${getProgress(m.current, m.target)}%` }}></div>
                     </div>
                  </div>
                ))}
            </div>
        </div>

        {/* PROGNOSIS */}
        <PrognosisCard user={user} netCalories={netCalories} />

        {/* ACTIONS */}
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => { playPowerChord(); setIsMealModalOpen(true); }}
                    className="bg-lime-400 hover:bg-lime-300 text-black py-6 font-punk font-bold text-2xl uppercase tracking-wider transition-transform active:scale-95 border-b-4 border-lime-600 shadow-[0_0_15px_rgba(163,230,53,0.4)]"
                >
                    + COMIDA
                </button>
                <button 
                    onClick={() => { playPowerChord(); setIsExerciseModalOpen(true); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-6 font-punk font-bold text-2xl uppercase tracking-wider transition-transform active:scale-95 border-b-4 border-black border-2 border-zinc-700 hover:border-fuchsia-500 hover:text-fuchsia-500"
                >
                    + RUTINA
                </button>
            </div>
            
            <button
                onClick={() => { playPowerChord(); setIsConsultModalOpen(true); }}
                className="w-full bg-cyan-900/30 border-2 border-cyan-500/50 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-400 py-3 font-punk font-bold text-xl uppercase tracking-widest transition-all"
            >
                🔮 CONSULTAR AL ORÁCULO
            </button>
        </div>

        {/* LOGS LIST SPLIT BY CATEGORY */}
        <div className="space-y-8 mt-8">
          
          <div>
            <h2 className="text-xl font-punk text-white mb-4 border-l-4 border-lime-400 pl-3">PLAN ALIMENTICIO</h2>
            
            {meals.length === 0 && (
                <p className="text-zinc-600 font-mono text-sm border border-zinc-800 p-4 border-dashed">SIN COMBUSTIBLE.</p>
            )}

            {(['DESAYUNO', 'ALMUERZO', 'CENA', 'SNACK'] as MealCategory[]).map(cat => {
                const catMeals = getMealsByCategory(cat);
                if (catMeals.length === 0 && meals.length > 0) return null; // Don't show empty sections if there are meals elsewhere, but show all if empty? No, cleaner to hide.
                if (meals.length === 0) return null;

                return (
                    <div key={cat} className="mb-4">
                         <h3 className="text-xs font-bold text-lime-600 uppercase tracking-widest mb-2 border-b border-lime-900/50 pb-1">{cat}</h3>
                         <div className="space-y-2">
                            {catMeals.length === 0 ? (
                                <p className="text-zinc-700 text-xs italic pl-2">Nada registrado.</p>
                            ) : (
                                catMeals.map(meal => (
                                    <div key={meal.id} className="bg-zinc-900 border-l-2 border-zinc-700 p-3 flex justify-between items-center group hover:border-lime-400 transition-colors">
                                        <div className="overflow-hidden">
                                        <h3 className="font-bold text-zinc-200 uppercase truncate font-mono">{meal.name}</h3>
                                        <div className="flex gap-2 mt-1 text-[10px] font-mono text-zinc-500">
                                            <span>P:{meal.macros.protein}</span>
                                            <span>C:{meal.macros.carbs}</span>
                                            <span>F:{meal.macros.fat}</span>
                                        </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                        <span className="font-punk text-xl text-white">{meal.calories}</span>
                                        <button onClick={() => deleteMeal(meal.id)} className="text-zinc-600 hover:text-red-500 px-2 font-bold">X</button>
                                        </div>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                )
            })}
          </div>

          <div>
            <h2 className="text-xl font-punk text-white mb-4 border-l-4 border-fuchsia-500 pl-3">HORARIO DEL DOLOR</h2>
            {exercises.length === 0 ? (
              <p className="text-zinc-600 font-mono text-sm border border-zinc-800 p-4 border-dashed">HOY ES DÍA DE DESCANSO? NO CREO.</p>
            ) : (
              <div className="space-y-2">
                {sortedExercises.map(ex => (
                  <div key={ex.id} className="bg-zinc-900 border-l-2 border-fuchsia-900 p-3 flex justify-between items-center hover:border-fuchsia-500 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                          {ex.scheduledTime && (
                              <span className="bg-fuchsia-900 text-fuchsia-200 text-xs px-1 font-mono">{ex.scheduledTime}</span>
                          )}
                          <h3 className="font-bold text-zinc-200 uppercase font-mono">{ex.name}</h3>
                      </div>
                      <p className="text-xs text-fuchsia-500 mt-1 font-mono">{ex.durationMinutes} MIN</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-punk text-xl text-fuchsia-400">-{ex.caloriesBurned}</span>
                      <button onClick={() => deleteExercise(ex.id)} className="text-zinc-600 hover:text-red-500 px-2 font-bold">X</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SUGGESTIONS */}
        {isToday() && (
            <div className="border border-fuchsia-900 bg-fuchsia-900/10 p-4 mt-8">
               <ActivitySuggestions 
                  caloriesToBurn={caloriesToBurn} 
                  userProfile={user} 
                  isOverLimit={isOverBase}
                  onLogActivity={addExercise}
               />
            </div>
        )}

        {!isOverBase && remainingCalories > 0 && isToday() && (
             <MealSuggestions remainingCalories={remainingCalories} />
        )}
      </div>

      <AddMealModal 
        isOpen={isMealModalOpen} 
        onClose={() => setIsMealModalOpen(false)} 
        onAdd={addMeal}
      />

      <AddExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onAdd={addExercise}
        userProfile={user}
      />

      <ConsultModal 
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
      />

      <AiCoach context={{ caloriesLeft: remainingCalories, macros: user.macroTargets, goal: user.goal }} />
    </div>
  );
};

export default Dashboard;
