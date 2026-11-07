import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  ShieldAlert,
  Terminal,
  Database,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'arch' | 'engine' | 'viva' | 'api'>('arch');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Technical Reference & Project Report
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Project Documentation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive university report documentation, architecture design diagrams, C engine specifications, and viva defense guide.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSection('arch')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === 'arch'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          System Architecture & Data Flow
        </button>

        <button
          onClick={() => setActiveSection('engine')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === 'engine'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          C11 Core Engine & Safe Functions
        </button>

        <button
          onClick={() => setActiveSection('viva')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === 'viva'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Technical Viva & Defense Guide
        </button>

        <button
          onClick={() => setActiveSection('api')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSection === 'api'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          REST API Specifications
        </button>
      </div>

      {/* Section 1: Architecture & Data Flow */}
      {activeSection === 'arch' && (
        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. Multi-Tiered System Architecture
            </h3>
            <p>
              BufferGuard is engineered with a strict tripartite separation of concerns to ensure safety,
              responsiveness, and pedagogical clarity:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
                <span className="font-bold text-cyan-400 block mb-1">Presentation Layer</span>
                <span className="text-[11px] text-slate-400 block mb-2">React 18 + Vite + Tailwind + Monaco</span>
                <p className="text-[11px] text-slate-300">
                  Renders interactive memory cells, Monaco code editor, dynamic Recharts telemetry, and responsive security dashboards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
                <span className="font-bold text-indigo-400 block mb-1">Orchestration & API Layer</span>
                <span className="text-[11px] text-slate-400 block mb-2">FastAPI + SQLAlchemy + SQLite</span>
                <p className="text-[11px] text-slate-300">
                  Parses C AST/tokens via regex heuristics, persists audit records, exposes REST endpoints, and manages host sandboxing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
                <span className="font-bold text-emerald-400 block mb-1">C11 Core Engine</span>
                <span className="text-[11px] text-slate-400 block mb-2">GCC Compiler + Safe String Lib</span>
                <p className="text-[11px] text-slate-300">
                  Controlled low-level memory layout inspection, safe string library implementation (<code>safe_str.c</code>), and educational benchmarks.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-dark-950 font-mono text-[11px] text-cyan-300 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold mb-1">// End-to-End Analysis Workflow:</div>
              <div>1. User writes/pastes/uploads C code in Monaco Editor</div>
              <div>2. Frontend dispatches POST /api/scanner/analyze payload to FastAPI backend</div>
              <div>3. CCodeScanner engine checks declarations (char[N]), gets(), strcpy(), sprintf(), and loop bounds</div>
              <div>4. Findings mapped to CWE identifiers (CWE-120, CWE-121, CWE-122, CWE-193, CWE-787)</div>
              <div>5. Security score computed based on severity weights (Critical -25, High -15, Medium -8)</div>
              <div>6. Scan and Vulnerability records persisted to SQLite database and rendered in UI</div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: C11 Core Engine */}
      {activeSection === 'engine' && (
        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              BufferGuard C11 Safe String Library Specification
            </h3>
            <p>
              To remediate traditional standard library vulnerabilities, BufferGuard includes a self-contained,
              production-ready C11 safe string abstraction in <code>c_engine/safe_functions/safe_str.c</code>:
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
                <span className="text-cyan-400 font-bold">SafeStrStatus safe_strcpy(char *dest, size_t dest_size, const char *src);</span>
                <p className="text-slate-400 font-sans mt-1">
                  Copies up to <code>dest_size - 1</code> bytes from source. Guarantees null-termination.
                  Returns <code>SAFE_STR_TRUNCATED</code> if source length exceeded buffer capacity.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
                <span className="text-cyan-400 font-bold">SafeStrStatus safe_strcat(char *dest, size_t dest_size, const char *src);</span>
                <p className="text-slate-400 font-sans mt-1">
                  Safely concatenates source to destination while validating that final length fits within <code>dest_size - 1</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800">
                <span className="text-cyan-400 font-bold">SafeStrStatus safe_readline(char *dest, size_t dest_size, FILE *stream);</span>
                <p className="text-slate-400 font-sans mt-1">
                  Safe alternative to gets() and scanf("%s"). Reads bounded line, strips newline characters, and flushes leftover characters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Technical Viva Defense */}
      {activeSection === 'viva' && (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Frequently Asked Questions for Project Viva & Technical Defense
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300">Q1: Why is C susceptible to buffer overflows while languages like Java or Python are not?</span>
                <p className="text-slate-400">
                  C was designed for maximum hardware efficiency and systems programming without a heavy runtime or garbage collector.
                  In C, arrays decay to raw pointers, and the CPU dereferences memory directly without runtime boundary checks. Java and Python
                  enforce array boundary validation in the JVM / interpreter and throw exceptions (IndexOutOfBoundsException).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300">Q2: What is the purpose of the null terminator '\0'?</span>
                <p className="text-slate-400">
                  Because C strings do not store an explicit length header, functions like strlen(), strcpy(), and printf("%s") scan contiguous
                  bytes sequentially until encountering 0x00. Omitting the null terminator leads to information disclosure (Heartbleed-style bug)
                  or infinite string writes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300">Q3: How does a stack canary mitigate buffer overflow attacks?</span>
                <p className="text-slate-400">
                  The compiler inserts a random pseudo-random integer (the canary) directly between local variables and the saved return address.
                  Before a function executes <code>RET</code>, it verifies if the canary value remains unmodified. If corrupted, it immediately
                  aborts the process via <code>__stack_chk_fail()</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300">Q4: Why does BufferGuard isolate arbitrary C execution?</span>
                <p className="text-slate-400">
                  Executing untrusted C binaries on the server host machine would expose the operating system to arbitrary code execution,
                  fork-bombs, file modification, and reverse shells. BufferGuard enforces strict isolation: arbitrary code can be syntax-checked
                  and statically scanned, while execution is restricted to verified educational benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: REST API Specs */}
      {activeSection === 'api' && (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              REST API Endpoints Summary
            </h3>

            <div className="overflow-x-auto font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-dark-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Method</th>
                    <th className="p-3">Path</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 text-emerald-400 font-bold">GET</td>
                    <td className="p-3">/api/health</td>
                    <td className="p-3 font-sans text-slate-300">Backend health and database status</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400 font-bold">POST</td>
                    <td className="p-3">/api/scanner/analyze</td>
                    <td className="p-3 font-sans text-slate-300">Run static memory-safety audit on C source</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400 font-bold">POST</td>
                    <td className="p-3">/api/simulator/run</td>
                    <td className="p-3 font-sans text-slate-300">Compute memory grid cell state for buffer simulation</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-400 font-bold">GET</td>
                    <td className="p-3">/api/dashboard/summary</td>
                    <td className="p-3 font-sans text-slate-300">Aggregate scan metrics and security score</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400 font-bold">POST</td>
                    <td className="p-3">/api/reports/generate</td>
                    <td className="p-3 font-sans text-slate-300">Generate downloadable PDF/JSON/CSV report</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
