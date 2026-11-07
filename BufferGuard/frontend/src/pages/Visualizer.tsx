import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Binary,
  Layers,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  ArrowDown,
  Info,
  RefreshCw,
  Terminal,
  Database
} from 'lucide-react';

interface SegmentInfo {
  name: string;
  address: string;
  description: string;
  color: string;
  growth: string;
}

export const Visualizer: React.FC = () => {
  const [selectedPayload, setSelectedPayload] = useState<string>('EXPLOIT_PAYLOAD_ABC');
  const [activeTab, setActiveTab] = useState<'stack' | 'segments' | 'heap'>('stack');
  const [canaryIntact, setCanaryIntact] = useState<boolean>(false);
  const [adminOverwritten, setAdminOverwritten] = useState<boolean>(true);

  // Simulated memory addresses based on 32-bit x86 architecture
  const stackBase = 0x0061FEF8;
  const bufferAddress = 0x0061FED4;
  const canaryAddress = 0x0061FED0;
  const adminFlagAddress = 0x0061FECC;
  const returnAddressAddr = 0x0061FEFC;

  const bufferCapacity = 16;
  const payloadBytes = selectedPayload.split('').map((ch, idx) => ({
    char: ch,
    hex: '0x' + ch.charCodeAt(0).toString(16).toUpperCase(),
    index: idx,
  }));

  const segments: SegmentInfo[] = [
    {
      name: 'Stack Segment',
      address: '0x0061FEF8 (High Memory)',
      description: 'Grows downwards toward lower memory. Holds local variables, activation frames, saved base pointer (EBP), and return instruction pointer (EIP).',
      color: 'border-cyan-500/70 bg-cyan-950/40 text-cyan-300',
      growth: 'Grows ↓ (High → Low)',
    },
    {
      name: 'Heap Segment',
      address: '0x00CF1D38 (Dynamic Memory)',
      description: 'Grows upwards toward higher memory. Managed dynamically via malloc(), calloc(), realloc(), and free().',
      color: 'border-purple-500/70 bg-purple-950/40 text-purple-300',
      growth: 'Grows ↑ (Low → High)',
    },
    {
      name: 'BSS Segment (.bss)',
      address: '0x0040EA24',
      description: 'Block Started by Symbol. Uninitialized global and static variables. Automatically initialized to zero by kernel upon program load.',
      color: 'border-slate-600 bg-slate-900/60 text-slate-300',
      growth: 'Fixed Allocation',
    },
    {
      name: 'Initialized Data Segment (.data)',
      address: '0x0040A004',
      description: 'Contains global and static variables explicitly initialized by developer (e.g., int global_var = 100).',
      color: 'border-blue-500/70 bg-blue-950/40 text-blue-300',
      growth: 'Fixed Allocation',
    },
    {
      name: 'Text / Code Segment',
      address: '0x00401489 (Low Memory)',
      description: 'Read-only binary CPU instructions and compiled assembly code. Protected by OS with write-disabled memory permissions.',
      color: 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300',
      growth: 'Read-Only Binary',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <Binary className="w-4 h-4" />
          Low-Level Memory Architecture Visualizer
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Live Memory Visualizer
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inspect how process virtual address space, stack activation frames, local buffers, canary sentinels, and return addresses are laid out in memory.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('stack')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'stack'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Stack Frame & Buffer Smashing
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'segments'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Process Virtual Memory Segments
        </button>

        <button
          onClick={() => setActiveTab('heap')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'heap'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Heap Allocation & Metadata
        </button>
      </div>

      {/* TAB 1: Stack Frame & Overflow */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Test Input Payload:</span>
              <input
                type="text"
                value={selectedPayload}
                onChange={(e) => setSelectedPayload(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-dark-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 w-64"
                placeholder="Enter payload string..."
              />
              <span className="text-xs text-slate-400 font-mono">
                {selectedPayload.length} bytes (Buffer capacity: 16B)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPayload('SAFE_STRING')}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Safe String (11B)
              </button>
              <button
                onClick={() => setSelectedPayload('EXPLOIT_PAYLOAD_CORRUPT_ADMIN_CANARY')}
                className="px-2.5 py-1 text-xs rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
              >
                Exploit String (37B)
              </button>
            </div>
          </div>

          {/* Stack Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  Stack Growth Direction: High Memory (0x61FEFC) → Low Memory (0x61FECC)
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Target Buffer: char[16] @ 0x{bufferAddress.toString(16).toUpperCase()}
                </span>
              </div>

              {/* Stack Frame Blocks */}
              <div className="space-y-3 font-mono text-xs">
                {/* 1. Return Address */}
                <div className="p-4 rounded-xl border border-amber-600/80 bg-amber-950/40 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-2">
                        Saved Return Address (EIP / RIP)
                        {selectedPayload.length > 24 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-sans font-bold animate-pulse">
                            TARGET HIJACKED!
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Address: 0x{returnAddressAddr.toString(16).toUpperCase()} • Offset: +24B from buffer
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded bg-dark-900 border border-slate-800 font-bold text-amber-300">
                        {selectedPayload.length > 28
                          ? '0x41414141 (Overwritten!)'
                          : '0x00401802 (Normal main() return)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Saved Base Pointer */}
                <div className="p-4 rounded-xl border border-indigo-600/80 bg-indigo-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-indigo-300">Saved Frame Pointer (EBP / RBP)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Address: 0x{stackBase.toString(16).toUpperCase()} • Offset: +20B from buffer
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-dark-900 border border-slate-800 font-bold text-indigo-300">
                      0x0061FF08
                    </span>
                  </div>
                </div>

                {/* 3. Stack Canary */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    selectedPayload.length > 16
                      ? 'border-rose-600 bg-rose-950/50'
                      : 'border-emerald-600/80 bg-emerald-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={`font-bold flex items-center gap-2 ${
                          selectedPayload.length > 16 ? 'text-rose-400' : 'text-emerald-300'
                        }`}
                      >
                        Stack Guard Sentinel (Canary)
                        {selectedPayload.length > 16 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-sans font-bold">
                            CORRUPTED (__stack_chk_fail)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-sans font-bold">
                            INTACT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Address: 0x{canaryAddress.toString(16).toUpperCase()} • Sentinel: 0xDEADBEEF
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded bg-dark-900 border border-slate-800 font-bold ${
                        selectedPayload.length > 16 ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {selectedPayload.length > 16 ? '0x43424141' : '0xDEADBEEF'}
                    </span>
                  </div>
                </div>

                {/* 4. Target Buffer */}
                <div className="p-4 rounded-xl border-2 border-cyan-500 bg-cyan-950/50 shadow-md shadow-cyan-950">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-cyan-300 flex items-center gap-2">
                        Target Buffer: char buffer[16]
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-sans font-bold">
                          Allocated 16 Bytes
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Address: 0x{bufferAddress.toString(16).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-xs text-cyan-300 font-mono">
                      Holds: {Math.min(selectedPayload.length, 16)} / 16 Bytes
                    </span>
                  </div>

                  {/* Character Byte Cells */}
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 mt-3">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const ch = selectedPayload[i] || '\0';
                      const hex = '0x' + (selectedPayload.charCodeAt(i) || 0).toString(16).toUpperCase();
                      const isFilled = i < selectedPayload.length;
                      return (
                        <div
                          key={i}
                          className={`p-1.5 rounded text-center border text-[11px] ${
                            isFilled
                              ? 'bg-cyan-900/60 border-cyan-500/70 text-cyan-200'
                              : 'bg-dark-900 border-slate-800 text-slate-600'
                          }`}
                        >
                          <div className="font-bold">{ch === '\0' ? '\\0' : ch}</div>
                          <div className="text-[9px] opacity-75">{hex}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Adjacent Admin Flag Variable */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    selectedPayload.length > 18
                      ? 'border-rose-600 bg-rose-950/40 text-rose-300'
                      : 'border-slate-700 bg-dark-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        Adjacent Local Variable: volatile int is_admin
                        {selectedPayload.length > 18 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-sans font-bold animate-pulse">
                            PRIVILEGE ESCALATION!
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Address: 0x{adminFlagAddress.toString(16).toUpperCase()}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-dark-900 border border-slate-800 font-bold">
                      {selectedPayload.length > 18 ? 'Value: 1 (ADMIN UNLOCKED)' : 'Value: 0 (LOCKED)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Architecture Explanation */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  How Buffer Overflow Hijacks CPU
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In x86 assembly, function calls push parameters, the current Instruction Pointer
                  (EIP), and Base Pointer (EBP) onto the stack.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Because local buffers are written upwards toward higher memory addresses, an
                  unchecked copy spills past <code>buffer[16]</code> directly into:
                </p>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                  <li>Adjacent local variables (e.g. <code>is_admin</code> auth flags)</li>
                  <li>Stack canary sentinel (detects corruption upon function return)</li>
                  <li>Saved Base Pointer (EBP)</li>
                  <li><strong>Return Address (EIP):</strong> directs CPU instruction fetch upon <code>RET</code>.</li>
                </ol>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  C Engine Inspection Output
                </h4>
                <div className="p-3 rounded-xl bg-dark-900 font-mono text-[11px] text-cyan-300 space-y-1 overflow-x-auto">
                  <div>$ ./bin/memory_layout.exe</div>
                  <div>[*] target_buffer  = 0x0061FED4</div>
                  <div>[*] canary_sim     = 0x0061FED0</div>
                  <div>[*] is_admin_flag  = 0x0061FECC</div>
                  <div>[*] frame_address  = 0x0061FEF8</div>
                  <div>[*] return_address = 0x00401802</div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Memory layout obtained from controlled C11 binary compiled with MinGW GCC.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Process Virtual Memory Segments */}
      {activeTab === 'segments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((seg, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border glass-panel transition-all hover:scale-[1.01] ${seg.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold">{seg.name}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-dark-900/80 border border-slate-700">
                    {seg.growth}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-400 mb-2">{seg.address}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{seg.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Heap Allocation & Metadata */}
      {activeTab === 'heap' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200">
            Heap Chunk Anatomy (glibc ptmalloc / dlmalloc)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            When dynamic memory is allocated via <code>malloc(size)</code>, the allocator prefixes the
            returned memory pointer with chunk metadata containing chunk size flags and prev_size.
            Writing beyond allocated heap bytes corrupts these metadata headers (CWE-122).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs mt-4">
            <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
              <span className="text-slate-400 block mb-1">prev_size (4/8 Bytes)</span>
              <span className="text-cyan-400 font-bold">0x00000000</span>
              <p className="text-[10px] text-slate-400 mt-1">Size of previous chunk if free</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
              <span className="text-slate-400 block mb-1">size | A|M|P (4/8 Bytes)</span>
              <span className="text-cyan-400 font-bold">0x00000021</span>
              <p className="text-[10px] text-slate-400 mt-1">Chunk size + PREV_INUSE flag</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/80 md:col-span-2">
              <span className="text-cyan-400 block mb-1 font-bold">User Data Payload (malloc'd)</span>
              <span className="text-slate-200 font-bold">"HEAP_ALLOCATED_CHUNK\0"</span>
              <p className="text-[10px] text-slate-300 mt-1">Address returned to developer pointer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
