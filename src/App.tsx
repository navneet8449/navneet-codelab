import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CppPractice } from './components/CppPractice';
import { TechnicalInterview } from './components/TechnicalInterview';
import { HrPractice } from './components/HrPractice';
import { MockInterviewRoom } from './components/MockInterviewRoom';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SetupGuideModal } from './components/SetupGuideModal';
import { UserProgress } from './types';
import { loadUserProgress, saveUserProgress } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cpp' | 'technical' | 'hr' | 'mock' | 'progress'>('cpp');
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    // Sync state initially
    const current = loadUserProgress();
    setProgress(current);
  }, []);

  const handleProgressUpdate = (updated: UserProgress) => {
    setProgress(updated);
    saveUserProgress(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Feature View */}
      <main className="flex-1 pb-16">
        {activeTab === 'cpp' && (
          <CppPractice
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'technical' && (
          <TechnicalInterview
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'hr' && (
          <HrPractice
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'mock' && (
          <MockInterviewRoom
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            progress={progress}
            onProgressUpdate={handleProgressUpdate}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Navneet CodeLab</span>
            <span>—</span>
            <span>Coding Practice &amp; Interview Preparation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              Setup Guide & Architecture
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('progress')}
              className="hover:text-indigo-400 transition-colors"
            >
              Readiness Score
            </button>
          </div>
        </div>
      </footer>

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
