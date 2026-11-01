import React, { useState } from 'react';
import { 
  Play, 
  Lightbulb, 
  BookOpen, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  HardDrive, 
  Code, 
  Sparkles, 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CPP_PROBLEMS } from '../data/cppProblems';
import { CppProblem, CppEvaluationResult, UserProgress } from '../types';
import { recordSolvedProblem } from '../utils/storage';

interface CppPracticeProps {
  progress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const CppPractice: React.FC<CppPracticeProps> = ({ progress, onProgressUpdate }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(CPP_PROBLEMS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const currentProblem: CppProblem = 
    CPP_PROBLEMS.find((p) => p.id === selectedProblemId) || CPP_PROBLEMS[0];

  const [code, setCode] = useState<string>(currentProblem.starterCode);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<CppEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Hints state
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string | null>(null);

  // Solution state
  const [solutionLoading, setSolutionLoading] = useState<boolean>(false);
  const [solutionData, setSolutionData] = useState<{
    solutionCode: string;
    explanation: string;
    timeComplexity: string;
    spaceComplexity: string;
    dryRun?: string;
    interviewTalkingPoints?: string[];
  } | null>(null);

  // Categories
  const categories = ['All', 'Arrays', 'Strings', 'Hash Maps', 'Stack & Queue', 'Vectors', 'Pointers & Memory'];

  const filteredProblems = selectedCategory === 'All' 
    ? CPP_PROBLEMS 
    : CPP_PROBLEMS.filter((p) => p.category === selectedCategory);

  const handleSelectProblem = (p: CppProblem) => {
    setSelectedProblemId(p.id);
    setCode(p.starterCode);
    setEvaluationResult(null);
    setEvalError(null);
    setHintText(null);
    setHintLevel(1);
    setSolutionData(null);
  };

  const handleResetCode = () => {
    if (confirm('Reset to starter code? Any unsaved edits will be discarded.')) {
      setCode(currentProblem.starterCode);
      setEvaluationResult(null);
      setEvalError(null);
    }
  };

  // Run & Evaluate with AI
  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvalError(null);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/cpp/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
          testCases: currentProblem.testCases,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error (${res.status})`);
      }

      const data: CppEvaluationResult = await res.json();
      setEvaluationResult(data);

      // Record progress
      const updated = recordSolvedProblem(currentProblem.id, data.score, currentProblem.title);
      onProgressUpdate(updated);

      if (data.score >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error(err);
      setEvalError(err?.message || 'Failed to evaluate C++ code.');
    } finally {
      setEvaluating(false);
    }
  };

  // Request Hint
  const handleGetHint = async (level: number) => {
    setHintLoading(true);
    try {
      const res = await fetch('/api/cpp/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
          currentCode: code,
          hintLevel: level,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHintText(data.hint);
        setHintLevel(level);
      } else {
        // Fallback to local hints
        setHintText(currentProblem.solutionHints[level - 1] || currentProblem.solutionHints[0]);
      }
    } catch (e) {
      setHintText(currentProblem.solutionHints[level - 1] || currentProblem.solutionHints[0]);
    } finally {
      setHintLoading(false);
    }
  };

  // Request Solution
  const handleGetSolution = async () => {
    setSolutionLoading(true);
    try {
      const res = await fetch('/api/cpp/solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSolutionData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSolutionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Module 1
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Beginner C++ Coding Practice
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hand-picked foundational questions asked in campus rounds (Arrays, Strings, Pointers, Stacks, HashMaps). Write, test, and receive instant AI code evaluations with Big-O analysis.
          </p>
        </div>

        {/* Progress summary for module */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Solved</div>
            <div className="text-sm font-bold text-emerald-400">
              {progress.solvedProblemIds.length} / {CPP_PROBLEMS.length} Problems
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
            {Math.round((progress.solvedProblemIds.length / CPP_PROBLEMS.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Category Pills & Problem Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Problem quick cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {filteredProblems.map((p) => {
            const isSolved = progress.solvedProblemIds.includes(p.id);
            const isSelected = p.id === selectedProblemId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProblem(p)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-sm shadow-indigo-500/20'
                    : isSolved
                    ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    {p.id.toUpperCase()}
                  </span>
                  {isSolved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {p.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {p.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Practice Workspace: Split into Problem Description & Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Statement & Test Cases (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-indigo-300 rounded border border-slate-700">
                  {currentProblem.category}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">
                  {currentProblem.title}
                </h2>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                currentProblem.difficulty === 'Easy' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {currentProblem.difficulty}
              </span>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800/80 pt-3">
              {currentProblem.description}
            </div>

            {/* Constraints */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Constraints & Expectations
              </h3>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {currentProblem.constraints.map((c, i) => (
                  <li key={i} className="font-mono text-[11px] text-slate-300">
                    {c}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-1">
                <span className="text-[11px] text-indigo-300 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-indigo-400" /> Optimal: {currentProblem.timeComplexityOptimal}
                </span>
                <span className="text-[11px] text-emerald-300 flex items-center gap-1 font-mono">
                  <HardDrive className="w-3 h-3 text-emerald-400" /> Space: {currentProblem.spaceComplexityOptimal}
                </span>
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Examples
              </h3>
              {currentProblem.examples.map((ex, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Input: </span>
                    <span className="text-indigo-300">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Output: </span>
                    <span className="text-emerald-300">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans mt-1">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Solution & Hint Triggers */}
            <div className="border-t border-slate-800 pt-4 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleGetHint(hintLevel)}
                disabled={hintLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-medium transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{hintLoading ? 'Loading Hint...' : `Get Hint ${hintLevel}/3`}</span>
              </button>

              <button
                onClick={handleGetSolution}
                disabled={solutionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>{solutionLoading ? 'Generating...' : 'Optimal Solution'}</span>
              </button>
            </div>

            {/* Display Active Hint if requested */}
            {hintText && (
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Hint Level {hintLevel}
                  </span>
                  {hintLevel < 3 && (
                    <button
                      onClick={() => handleGetHint(hintLevel + 1)}
                      className="text-[11px] text-amber-300 hover:underline flex items-center gap-0.5"
                    >
                      Next hint <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  {hintText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & AI Evaluation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Editor Toolbar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">solution.cpp</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">C++20</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Code...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run & AI Evaluate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Input Area with line numbers */}
            <div className="relative flex bg-slate-950/90 font-mono text-xs sm:text-sm">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={16}
                className="w-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500/50 selection:bg-indigo-500/30"
                placeholder="// Write your C++ solution here..."
              />
            </div>
          </div>

          {/* Error Message */}
          {evalError && (
            <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{evalError}</span>
            </div>
          )}

          {/* AI Evaluation Report Card */}
          {evaluationResult && (
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
              {/* Verdict Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    evaluationResult.score >= 80 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : evaluationResult.score >= 50
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {evaluationResult.score >= 80 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        Verdict: {evaluationResult.verdict}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        Score: {evaluationResult.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {evaluationResult.compilationNotes}
                    </p>
                  </div>
                </div>

                {/* Big-O Analysis Badge */}
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Time: <span className="text-indigo-400 font-bold">{evaluationResult.timeComplexity}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Space: <span className="text-emerald-400 font-bold">{evaluationResult.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Test Cases Results */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Test Cases Execution
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evaluationResult.testCaseResults.map((tc, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs font-mono ${
                        tc.passed
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-300">Case {tc.testCaseIndex}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          tc.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tc.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Input: {tc.input}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Expected: {tc.expected}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback & Edge Cases */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Interviewer Insights & Suggestions
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {evaluationResult.feedback.map((f, i) => (
                    <li key={i} className="leading-relaxed text-slate-200">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clean Code Tips */}
              {evaluationResult.cleanCodeTips && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-300">C++ Best Practice: </span>
                    {evaluationResult.cleanCodeTips}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Model Solution Card */}
          {solutionData && (
            <div className="bg-slate-900 rounded-2xl p-5 border border-indigo-800/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Optimal C++ Solution & Walkthrough</h3>
                </div>
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-indigo-400">Time: {solutionData.timeComplexity}</span>
                  <span className="text-emerald-400">Space: {solutionData.spaceComplexity}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-slate-200">
                <pre>{solutionData.solutionCode}</pre>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-200 mb-1">Explanation:</p>
                {solutionData.explanation}
              </div>

              {solutionData.dryRun && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                  <div className="font-sans font-semibold text-indigo-300 mb-1">Dry Run Trace:</div>
                  <pre className="whitespace-pre-wrap">{solutionData.dryRun}</pre>
                </div>
              )}

              {solutionData.interviewTalkingPoints && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-amber-400">
                    What to articulate in front of the interviewer:
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {solutionData.interviewTalkingPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
