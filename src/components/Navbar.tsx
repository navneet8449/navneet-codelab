import React from 'react';
import { 
  Code2, 
  Cpu, 
  Users, 
  Mic, 
  BarChart3, 
  Flame, 
  HelpCircle,
  Sparkles 
} from 'lucide-react';
import { UserProgress } from '../types';
import { calculateReadinessIndex } from '../utils/storage';

interface NavbarProps {
  activeTab: 'cpp' | 'technical' | 'hr' | 'mock' | 'progress';
  setActiveTab: (tab: 'cpp' | 'technical' | 'hr' | 'mock' | 'progress') => void;
  progress: UserProgress;
  onOpenGuide: () => void;
}

interface NavItem {
  id: 'cpp' | 'technical' | 'hr' | 'mock' | 'progress';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onOpenGuide,
}) => {
  const readiness = calculateReadinessIndex(progress);

  const navItems: NavItem[] = [
    { id: 'cpp', label: 'C++ Coding Practice', icon: Code2, badge: 'Beginner' },
    { id: 'technical', label: 'Project & Skill Questions', icon: Cpu },
    { id: 'hr', label: 'HR Practice (Simple English)', icon: Users },
    { id: 'mock', label: 'AI Mock Interview', icon: Mic, badge: 'Interactive' },
    { id: 'progress', label: 'Dashboard & Readiness', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Navneet CodeLab */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex flex-col items-center justify-center relative overflow-hidden">
                <span className="font-mono font-black text-sm tracking-tighter bg-gradient-to-r from-indigo-200 via-white to-emerald-300 bg-clip-text text-transparent">
                  NP
                </span>
                <span className="text-[8px] font-mono text-indigo-400/80 -mt-0.5 leading-none">
                  &lt;/&gt;
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Navneet <span className="text-indigo-400">CodeLab</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                  Dev Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block font-medium">
                Coding Practice &amp; Interview Preparation
              </p>
            </div>
          </div>

          {/* Quick Stats & Help */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{progress.streakDays} Day Streak</span>
            </div>

            {/* Readiness Index */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
              <span className="text-xs text-slate-400">Readiness:</span>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${
                  readiness >= 75 ? 'text-emerald-400' : readiness >= 45 ? 'text-indigo-400' : 'text-amber-400'
                }`}>
                  {readiness}%
                </span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      readiness >= 75 ? 'bg-emerald-500' : readiness >= 45 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Setup & Instructions Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-colors"
              title="Setup Instructions and Placement Tips"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Guide & Setup</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-indigo-800 text-indigo-200'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
