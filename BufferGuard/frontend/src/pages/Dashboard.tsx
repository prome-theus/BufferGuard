import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { DashboardSummary, RecentActivity } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Binary,
  Code2,
  FileText,
  AlertOctagon,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, actData] = await Promise.all([
          api.getDashboardSummary(),
          api.getRecentActivity(),
        ]);
        setSummary(sumData);
        setActivity(actData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const severityPieData = [
    { name: 'Critical', value: summary?.high_risk_findings || 1, color: '#f43f5e' },
    { name: 'Potential', value: summary?.potential_vulnerabilities || 2, color: '#f59e0b' },
    { name: 'Safe Operations', value: summary?.safe_programs || 1, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 bg-gradient-to-r from-dark-800 via-dark-900 to-dark-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            Cybersecurity Memory Protection Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            BufferGuard Defense Center
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Monitor C program memory safety, simulate out-of-bounds buffer corruptions in real time,
            and inspect compiler security defenses against CWE-120 and CWE-121 vulnerabilities.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate('/simulator')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20"
            >
              <Cpu className="w-4 h-4" />
              Start Simulator
            </button>

            <button
              onClick={() => navigate('/scanner')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/60 flex items-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              Scan C Code
            </button>

            <button
              onClick={() => navigate('/visualizer')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-slate-700 text-purple-400 border border-purple-800/60 flex items-center gap-2 transition-colors"
            >
              <Binary className="w-4 h-4" />
              Memory Visualizer
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overall Security Score"
          value={summary ? `${summary.overall_security_score}/100` : '--'}
          subtitle="Real-time average posture"
          icon={ShieldCheck}
          color="cyan"
          trend="+5.2% posture"
        />

        <StatsCard
          title="Total Scans Performed"
          value={summary?.total_scans ?? 0}
          subtitle="Analyzed C source files"
          icon={Activity}
          color="indigo"
        />

        <StatsCard
          title="High-Risk Vulnerabilities"
          value={summary?.high_risk_findings ?? 0}
          subtitle="CWE-120 / CWE-121 criticals"
          icon={AlertOctagon}
          color="rose"
        />

        <StatsCard
          title="Simulations Executed"
          value={summary?.total_simulations ?? 0}
          subtitle="Interactive memory traces"
          icon={Cpu}
          color="emerald"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Distribution Donut */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Vulnerability Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Database</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center text-xs">
            <div>
              <span className="text-rose-400 font-bold block">{summary?.high_risk_findings ?? 0}</span>
              <span className="text-slate-400 text-[11px]">Critical</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block">{summary?.potential_vulnerabilities ?? 0}</span>
              <span className="text-slate-400 text-[11px]">Potential</span>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block">{summary?.safe_programs ?? 0}</span>
              <span className="text-slate-400 text-[11px]">Safe</span>
            </div>
          </div>
        </div>

        {/* Recent Scan Findings Timeline */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Code Inspections
            </h3>
            <button
              onClick={() => navigate('/scanner')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              View Scanner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activity?.recent_scans && activity.recent_scans.length > 0 ? (
              activity.recent_scans.slice(0, 4).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/scanner`)}
                  className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        scan.findings === 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {scan.findings === 0 ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 font-mono block">
                        {scan.filename}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(scan.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm block ${
                        scan.score >= 80 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Score: {scan.score}%
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {scan.findings} finding(s)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">
                No recent scans logged in database.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Latest scan: {summary?.latest_scan_date ? new Date(summary.latest_scan_date).toLocaleDateString() : 'N/A'}</span>
            <span className="text-cyan-400 font-mono">SQLite Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
