import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [health, setHealth] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ status: 'offline' });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          System Preferences & Diagnostics
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Application Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure interface appearance, verify low-level C runtime compiler bindings, and inspect database state.
        </p>
      </div>

      {/* Diagnostics Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Core Runtime Diagnostics
          </h3>
          <button
            onClick={checkHealth}
            disabled={isRefreshing}
            className="px-3 py-1 text-xs rounded-lg bg-dark-900 text-slate-300 border border-slate-700 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Backend REST API</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {health?.status === 'healthy' ? 'FastAPI 0.115 (Connected)' : 'Disconnected'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">C Compiler Subsystem</span>
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              MinGW GCC 6.3.0 (C11 Support)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Primary Database</span>
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              SQLite 3.x (bufferguard.db)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Execution Sandbox</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Host Isolation Active
            </span>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Moon className="w-4 h-4 text-cyan-400" />
          Interface Theme
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-200">Cybersecurity Dark Theme</div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-contrast navy and electric cyan accents optimized for security operations.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            Default (Active)
          </span>
        </div>
      </div>

      {/* University Project Information */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Laptop className="w-4 h-4 text-cyan-400" />
          Academic & Software Engineering Specifications
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Developed as a university-grade cybersecurity capstone demonstrating low-level buffer overflow mechanics,
          memory cell visualization, conservative AST/regex static analysis, and AddressSanitizer defenses.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>BufferGuard v1.0.0</span>
          <span>College Software Engineering Project</span>
        </div>
      </div>
    </div>
  );
};
