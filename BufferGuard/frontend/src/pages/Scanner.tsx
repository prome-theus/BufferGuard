import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { VulnerabilityCard } from '../components/VulnerabilityCard';
import { ScanResult, Vulnerability } from '../types';
import {
  ShieldAlert,
  Play,
  Upload,
  Download,
  Trash2,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';

export const Scanner: React.FC = () => {
  const [code, setCode] = useState<string>(`#include <stdio.h>
#include <string.h>

void vulnerable_login(void) {
    char password[8];
    int is_admin = 0;

    printf("Enter authorization code: ");
    /* DANGEROUS: gets() does no boundary checking! */
    gets(password);

    if (strcmp(password, "SECRET") == 0) {
        is_admin = 1;
    }

    if (is_admin != 0) {
        printf("[+] ACCESS GRANTED\\n");
    } else {
        printf("[-] ACCESS DENIED\\n");
    }
}

int main(void) {
    vulnerable_login();
    return 0;
}
`);
  const [filename, setFilename] = useState<string>('auth_service.c');
  const [samples, setSamples] = useState<Record<string, { title: string; filename: string; code: string }>>({});
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample programs on mount
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const data = await api.getSamplePrograms();
        setSamples(data);
      } catch (err) {
        console.error('Failed to load sample programs', err);
      }
    };
    fetchSamples();
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const jumpToLine = (lineNumber: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.focus();
    }
  };

  const runScan = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeCode(filename, code);
      setScanResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Scan failed to complete.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        // Automatically scan uploaded file
        api.analyzeCode(file.name, content).then(setScanResult).catch(console.error);
      }
    };
    reader.readAsText(file);
  };

  const loadPreset = (key: string) => {
    const s = samples[key];
    if (s) {
      setCode(s.code);
      setFilename(s.filename);
      api.analyzeCode(s.filename, s.code).then(setScanResult).catch(console.error);
    }
  };

  const downloadRemediatedCode = () => {
    if (!scanResult) return;
    let remediated = code;
    // Replace vulnerable lines with safer code where available
    scanResult.vulnerabilities.forEach((v) => {
      if (v.code_snippet && v.safer_code) {
        remediated = remediated.replace(v.code_snippet, v.safer_code);
      }
    });

    const blob = new Blob([remediated], { type: 'text/x-csrc' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remediated_${filename}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          Static Security Analysis Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          C Code Vulnerability Scanner
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform context-aware lexical and structural scanning on C source code to identify memory corruption risks and CWE violations.
        </p>
      </div>

      {/* Sample Programs Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Built-in Benchmark Programs:
          </div>
          <span className="text-[11px] text-slate-400">Click to load instantly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(samples).map(([key, sample]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="p-3 rounded-xl text-left border bg-dark-800/80 border-slate-700/60 hover:border-cyan-500/70 hover:bg-slate-800 transition-all text-xs"
            >
              <div className="font-bold text-slate-200 mb-0.5">{sample.title}</div>
              <div className="text-[11px] text-cyan-400 font-mono">{sample.filename}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Results Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Monaco Code Editor */}
        <div className="xl:col-span-7 glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          {/* Editor Header Toolbar */}
          <div className="p-4 bg-dark-800/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-transparent border-b border-dashed border-slate-700 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".c,.h,.cpp,.txt"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Upload .c or .h file"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Upload
              </button>

              <button
                onClick={copyCode}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={() => setCode('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Clear editor"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={runScan}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {loading ? 'Scanning...' : 'Analyze Code'}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="h-[540px] w-full">
            <Editor
              height="100%"
              defaultLanguage="c"
              language="c"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
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

          {/* Editor Footer Status */}
          <div className="p-3 bg-dark-900 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>C11 Standard • UTF-8</span>
            <span>{code.split('\n').length} lines • {code.length} bytes</span>
          </div>
        </div>

        {/* Right Column: Scan Findings & Score */}
        <div className="xl:col-span-5 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {scanResult ? (
            <div className="space-y-4">
              {/* Security Score Header Card */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Security Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-4xl font-extrabold font-mono ${
                        scanResult.security_score >= 80
                          ? 'text-emerald-400'
                          : scanResult.security_score >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {scanResult.security_score}
                    </span>
                    <span className="text-slate-400 text-sm">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {scanResult.total_findings === 0
                      ? 'No vulnerabilities detected in inspected buffers.'
                      : `${scanResult.total_findings} security finding(s) require review.`}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <button
                    onClick={downloadRemediatedCode}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-dark-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5 transition-colors ml-auto shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Fix
                  </button>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Scan ID: #{scanResult.id}
                  </div>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {scanResult.vulnerabilities.length === 0 ? (
                  <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 space-y-2">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h4 className="text-base font-bold text-slate-200">
                      Clean Memory-Safety Inspection
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      No dangerous C library calls (gets, unbounded strcpy, sprintf) or array bounds
                      violations detected in this source code.
                    </p>
                  </div>
                ) : (
                  scanResult.vulnerabilities.map((vuln) => (
                    <VulnerabilityCard
                      key={vuln.id}
                      vulnerability={vuln}
                      onSelectLine={jumpToLine}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Blank state prompt */
            <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-200">
                Ready to Scan C Source Code
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Click <strong>"Analyze Code"</strong> or select one of the benchmark programs above to
                trigger static analysis and generate vulnerability remediation advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
