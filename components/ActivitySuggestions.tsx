import React, { useState, useEffect } from 'react';
import { getBurnSuggestions } from '../services/geminiService';
import { ActivitySuggestion, UserProfile, Exercise } from '../types';
import { playPalmMute, playPowerChord } from '../utils/audio';

interface ActivitySuggestionsProps {
  caloriesToBurn: number;
  userProfile: UserProfile;
  isOverLimit: boolean;
  onLogActivity: (exercise: Exercise) => void;
}

const ActivitySuggestions: React.FC<ActivitySuggestionsProps> = ({ caloriesToBurn, userProfile, isOverLimit, onLogActivity }) => {
  const [activities, setActivities] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setActivities([]);
  }, [Math.round(caloriesToBurn / 50) * 50]);

  const fetchActivities = async () => {
    playPowerChord();
    setLoading(true);
    const target = Math.max(caloriesToBurn, 150); 
    const data = await getBurnSuggestions(target, userProfile);
    setActivities(data);
    setLoading(false);
    setLoaded(true);
  };

  const handleAdd = (act: ActivitySuggestion, isAlternative: boolean = false) => {
    playPalmMute();
    
    let name = act.activity;
    let details = act.details;

    if (isAlternative && act.homeAlternative) {
        name = `(CASA) ${act.homeAlternative.activity}`;
        details = act.homeAlternative.details;
    }

    const logName = `${name} [${details}]`;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: logName,
      caloriesBurned: act.caloriesBurned,
      durationMinutes: act.durationMinutes,
      timestamp: Date.now()
    };
    onLogActivity(newExercise);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-punk text-fuchsia-400">
            {isOverLimit ? 'QUEMA ESE EXCESO' : 'CALISTENIA / CASA'}
          </h3>
          <p className="text-xs font-mono text-fuchsia-700">
            OBJETIVO: {caloriesToBurn} KCAL
          </p>
        </div>
        
        {loaded && (
             <button 
             onClick={fetchActivities}
             disabled={loading}
             className="text-xs font-bold bg-zinc-800 text-fuchsia-400 border border-fuchsia-500 px-3 py-1 font-punk uppercase hover:bg-fuchsia-500 hover:text-black transition-colors"
           >
             {loading ? '...' : 'OTRA RUTINA ↻'}
           </button>
        )}

        {!loaded && (
          <button 
            onClick={fetchActivities}
            disabled={loading}
            className="text-xs font-bold bg-fuchsia-600 text-white px-3 py-1 font-punk uppercase hover:bg-fuchsia-500"
          >
            {loading ? 'GENERANDO...' : 'DAME RUTINAS'}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-20 bg-fuchsia-900/30 border border-fuchsia-900/50"></div>
          <div className="h-20 bg-fuchsia-900/30 border border-fuchsia-900/50"></div>
        </div>
      )}

      {loaded && (
        <div className="space-y-4">
          {activities.map((act, idx) => (
            <div key={idx} className="bg-black border-2 border-fuchsia-900 p-3 relative overflow-hidden">
              
              {/* HEADER EXERCISE */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-white uppercase font-punk text-xl leading-none">{act.activity}</h4>
                  <div className="text-sm font-bold text-lime-400 font-mono mt-1">
                    {act.details}
                  </div>
                  <p className="text-xs text-zinc-500 italic mt-1 border-l-2 border-fuchsia-600 pl-2">
                    Tip: {act.technique}
                  </p>
                </div>
                
                <div className="text-right">
                    <div className="font-bold text-white font-mono">{act.durationMinutes}m</div>
                    <div className="text-xs text-zinc-500">~{act.caloriesBurned}</div>
                    <button 
                        onClick={() => handleAdd(act, false)}
                        className="mt-2 bg-fuchsia-600 text-black font-bold text-xs px-2 py-1 hover:bg-white uppercase font-punk"
                    >
                        LOG
                    </button>
                </div>
              </div>

              {/* ALTERNATIVE SECTION */}
              {act.homeAlternative && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 bg-zinc-900/50 -mx-3 px-3 pb-1">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-zinc-700 text-white px-1 rounded uppercase">🏠 CASA (SIN EQUIPO)</span>
                          <span className="text-sm font-bold text-zinc-300 font-punk">{act.homeAlternative.activity}</span>
                      </div>
                      <div className="flex justify-between items-end">
                          <div className="text-xs text-zinc-400 font-mono">
                              {act.homeAlternative.details} <br/>
                              <span className="italic text-zinc-500">{act.homeAlternative.technique}</span>
                          </div>
                          <button 
                            onClick={() => handleAdd(act, true)}
                            className="bg-zinc-700 text-zinc-300 font-bold text-xs px-2 py-1 hover:bg-white hover:text-black uppercase font-punk"
                        >
                            LOG CASA
                        </button>
                      </div>
                  </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitySuggestions;