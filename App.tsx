import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing user profile
    const storedUser = localStorage.getItem('nutriflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('nutriflow_user', JSON.stringify(profile));
  };

  const handleReset = () => {
      localStorage.removeItem('nutriflow_user');
      setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-lime-400 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center">
      <div className="w-full max-w-lg shadow-2xl overflow-hidden relative min-h-screen bg-zinc-950 border-x border-zinc-800">
        {!user ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
              <Dashboard user={user} />
              <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-black/90 backdrop-blur-md border-t border-zinc-800 p-1 flex justify-center text-[10px] text-zinc-600 font-mono z-50">
                  <button onClick={handleReset} className="px-4 py-1 hover:text-red-500 transition-colors uppercase">Reset Data</button>
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;