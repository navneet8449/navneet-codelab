import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Mic, 
  MicOff, 
  BookOpen, 
  Smile, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HR_QUESTIONS } from '../data/hrQuestions';
import { HrQuestionItem, HrPolishResult, UserProgress } from '../types';
import { recordHrPolish } from '../utils/storage';

interface HrPracticeProps {
  progress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const HrPractice: React.FC<HrPracticeProps> = ({
  progress,
  onProgressUpdate,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(HR_QUESTIONS[0].id);
  const currentQuestion: HrQuestionItem = 
    HR_QUESTIONS.find((q) => q.id === selectedQuestionId) || HR_QUESTIONS[0];

  const [inputMode, setInputMode] = useState<'guided-star' | 'freeform'>('guided-star');
  const [targetStyle, setTargetStyle] = useState<'simple-fresh' | 'star-method' | 'concise'>('simple-fresh');

  // Guided STAR inputs
  const [situation, setSituation] = useState<string>(currentQuestion.starterTemplates.situation);
  const [task, setTask] = useState<string>(currentQuestion.starterTemplates.task);
  const [action, setAction] = useState<string>(currentQuestion.starterTemplates.action);
  const [result, setResult] = useState<string>(currentQuestion.starterTemplates.result);

  // Freeform input
  const [freeformText, setFreeformText] = useState<string>('');

  // AI polishing state
  const [polishing, setPolishing] = useState<boolean>(false);
  const [polishedResult, setPolishedResult] = useState<HrPolishResult | null>(null);
  const [polishError, setPolishError] = useState<string | null>(null);

  // Audio / Speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch Question
  const handleSelectQuestion = (q: HrQuestionItem) => {
    setSelectedQuestionId(q.id);
    setSituation(q.starterTemplates.situation);
    setTask(q.starterTemplates.task);
    setAction(q.starterTemplates.action);
    setResult(q.starterTemplates.result);
    setFreeformText('');
    setPolishedResult(null);
    setPolishError(null);
    stopSpeaking();
  };

  // Text-to-Speech (listen to natural delivery)
  const speakAnswer = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Steady, calm interview pace
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice recording dictation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (inputMode === 'freeform') {
          setFreeformText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setAction((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Polish Answer via API
  const handlePolish = async () => {
    setPolishing(true);
    setPolishError(null);
    setPolishedResult(null);
    stopSpeaking();

    const payload = {
      question: currentQuestion.question,
      targetStyle,
      rawAnswer: inputMode === 'freeform' ? freeformText : undefined,
      situation: inputMode === 'guided-star' ? situation : undefined,
      task: inputMode === 'guided-star' ? task : undefined,
      action: inputMode === 'guided-star' ? action : undefined,
      result: inputMode === 'guided-star' ? result : undefined,
    };

    try {
      const res = await fetch('/api/hr/polish-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to polish answer.');
      }

      const data: HrPolishResult = await res.json();
      setPolishedResult(data);

      const updated = recordHrPolish();
      onProgressUpdate(updated);

      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.65 },
      });
    } catch (err: any) {
      setPolishError(err?.message || 'Error occurred while polishing answer.');
    } finally {
      setPolishing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Module 3
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              HR Interview Practice (Simple English & STAR Method)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Specially tailored for CS freshers who want crisp, simple, and natural English answers without getting tongue-tied or using complicated jargon.
          </p>
        </div>

        {/* Style selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Tone:</span>
          <select
            value={targetStyle}
            onChange={(e: any) => setTargetStyle(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="simple-fresh">Simple English (Fresher Friendly)</option>
            <option value="star-method">Structured STAR Format</option>
            <option value="concise">Concise & Punchy (&lt; 60 secs)</option>
          </select>
        </div>
      </div>

      {/* Questions Carousel / Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {HR_QUESTIONS.map((q) => {
          const isSelected = q.id === selectedQuestionId;
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(q)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                {q.category}
              </div>
              <div className="text-xs font-semibold text-slate-200 line-clamp-2">
                {q.question}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Guidance & Input (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {currentQuestion.category} Question
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                "{currentQuestion.question}"
              </h2>
            </div>

            {/* Recruiter Insight Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <HelpCircle className="w-3.5 h-3.5" /> Why recruiters ask this:
              </div>
              <p className="text-slate-400 leading-relaxed">
                {currentQuestion.whyAsked}
              </p>
              <div className="pt-1 border-t border-slate-800/60 text-emerald-400/90 font-medium">
                💡 <span className="text-slate-300">Strategy: </span>{currentQuestion.starTip}
              </div>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setInputMode('guided-star')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    inputMode === 'guided-star'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Guided STAR Builder
                </button>
                <button
                  onClick={() => setInputMode('freeform')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    inputMode === 'freeform'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Freeform Rough Draft
                </button>
              </div>

              {/* Dictation */}
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            {/* Guided STAR Fields */}
            {inputMode === 'guided-star' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    [S] Situation: Where and when did this happen?
                  </label>
                  <textarea
                    rows={2}
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    className="w-full text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. In my 3rd year college project..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    [T] Task: What was your specific goal or responsibility?
                  </label>
                  <textarea
                    rows={2}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="w-full text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. I had to deliver the backend API before the sprint review..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    [A] Action: What concrete steps did YOU take?
                  </label>
                  <textarea
                    rows={2}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. I scheduled a quick meeting, broke down the endpoints, and created test fixtures..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    [R] Result: What was the measurable outcome or learning?
                  </label>
                  <textarea
                    rows={2}
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. We finished 2 days early with zero bugs, and our professor praised our documentation..."
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Type your raw thoughts (don't worry about grammar or fancy vocabulary):
                </label>
                <textarea
                  rows={8}
                  value={freeformText}
                  onChange={(e) => setFreeformText(e.target.value)}
                  placeholder="Just speak or write freely here in any English. AI will rephrase it into crisp, high-impact conversational English..."
                  className="w-full text-xs sm:text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            )}

            {/* Polish CTA */}
            <button
              onClick={handlePolish}
              disabled={polishing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {polishing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Polishing into Simple, Fluent English...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Polish to Simple English & STAR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Polished Answer Card & Speaking Coach (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {polishError && (
            <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300">
              {polishError}
            </div>
          )}

          {polishedResult ? (
            <div className="bg-slate-900 rounded-2xl p-5 border border-emerald-800/50 space-y-4 shadow-xl">
              {/* Header with audio and copy */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Ready-To-Speak Script
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakAnswer(polishedResult.simpleEnglishAnswer)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isSpeaking
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title="Listen to pronunciation and pacing"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen Delivery'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(polishedResult.simpleEnglishAnswer)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Main Answer Script */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-100 leading-relaxed font-sans">
                "{polishedResult.simpleEnglishAnswer}"
              </div>

              {/* STAR Breakdown Pills */}
              {polishedResult.starBreakdown && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    STAR Structural Breakdown
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-indigo-400 mr-2">Situation:</span>
                      <span className="text-slate-300">{polishedResult.starBreakdown.situation}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-violet-400 mr-2">Task:</span>
                      <span className="text-slate-300">{polishedResult.starBreakdown.task}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 mr-2">Action:</span>
                      <span className="text-slate-300">{polishedResult.starBreakdown.action}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-bold text-amber-400 mr-2">Result:</span>
                      <span className="text-slate-300">{polishedResult.starBreakdown.result}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Why This Impresses HR */}
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-400">Why this works: </span>
                {polishedResult.whyThisWorks}
              </div>

              {/* Words to Avoid */}
              {polishedResult.wordsToAvoid && polishedResult.wordsToAvoid.length > 0 && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                    Avoid these filler words during the interview:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {polishedResult.wordsToAvoid.map((w, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-rose-900/30 text-rose-300 rounded border border-rose-800/40 font-mono">
                        ✗ {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Tips */}
              {polishedResult.interviewDeliveryTips && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl text-xs text-indigo-200">
                  <span className="font-bold text-indigo-300">🎙️ Delivery Tip: </span>
                  {polishedResult.interviewDeliveryTips}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-2xl p-8 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                No Polished Answer Generated Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Select an HR question on the left, type or voice dictate your raw thoughts, and click <strong className="text-emerald-400">Polish to Simple English</strong> to get a crisp, memorable answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
