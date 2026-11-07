import React, { useState, useEffect } from 'react';
import { Menu, Bell, Shield, Cpu, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const data = await api.getHealth();
      setIsHealthy(data.status === 'healthy');
    } catch (e) {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Security Intelligence Console
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span className="text-xs text-cyan-400 font-mono">GCC C11 Runtime Sandboxed</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <button
          onClick={() => navigate('/simulator')}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-950/40 hover:border-cyan-600 transition-all shadow-sm"
        >
          <Cpu className="w-4 h-4" />
          Simulate Overflow
        </button>

        <button
          onClick={() => navigate('/scanner')}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-600/20"
        >
          <Shield className="w-4 h-4" />
          Scan C Code
        </button>

        {/* Backend Health Badge */}
        <div
          onClick={checkStatus}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800/90 border border-slate-700/80 hover:border-slate-600 text-xs transition-colors"
          title="Click to recheck backend connectivity"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isHealthy === true
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                : isHealthy === false
                ? 'bg-rose-500 shadow-sm shadow-rose-500'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 font-medium hidden sm:inline">
            {isChecking
              ? 'Checking...'
              : isHealthy === true
              ? 'Engine Online'
              : isHealthy === false
              ? 'Engine Disconnected'
              : 'Connecting...'}
          </span>
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-400 ${isChecking ? 'animate-spin' : ''}`}
          />
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-800/50 text-[11px] text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Demo Mode
        </div>
      </div>
    </header>
  );
};
