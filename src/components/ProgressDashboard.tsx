import React from 'react';
import { 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Users, 
  Mic, 
  Award, 
  TrendingUp, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { UserProgress } from '../types';
import { calculateReadinessIndex, saveUserProgress } from '../utils/storage';
import { CPP_PROBLEMS } from '../data/cppProblems';

interface ProgressDashboardProps {
  progress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
  onNavigateTab: (tab: 'cpp' | 'technical' | 'hr' | 'mock') => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onProgressUpdate,
  onNavigateTab,
}) => {
  const readiness = calculateReadinessIndex(progress);

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset your practice progress? All stats will be set to fresh state.')) {
      const fresh: UserProgress = {
        solvedProblemIds: [],
        attemptedProblemIds: [],
        technicalAnswersCount: 0,
        hrAnswersPolishedCount: 0,
        mockInterviewsCompleted: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        streakDays: 1,
        recentScores: [],
        masteredSkills: [],
      };
      saveUserProgress(fresh);
      onProgressUpdate(fresh);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              Analytics & Tracking
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Placement Readiness Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track your preparation milestones across C++ algorithmic coding, project deep-dives, STAR behavioral answers, and mock interview performance.
          </p>
        </div>

        <button
          onClick={handleResetProgress}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-900/40 rounded-lg text-xs transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Stats</span>
        </button>
      </div>

      {/* Main Readiness Gauge & Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Index Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-400" />
              Interview Readiness Index
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              readiness >= 75
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : readiness >= 45
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {readiness >= 75 ? 'Placement Ready' : readiness >= 45 ? 'Solid Progress' : 'Early Phase'}
            </span>
          </div>

          {/* Big Circular Progress */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="text-slate-800"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className={
                    readiness >= 75 ? 'text-emerald-500' : readiness >= 45 ? 'text-indigo-500' : 'text-amber-500'
                  }
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - readiness / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">{readiness}%</span>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ready</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center max-w-xs mt-3 leading-relaxed">
              Calculated dynamically from your completed C++ coding solutions, project explanations, polished HR answers, and mock scores.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Recommended Next:</span>
            <button
              onClick={() => onNavigateTab(progress.solvedProblemIds.length < 5 ? 'cpp' : 'mock')}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              {progress.solvedProblemIds.length < 5 ? 'Solve C++ Problems' : 'Take a Mock Interview'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Stats Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4">
          {/* C++ Solved */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {Math.round((progress.solvedProblemIds.length / CPP_PROBLEMS.length) * 100)}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">
                {progress.solvedProblemIds.length} <span className="text-xs text-slate-500 font-normal">/ {CPP_PROBLEMS.length}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                C++ Problems Solved
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('cpp')}
              className="text-xs text-emerald-400 hover:underline mt-3 text-left font-semibold"
            >
              Practice More →
            </button>
          </div>

          {/* Tech Questions */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-violet-400 font-bold">
                {progress.technicalAnswersCount} Drills
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">
                {progress.technicalAnswersCount}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Project & Skill Answers
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('technical')}
              className="text-xs text-violet-400 hover:underline mt-3 text-left font-semibold"
            >
              Test Project Depth →
            </button>
          </div>

          {/* HR Answers Polished */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-teal-400 font-bold">
                STAR
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">
                {progress.hrAnswersPolishedCount}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                HR Answers Polished
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('hr')}
              className="text-xs text-teal-400 hover:underline mt-3 text-left font-semibold"
            >
              Polish Behavioral →
            </button>
          </div>

          {/* Mock Interviews Completed */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                Live AI
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">
                {progress.mockInterviewsCompleted}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Mock Rounds Completed
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('mock')}
              className="text-xs text-indigo-400 hover:underline mt-3 text-left font-semibold"
            >
              Start New Mock →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Mastered Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Performance Log (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Recent Practice & Evaluation Scores
            </h3>
            <span className="text-xs text-slate-400">
              {progress.recentScores.length} logged
            </span>
          </div>

          {progress.recentScores.length > 0 ? (
            <div className="space-y-2">
              {progress.recentScores.map((scoreItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                      scoreItem.type === 'cpp' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : scoreItem.type === 'technical'
                        ? 'bg-violet-950 text-violet-400 border border-violet-800/50'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800/50'
                    }`}>
                      {scoreItem.type}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">
                        {scoreItem.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {scoreItem.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${
                      scoreItem.score >= 80 
                        ? 'text-emerald-400' 
                        : scoreItem.score >= 60 
                        ? 'text-indigo-400' 
                        : 'text-amber-400'
                    }`}>
                      {scoreItem.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No recent scores yet. Try solving your first C++ problem or generating technical questions!
            </div>
          )}
        </div>

        {/* Mastered Skills & Badges (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Competencies & Badges
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                title: 'C++ Two-Pointer',
                desc: 'In-place array and string manipulation',
                unlocked: progress.solvedProblemIds.includes('cpp-1') || progress.solvedProblemIds.includes('cpp-2'),
              },
              {
                title: 'LIFO Stack Evaluator',
                desc: 'Parentheses matching and memory layout',
                unlocked: progress.solvedProblemIds.includes('cpp-4'),
              },
              {
                title: 'Hash Map Specialist',
                desc: 'O(1) average two sum & frequency counting',
                unlocked: progress.solvedProblemIds.includes('cpp-3') || progress.solvedProblemIds.includes('cpp-7'),
              },
              {
                title: 'Kadane Max Subarray',
                desc: 'Dynamic greedy optimization',
                unlocked: progress.solvedProblemIds.includes('cpp-5'),
              },
              {
                title: 'STAR Storyteller',
                desc: 'Structured behavioral communication',
                unlocked: progress.hrAnswersPolishedCount > 0,
              },
              {
                title: 'AI Mock Graduate',
                desc: 'Completed realistic multi-turn interview',
                unlocked: progress.mockInterviewsCompleted > 0,
              },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-left transition-all ${
                  badge.unlocked
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">
                    {badge.title}
                  </span>
                  {badge.unlocked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-600">Locked</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
