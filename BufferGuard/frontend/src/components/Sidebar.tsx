import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  ShieldAlert,
  Binary,
  Code2,
  FileText,
  BarChart3,
  GraduationCap,
  BookOpen,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/simulator', label: 'Buffer Overflow Simulator', icon: Cpu },
  { path: '/scanner', label: 'C Vulnerability Scanner', icon: ShieldAlert },
  { path: '/visualizer', label: 'Live Memory Visualizer', icon: Binary },
  { path: '/playground', label: 'Secure Coding Playground', icon: Code2 },
  { path: '/reports', label: 'Vulnerability Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics & Statistics', icon: BarChart3 },
  { path: '/learning', label: 'Learning Center', icon: GraduationCap },
  { path: '/docs', label: 'Project Documentation', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-dark-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-20 px-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                BufferGuard
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Memory Safety & Defense</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* University Badge Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-3 rounded-lg bg-dark-800/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              University Cybersecurity Project
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              C11 Memory Corruption Engine & Automated Vulnerability Remediation
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
