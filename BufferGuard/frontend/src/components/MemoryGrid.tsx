import React from 'react';
import { motion } from 'framer-motion';
import { MemoryCell } from '../types';
import { AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface MemoryGridProps {
  cells: MemoryCell[];
  bufferSize: number;
  highlightIndex?: number;
  isOverflow: boolean;
}

export const MemoryGrid: React.FC<MemoryGridProps> = ({
  cells,
  bufferSize,
  highlightIndex,
  isOverflow,
}) => {
  return (
    <div className="space-y-4">
      {/* Legend & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 rounded-xl bg-dark-800/80 border border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span className="text-slate-400">Empty Allocated (0x00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-500/60" />
            <span className="text-cyan-300">Valid Buffer Write</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500/60" />
            <span className="text-emerald-300">Null Terminator (\0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-950 border border-rose-500/80 animate-pulse" />
            <span className="text-rose-400 font-semibold">Out-of-Bounds Corruption</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-400">Buffer Boundary:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-bold">
            {bufferSize} Bytes
          </span>
        </div>
      </div>

      {/* Memory Cells Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {cells.map((cell, idx) => {
          const isAtBoundary = idx === bufferSize - 1;
          const isExceeded = cell.is_overflow;
          const isCurrentHighlight = highlightIndex === idx;

          let cellBg = 'bg-slate-900/90 border-slate-800 text-slate-500';
          let glow = '';

          if (cell.is_null_terminator) {
            cellBg = 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300';
            glow = 'shadow-sm shadow-emerald-500/20';
          } else if (cell.is_overflow) {
            cellBg = 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold';
            glow = 'shadow-md shadow-rose-600/30 ring-1 ring-rose-500/50';
          } else if (cell.is_occupied) {
            cellBg = 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300';
            glow = 'shadow-sm shadow-cyan-500/20';
          }

          if (isCurrentHighlight) {
            glow += ' ring-2 ring-yellow-400 scale-105 transition-transform';
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className={`relative rounded-xl border p-3 flex flex-col items-center justify-between transition-all ${cellBg} ${glow}`}
            >
              {/* Boundary indicator banner */}
              {isAtBoundary && (
                <div className="absolute -top-2.5 right-1 px-1.5 py-0.2 bg-cyan-500 text-dark-900 text-[9px] font-black uppercase tracking-wider rounded shadow">
                  Limit
                </div>
              )}

              {/* Offset & Index */}
              <div className="w-full flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>[{idx}]</span>
                <span>+{idx}B</span>
              </div>

              {/* Stored Character Representation */}
              <div className="my-1.5 flex flex-col items-center justify-center">
                <span className="text-2xl font-mono font-extrabold tracking-wider">
                  {cell.char || '·'}
                </span>
                <span className="text-[11px] font-mono opacity-80 mt-0.5">
                  {cell.byte_hex}
                </span>
              </div>

              {/* Status Badge */}
              <div className="w-full text-center mt-1">
                {cell.is_overflow ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-950/90 px-1.5 py-0.5 rounded border border-rose-800">
                    <AlertTriangle className="w-2.5 h-2.5" /> OVERFLOW
                  </span>
                ) : cell.is_null_terminator ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-800">
                    <CheckCircle className="w-2.5 h-2.5" /> NULL (\0)
                  </span>
                ) : cell.is_occupied ? (
                  <span className="text-[10px] text-cyan-400 font-medium bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    BOUNDED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">UNUSED</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Memory Status Callout */}
      {isOverflow ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-rose-300">
              BUFFER OVERFLOW DETECTED: Out-of-Bounds Memory Corruption
            </p>
            <p className="text-rose-200/90 leading-relaxed">
              The input text exceeds the designated {bufferSize}-byte buffer boundary. The red
              highlighted memory cells represent adjacent memory that would be overwritten in an
              unchecked C runtime environment, leading to potential variable modification, frame
              pointer poisoning, or return address hijacking.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-300">SAFE MEMORY STATE: Strictly Bounded</p>
            <p className="text-emerald-200/90 leading-relaxed">
              All characters securely fit within the allocated buffer capacity of {bufferSize} bytes,
              including the mandatory terminating null character (<code className="text-emerald-300 font-mono">\0</code>).
              No adjacent memory frames are disturbed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
