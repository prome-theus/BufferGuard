import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsOverview, AnalyticsTrend } from '../types';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Layers,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovData, trData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getAnalyticsTrends(),
        ]);
        setOverview(ovData);
        setTrends(trData);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const severityData = overview
    ? Object.entries(overview.severity_distribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const cweData = overview?.cwe_distribution || [];

  const safeRatioData = overview
    ? [
        { name: 'Safe Programs', value: overview.scans_comparison.safe, color: '#10b981' },
        { name: 'Vulnerable Programs', value: overview.scans_comparison.vulnerable, color: '#f43f5e' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          Security Telemetry & Metrics
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Analytics & Statistics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Historical vulnerability trend analysis, Common Weakness Enumeration (CWE) breakdown, and memory safety benchmarks.
        </p>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Safe Code Percentage
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {overview?.scans_comparison.safe_percentage ?? 0}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {overview?.scans_comparison.safe ?? 0} of {overview?.scans_comparison.total ?? 0} clean programs
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Critical Severity Findings
          </span>
          <div className="text-3xl font-extrabold text-rose-400 font-mono mt-1">
            {overview?.severity_distribution['Critical'] ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Immediate stack/heap risk</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Simulated Buffer Overflows
          </span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
            {overview?.simulation_metrics.overflow_detected ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Detected out-of-bounds writes</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            CWE Categories Mapped
          </span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
            {overview?.cwe_distribution.length ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">CWE-120, CWE-121, CWE-193, etc.</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Score Trend Over Scans */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Security Score Trajectory (Historical Scans)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  name="Security Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safe vs Vulnerable Donut */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            Program Posture Ratio
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {safeRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CWE Distribution Bar Chart */}
        <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Most Prevalent CWE Categories Identified
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cweData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cwe" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.split(':')[0]} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Vulnerabilities Found" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
