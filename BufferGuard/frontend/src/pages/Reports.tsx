import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ReportItem, ScanSummaryItem } from '../types';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [scans, setScans] = useState<ScanSummaryItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [reportType, setReportType] = useState<'PDF' | 'JSON' | 'CSV'>('PDF');
  const [generating, setGenerating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [scansData, reportsData] = await Promise.all([
        api.getScanHistory(),
        api.listReports(),
      ]);
      setScans(scansData);
      setReports(reportsData);
      if (scansData.length > 0 && selectedScanId === null) {
        setSelectedScanId(scansData[0].id);
      }
    } catch (err) {
      console.error('Failed to load reports data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedScanId) return;
    setGenerating(true);
    setSuccessMessage(null);
    try {
      const rep = await api.generateReport(selectedScanId, reportType);
      setReports((prev) => [rep, ...prev]);
      setSuccessMessage(`Successfully generated ${reportType} report for Scan #${selectedScanId}!`);
      // Auto download
      window.open(api.getReportDownloadUrl(rep.id), '_blank');
    } catch (err: any) {
      console.error('Generation error', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          Security Audit & Compliance Export
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Vulnerability Report Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Export formal cybersecurity inspection dossiers in PDF, JSON, and CSV formats based on real scan data.
        </p>
      </div>

      {/* Generator Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Generate New Security Audit Report
        </h3>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Scan Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Completed Scan:
            </label>
            <select
              value={selectedScanId || ''}
              onChange={(e) => setSelectedScanId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.filename} (Score: {s.security_score}%, {s.total_findings} findings)
                </option>
              ))}
            </select>
          </div>

          {/* Format Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Report Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PDF', 'JSON', 'CSV'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setReportType(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    reportType === fmt
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-950'
                      : 'bg-dark-900 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedScanId}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {generating ? 'Generating Document...' : `Generate & Download ${reportType}`}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Archive of Generated Reports
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-dark-900/80 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Scan Target</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Generated At</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {reports.length > 0 ? (
                reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">REP-{rep.id}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans font-medium">
                      Scan #{rep.scan_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.report_type === 'PDF'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : rep.report_type === 'JSON'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {rep.report_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">
                      {new Date(rep.generated_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={api.getReportDownloadUrl(rep.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No reports generated yet. Use the tool above to export your first security dossier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
