import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MemoryGrid } from '../components/MemoryGrid';
import { SimulationResult, SimulationPreset, MemoryCell } from '../types';
import {
  Play,
  RotateCcw,
  Pause,
  FastForward,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Info,
  ChevronRight,
  StepForward
} from 'lucide-react';

export const Simulator: React.FC = () => {
  const [bufferSize, setBufferSize] = useState<number>(10);
  const [inputText, setInputText] = useState<string>('CYBERSECURITY');
  const [simulationMode, setSimulationMode] = useState<'SAFE' | 'UNSAFE_CONCEPTUAL'>('UNSAFE_CONCEPTUAL');
  const [presets, setPresets] = useState<SimulationPreset[]>([]);
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [displayedCells, setDisplayedCells] = useState<MemoryCell[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(600); // ms per step
  const [loading, setLoading] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Load presets on mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await api.getSimulationPresets();
        setPresets(data);
      } catch (err) {
        console.error('Failed to load presets', err);
      }
    };
    loadPresets();
  }, []);

  // Compute simulation via backend
  const runSimulation = async (
    customBuf = bufferSize,
    customText = inputText,
    customMode = simulationMode
  ) => {
    setLoading(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const result = await api.runSimulation(customBuf, customText, customMode);
      setSimulationResult(result);

      // Initialize displayed cells in "empty" state for step-through animation
      const initialCells: MemoryCell[] = result.cells.map((cell) => ({
        ...cell,
        char: '',
        byte_hex: '0x00',
        is_occupied: false,
        is_null_terminator: false,
        is_overflow: false,
      }));
      setDisplayedCells(initialCells);
      setActiveStepIndex(-1);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation on mount
  useEffect(() => {
    runSimulation();
  }, []);

  // Preset selector
  const handleSelectPreset = (p: SimulationPreset) => {
    setBufferSize(p.buffer_size);
    setInputText(p.input_text);
    setSimulationMode(p.mode);
    runSimulation(p.buffer_size, p.input_text, p.mode);
  };

  // Step-through animation engine
  const stepForward = () => {
    if (!simulationResult) return;
    const nextIndex = activeStepIndex + 1;
    if (nextIndex < simulationResult.cells.length) {
      setActiveStepIndex(nextIndex);
      const targetCell = simulationResult.cells[nextIndex];
      setDisplayedCells((prev) =>
        prev.map((c, i) => (i === nextIndex ? targetCell : c))
      );
    } else {
      setIsPlaying(false);
    }
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!simulationResult) return;
    const initialCells: MemoryCell[] = simulationResult.cells.map((cell) => ({
      ...cell,
      char: '',
      byte_hex: '0x00',
      is_occupied: false,
      is_null_terminator: false,
      is_overflow: false,
    }));
    setDisplayedCells(initialCells);
    setActiveStepIndex(-1);
  };

  const revealAllCells = () => {
    if (!simulationResult) return;
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedCells(simulationResult.cells);
    setActiveStepIndex(simulationResult.cells.length - 1);
  };

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStepIndex((curr) => {
          if (!simulationResult) return curr;
          const next = curr + 1;
          if (next >= simulationResult.cells.length) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return curr;
          }
          const targetCell = simulationResult.cells[next];
          setDisplayedCells((prev) =>
            prev.map((c, i) => (i === next ? targetCell : c))
          );
          return next;
        });
      }, animationSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, animationSpeed, simulationResult]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          Interactive Memory Security Lab
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Buffer Overflow Simulator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore how unchecked character copies violate buffer boundaries and overwrite adjacent stack frames in memory.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Recommended Educational Presets:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-xl text-left border transition-all ${
                inputText === preset.input_text && bufferSize === preset.buffer_size
                  ? 'bg-cyan-950/70 border-cyan-500/80 shadow-sm shadow-cyan-950'
                  : 'bg-dark-800/80 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  {preset.input_text}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    preset.mode === 'SAFE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {preset.mode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            Simulation Parameters
          </h3>

          {/* Buffer Capacity */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Buffer Capacity:</span>
              <span className="text-cyan-400 font-mono font-bold">{bufferSize} Bytes</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              step="2"
              value={bufferSize}
              onChange={(e) => {
                const sz = Number(e.target.value);
                setBufferSize(sz);
                runSimulation(sz, inputText, simulationMode);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>4 Bytes</span>
              <span>16 Bytes</span>
              <span>32 Bytes</span>
            </div>
          </div>

          {/* Input Text */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Input String Payload:</span>
              <span className="text-slate-400 font-mono">
                {inputText.length} chars (+1 null = {inputText.length + 1}B)
              </span>
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                const txt = e.target.value;
                setInputText(txt);
                runSimulation(bufferSize, txt, simulationMode);
              }}
              placeholder="Enter text to copy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Mode Selector */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Demonstration Mode:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSimulationMode('UNSAFE_CONCEPTUAL');
                  runSimulation(bufferSize, inputText, 'UNSAFE_CONCEPTUAL');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  simulationMode === 'UNSAFE_CONCEPTUAL'
                    ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-sm shadow-rose-950'
                    : 'bg-dark-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                Unsafe Copy
              </button>

              <button
                onClick={() => {
                  setSimulationMode('SAFE');
                  runSimulation(bufferSize, inputText, 'SAFE');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  simulationMode === 'SAFE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-950'
                    : 'bg-dark-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Safe Bounded
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-3.5 rounded-xl bg-dark-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Bytes Required:</span>
              <span className="font-mono font-bold text-slate-200">{inputText.length + 1} B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Buffer Allocation:</span>
              <span className="font-mono font-bold text-cyan-400">{bufferSize} B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overflow Status:</span>
              <span
                className={`font-mono font-bold ${
                  simulationResult?.is_overflow ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {simulationResult?.is_overflow
                  ? `+${simulationResult.excess_bytes} Bytes Overflow`
                  : 'Bounded Safe'}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Grid Visualization Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                Simulated Memory Buffer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contiguous memory slots showing character writes and boundary violations.
              </p>
            </div>

            {/* Animation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Animate'}
              </button>

              <button
                onClick={stepForward}
                disabled={isPlaying}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 flex items-center gap-1"
                title="Step one byte forward"
              >
                <StepForward className="w-3.5 h-3.5" />
                Step
              </button>

              <button
                onClick={revealAllCells}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                title="Instantly reveal all bytes"
              >
                <FastForward className="w-3.5 h-3.5" />
                Show All
              </button>

              <button
                onClick={resetAnimation}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Reset animation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed selector */}
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="px-2 py-1 rounded bg-dark-800 border border-slate-700 text-slate-300 text-xs font-mono"
              >
                <option value={900}>0.5x</option>
                <option value={600}>1.0x</option>
                <option value={300}>2.0x</option>
              </select>
            </div>
          </div>

          {/* Grid Render */}
          <MemoryGrid
            cells={displayedCells.length > 0 ? displayedCells : (simulationResult?.cells || [])}
            bufferSize={bufferSize}
            highlightIndex={activeStepIndex}
            isOverflow={Boolean(simulationResult?.is_overflow)}
          />

          {/* Technical Explanation Callout */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-dark-900/90 border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <Info className="w-4 h-4 text-cyan-400" />
                Memory Safety Architecture Insight:
              </div>
              <p className="text-slate-400 leading-relaxed">
                {simulationResult.explanation}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-400">Null Terminator Rule:</span>{' '}
                  <span className="text-cyan-300">C strings require 1 extra byte for '\0'</span>
                </div>
                <div>
                  <span className="text-slate-400">Exploit Risk:</span>{' '}
                  <span className="text-rose-400">CWE-121 Stack Buffer Overflow</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
