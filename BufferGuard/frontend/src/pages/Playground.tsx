import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { PlaygroundExample, CompileResult, RunApprovedResult } from '../types';
import {
  Code2,
  Play,
  CheckCircle,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Info,
  Bug
} from 'lucide-react';

export const Playground: React.FC = () => {
  const [examples, setExamples] = useState<PlaygroundExample[]>([]);
  const [selectedExampleId, setSelectedExampleId] = useState<string>('stack_overflow_safe');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'console' | 'policy' | 'asan'>('console');

  const [compiling, setCompiling] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [compileOutput, setCompileOutput] = useState<CompileResult | null>(null);
  const [runOutput, setRunOutput] = useState<RunApprovedResult | null>(null);

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const data = await api.getPlaygroundExamples();
        setExamples(data);
        if (data.length > 0) {
          const defaultEx = data.find((e) => e.id === 'stack_overflow_safe') || data[0];
          setSelectedExampleId(defaultEx.id);
          setCurrentCode(defaultEx.code);
        }
      } catch (err) {
        console.error('Failed to load playground examples', err);
      }
    };
    fetchExamples();
  }, []);

  const handleSelectExample = (ex: PlaygroundExample) => {
    setSelectedExampleId(ex.id);
    setCurrentCode(ex.code);
    setCompileOutput(null);
    setRunOutput(null);
  };

  const handleCompile = async () => {
    setCompiling(true);
    setCompileOutput(null);
    try {
      const res = await api.compileCodeSyntax(currentCode);
      setCompileOutput(res);
      setActiveTab('console');
    } catch (err: any) {
      setCompileOutput({
        success: false,
        is_syntax_valid: false,
        errors: err.message || 'Compilation failed.',
      });
    } finally {
      setCompiling(false);
    }
  };

  const handleRunApproved = async () => {
    setRunning(true);
    setRunOutput(null);
    try {
      const res = await api.runApprovedExample(selectedExampleId);
      setRunOutput(res);
      setActiveTab('console');
    } catch (err: any) {
      setRunOutput({
        success: false,
        error: err.message || 'Execution error.',
      });
    } finally {
      setRunning(false);
    }
  };

  const currentExample = examples.find((e) => e.id === selectedExampleId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          Controlled Educational Execution Environment
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Secure Coding Playground
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compile, inspect, and safely execute approved C benchmark programs with AddressSanitizer concepts and defensive boundaries.
        </p>
      </div>

      {/* Benchmark Programs Catalog Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Educational Benchmark Examples:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {examples.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExample(ex)}
              className={`p-3 rounded-xl text-left border transition-all text-xs ${
                selectedExampleId === ex.id
                  ? 'bg-cyan-950/70 border-cyan-500/80 shadow-sm shadow-cyan-950'
                  : 'bg-dark-800/80 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    ex.is_safe
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {ex.is_safe ? 'SECURE' : 'UNSAFE'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{ex.filename}</span>
              </div>
              <div className="font-bold text-slate-200 line-clamp-1">{ex.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Editor Area */}
        <div className="xl:col-span-7 glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 bg-dark-800/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentExample?.filename || 'program.c'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompile}
                disabled={compiling}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                {compiling ? 'Checking...' : 'Check Syntax'}
              </button>

              <button
                onClick={handleRunApproved}
                disabled={running}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {running ? 'Executing...' : 'Run Approved'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="h-[520px] w-full">
            <Editor
              height="100%"
              defaultLanguage="c"
              language="c"
              theme="vs-dark"
              value={currentCode}
              onChange={(val) => setCurrentCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'Fira Code, JetBrains Mono, Consolas, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Info Footer */}
          <div className="p-3 bg-dark-900 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>{currentExample?.description}</span>
            <span className="font-mono text-cyan-400">GCC -std=c11</span>
          </div>
        </div>

        {/* Console / ASan Output Area */}
        <div className="xl:col-span-5 glass-panel rounded-2xl border border-slate-800 flex flex-col h-[620px] overflow-hidden">
          {/* Console Tabs */}
          <div className="p-3 bg-dark-800/90 border-b border-slate-800 flex items-center gap-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'console'
                  ? 'bg-dark-900 text-cyan-400 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Runtime Console
            </button>

            <button
              onClick={() => setActiveTab('asan')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'asan'
                  ? 'bg-dark-900 text-cyan-400 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              AddressSanitizer Output
            </button>

            <button
              onClick={() => setActiveTab('policy')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'policy'
                  ? 'bg-dark-900 text-cyan-400 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Sandbox Policy
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 bg-dark-950 font-mono text-xs overflow-y-auto space-y-4">
            {activeTab === 'console' && (
              <div className="space-y-4">
                {/* Syntax Check Output */}
                {compileOutput && (
                  <div
                    className={`p-3 rounded-xl border ${
                      compileOutput.is_syntax_valid
                        ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                        : 'border-rose-800 bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      {compileOutput.is_syntax_valid ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      Syntax Check Result:
                    </div>
                    <pre className="whitespace-pre-wrap text-[11px] opacity-90">
                      {compileOutput.output || compileOutput.errors || compileOutput.message}
                    </pre>
                  </div>
                )}

                {/* Execution Run Output */}
                {runOutput ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                      <span>Target: {runOutput.title || selectedExampleId}</span>
                      <span>Return Code: {runOutput.returncode ?? 0}</span>
                    </div>

                    {runOutput.stdout && (
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px]">STDOUT:</span>
                        <pre className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-emerald-300 whitespace-pre-wrap leading-relaxed">
                          {runOutput.stdout}
                        </pre>
                      </div>
                    )}

                    {runOutput.stderr && (
                      <div className="space-y-1">
                        <span className="text-rose-400 text-[11px]">STDERR / FAULT:</span>
                        <pre className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 whitespace-pre-wrap leading-relaxed">
                          {runOutput.stderr}
                        </pre>
                      </div>
                    )}

                    {runOutput.error && (
                      <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300">
                        {runOutput.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-12 space-y-2">
                    <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                    <p>Click "Run Approved" to compile and run this benchmark example.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'asan' && (
              <div className="space-y-3 text-slate-300">
                <div className="p-3 rounded-xl bg-dark-900 border border-cyan-800/60 font-mono text-[11px] text-cyan-300">
                  gcc -fsanitize=address -g program.c -o program
                </div>
                <pre className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-rose-300 leading-relaxed text-[11px] whitespace-pre-wrap">
{`=================================================================
==12844==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffd5e39b968
WRITE of size 1 at 0x7ffd5e39b968 thread T0
    #0 0x4012c8 in vulnerable_function stack_overflow_unsafe.c:21
    #1 0x401314 in main stack_overflow_unsafe.c:27
Address 0x7ffd5e39b968 is located in stack of thread T0 at offset 40 in frame
    #0 0x401200 in vulnerable_function stack_overflow_unsafe.c:16

  This frame has 1 object(s):
    [32, 40) 'small_buffer' <== Memory access overflows bounds
=================================================================`}
                </pre>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AddressSanitizer surrounds stack and heap buffers with poison shadow bytes (Redzones)
                  and intercepts any out-of-bounds pointer dereference immediately.
                </p>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-xs text-slate-300 space-y-3">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Host Execution Security Boundary
                </div>
                <p className="text-slate-400 leading-relaxed">
                  BufferGuard strictly prevents arbitrary, user-supplied C binaries from executing
                  directly on the server host machine.
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-[11px]">
                  <li>Execution is permitted exclusively for pre-approved educational benchmark templates.</li>
                  <li>Arbitrary source code submitted by users can be validated for syntactic correctness via <code>gcc -fsyntax-only</code>.</li>
                  <li>Arbitrary code is safely analyzed statically using the C Code Vulnerability Scanner.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
