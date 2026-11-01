import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Server, 
  Cpu, 
  Key, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    aiConfigured: boolean;
    model: string;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingHealth(true);
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setHealthStatus(data))
        .catch(() => setHealthStatus({ status: 'offline', aiConfigured: false, model: 'unknown' }))
        .finally(() => setLoadingHealth(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Navneet CodeLab Setup & Engineering Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Full-stack Node.js + React architecture &amp; interview preparation guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server & AI Status Card */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Backend & Gemini API Health
            </span>
            {loadingHealth ? (
              <span className="text-xs text-slate-400">Pinging server...</span>
            ) : healthStatus?.status === 'ok' ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5" /> Server Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/50">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block text-[11px]">AI Model</span>
              <span className="font-mono text-indigo-300 font-semibold">
                {healthStatus?.model || 'gemini-3.8-flash'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Server Proxy</span>
              <span className="font-mono text-emerald-400 font-semibold">
                Node.js / Express (server.ts)
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Your API keys remain strictly secure on the server side via environment variables. The client communicates via protected endpoints under <code className="text-indigo-300 font-mono">/api/*</code>.
            </span>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Local Setup & Execution
          </h3>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
            <div>
              <span className="text-slate-500"># 1. Install dependencies</span>
              <div className="text-emerald-400">npm install</div>
            </div>
            <div>
              <span className="text-slate-500"># 2. Configure .env with your Gemini API Key</span>
              <div className="text-slate-200">GEMINI_API_KEY="your_api_key_here"</div>
            </div>
            <div>
              <span className="text-slate-500"># 3. Start development server (serves Express + Vite on port 3000)</span>
              <div className="text-indigo-400">npm run dev</div>
            </div>
            <div>
              <span className="text-slate-500"># 4. Production build</span>
              <div className="text-violet-400">npm run build</div>
            </div>
          </div>
        </div>

        {/* Features Guide for CS Placements */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            4 Pillars of Campus Placement Mastery
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="font-bold text-emerald-400">1. C++ Coding Practice: </span>
              <span className="text-slate-300">
                Focus on beginner data structures (Arrays, Strings, HashMaps, Two-Pointers, Kadane's). Always state the brute force first, then optimize to O(N).
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="font-bold text-violet-400">2. Project Defense: </span>
              <span className="text-slate-300">
                Be ready to explain why you chose your database, how you handled concurrent state mutations, and what failed during development.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="font-bold text-teal-400">3. Simple English HR: </span>
              <span className="text-slate-300">
                Don't overcomplicate your English. Use the STAR method (Situation, Task, Action, Result) with simple, confident words.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="font-bold text-indigo-400">4. AI Mock Interviews: </span>
              <span className="text-slate-300">
                Simulate real time pressure. Use voice dictation to overcome speech hesitation and review the post-session scorecard roadmap.
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Got It, Back to Practice
          </button>
        </div>
      </div>
    </div>
  );
};
