import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  FileText,
  BarChart,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MockInterviewTurn, MockScorecard, UserProgress } from '../types';
import { recordMockInterview } from '../utils/storage';

interface MockInterviewRoomProps {
  progress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const MockInterviewRoom: React.FC<MockInterviewRoomProps> = ({
  progress,
  onProgressUpdate,
}) => {
  // Session Configuration
  const [track, setTrack] = useState<string>('cpp-fundamentals');
  const [candidateName, setCandidateName] = useState<string>('Student');
  const [candidateRole, setCandidateRole] = useState<string>('Software Development Engineer (Fresher)');
  const [interviewerPersona, setInterviewerPersona] = useState<string>('Senior Staff Engineer');
  const [totalTurns, setTotalTurns] = useState<number>(4);

  // Active Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [history, setHistory] = useState<MockInterviewTurn[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [loadingTurn, setLoadingTurn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio / Voice
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Scorecard State
  const [scorecard, setScorecard] = useState<MockScorecard | null>(null);
  const [generatingScorecard, setGeneratingScorecard] = useState<boolean>(false);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSessionActive]);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loadingTurn]);

  // Start Interview Session
  const handleStartInterview = async () => {
    setIsSessionActive(true);
    setTurnIndex(0);
    setSecondsElapsed(0);
    setScorecard(null);
    setErrorMsg(null);

    const initialSpeechMap: Record<string, string> = {
      'cpp-fundamentals': `Hello ${candidateName}, welcome to your technical interview. I'm your interviewer today. Let's begin with C++ memory: can you explain how \`std::unique_ptr\` differs from \`std::shared_ptr\` and in what scenarios you choose one over the other?`,
      'campus-hr': `Hi ${candidateName}, glad to connect with you for our HR round! To get started, could you walk me through your background and what motivated you to pursue Computer Science?`,
      'fullstack-project': `Welcome ${candidateName}. We'd love to hear about the most complex technical project you have built. Could you describe the architecture, tech stack, and your specific contributions?`,
      'faang-mixed': `Hello ${candidateName}! In this comprehensive mock round, we will touch upon both core algorithms and your engineering decision-making. First: how do you assess time vs space trade-offs when optimizing a brute-force solution?`,
    };

    const firstQuestion = initialSpeechMap[track] || initialSpeechMap['cpp-fundamentals'];

    const initialTurn: MockInterviewTurn = {
      role: 'interviewer',
      text: firstQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistory([initialTurn]);
    if (isVoiceOutputEnabled) {
      speakInterviewer(firstQuestion);
    }
  };

  // Text-to-Speech
  const speakInterviewer = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Voice Dictation
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
        setCurrentInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Submit Answer for Turn
  const handleSubmitAnswer = async () => {
    if (!currentInput.trim()) return;

    if (isRecording) {
      setIsRecording(false);
    }

    const answerText = currentInput.trim();
    setCurrentInput('');
    setLoadingTurn(true);
    setErrorMsg(null);

    // Add candidate turn to history
    const candidateTurn: MockInterviewTurn = {
      role: 'candidate',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...history, candidateTurn];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/mock/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track,
          candidateRole,
          history: newHistory,
          candidateAnswer: answerText,
          turnIndex,
          totalTurns,
        }),
      });

      if (!res.ok) {
        throw new Error('Interview interaction failed.');
      }

      const data = await res.json();

      // Attach feedback to the candidate turn
      if (data.turnFeedback) {
        candidateTurn.feedback = data.turnFeedback;
      }

      // Add interviewer next question or closing remarks
      const interviewerTurn: MockInterviewTurn = {
        role: 'interviewer',
        text: data.interviewerSpeech,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory([...newHistory, interviewerTurn]);

      if (isVoiceOutputEnabled) {
        speakInterviewer(data.interviewerSpeech);
      }

      const nextTurnIndex = turnIndex + 1;
      setTurnIndex(nextTurnIndex);

      if (data.isComplete || nextTurnIndex >= totalTurns) {
        // Complete interview and generate scorecard
        await handleGenerateScorecard([...newHistory, interviewerTurn]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred during interview turn.');
    } finally {
      setLoadingTurn(false);
    }
  };

  // Final Scorecard Generation
  const handleGenerateScorecard = async (fullTranscript: MockInterviewTurn[]) => {
    setGeneratingScorecard(true);
    try {
      const res = await fetch('/api/mock/final-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track,
          candidateRole,
          fullHistory: fullTranscript,
        }),
      });

      if (res.ok) {
        const scorecardData: MockScorecard = await res.json();
        setScorecard(scorecardData);

        // Record in user progress
        const updated = recordMockInterview(`Mock: ${track}`, scorecardData.overallScore);
        onProgressUpdate(updated);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingScorecard(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              Module 4
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Interactive Mock Interview Room
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realistic multi-turn simulated interview with live speech, instant turn-by-turn answer critique, and a comprehensive hiring scorecard.
          </p>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isVoiceOutputEnabled) window.speechSynthesis?.cancel();
              setIsVoiceOutputEnabled(!isVoiceOutputEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isVoiceOutputEnabled
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{isVoiceOutputEnabled ? 'Interviewer Voice: ON' : 'Interviewer Voice: OFF'}</span>
          </button>
        </div>
      </div>

      {!isSessionActive ? (
        /* Configuration Screen */
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-600/30">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Configure Your Placement Mock Interview
            </h2>
            <p className="text-xs text-slate-400">
              Customize the track and role to simulate your target campus hiring process.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Interview Track
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'cpp-fundamentals', label: 'C++ & Data Structures Core', desc: 'Pointers, STL, Memory, Complexity' },
                  { id: 'campus-hr', label: 'HR & Behavioral Round', desc: 'STAR, Culture, Teamwork, Situational' },
                  { id: 'fullstack-project', label: 'Project Architecture & Deep-Dive', desc: 'System decisions, Concurrency, APIs' },
                  { id: 'faang-mixed', label: 'Mixed Product SDE Placement', desc: 'Code + System Thinking + Behavioral' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrack(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      track === t.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{t.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={candidateRole}
                  onChange={(e) => setCandidateRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Interviewer Persona
              </label>
              <select
                value={interviewerPersona}
                onChange={(e) => setInterviewerPersona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="Senior Staff Engineer">Senior Staff Engineer (Rigorous, Engineering Precision)</option>
                <option value="Friendly Tech Lead">Friendly Tech Lead (Supportive, Socratic Guidance)</option>
                <option value="HR Talent Partner">HR Talent Partner (Focus on STAR & Culture)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter AI Mock Interview Room</span>
          </button>
        </div>
      ) : (
        /* Active Interview Room Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Interview Stage (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live Status Bar */}
            <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center text-indigo-300 font-bold">
                    AI
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {interviewerPersona}
                    {isSpeaking && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full">
                        Speaking...
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Track: {track}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatTimer(secondsElapsed)}</span>
                </div>

                <div className="text-xs font-semibold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-800/50">
                  Turn {turnIndex + 1} of {totalTurns}
                </div>

                <button
                  onClick={() => {
                    if (confirm('End this mock interview early?')) {
                      setIsSessionActive(false);
                      window.speechSynthesis?.cancel();
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 max-h-[500px] overflow-y-auto">
              {history.map((item, idx) => {
                const isInterviewer = item.role === 'interviewer';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      isInterviewer ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isInterviewer
                          ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-70 mb-1.5">
                        <span className="font-bold">
                          {isInterviewer ? interviewerPersona : candidateName}
                        </span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>

                    {/* Instant Feedback Pill for Candidate Answers */}
                    {item.feedback && (
                      <div className="mt-2 max-w-[85%] p-3 bg-slate-950/90 rounded-xl border border-indigo-800/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" /> Turn Feedback
                          </span>
                          <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-emerald-400">Clarity: {item.feedback.clarity}%</span>
                            <span className="text-violet-400">Relevance: {item.feedback.relevance}%</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-emerald-400">Strength: </strong>{item.feedback.strengths}
                        </div>
                        <div className="text-[11px] text-amber-300">
                          <strong className="text-amber-400">Tip: </strong>{item.feedback.critique}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {loadingTurn && (
                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 w-fit">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>Interviewer is evaluating your response and preparing the next question...</span>
                </div>
              )}
              <div ref={turnsEndRef} />
            </div>

            {/* Answer Input Controls */}
            {!scorecard && turnIndex < totalTurns && (
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Your Answer:</span>
                  <button
                    onClick={toggleRecording}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isRecording ? 'Listening (Click to Stop)' : 'Dictate by Voice'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Speak or type your answer clearly. Be structured and confident..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Press Submit to send your response to the AI interviewer.
                  </span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loadingTurn || !currentInput.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scorecard & Performance Insights (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {generatingScorecard ? (
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-white">
                  Compiling Final Interview Scorecard
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluating communication clarity, technical depth, problem-solving structure, and creating your custom 7-day roadmap...
                </p>
              </div>
            ) : scorecard ? (
              <div className="bg-slate-900 rounded-2xl p-5 border border-indigo-800/50 space-y-4 shadow-2xl">
                {/* Scorecard Header */}
                <div className="text-center pb-3 border-b border-slate-800 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/20">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    {scorecard.hiringRecommendation}
                  </div>
                  <div className="text-3xl font-black text-white mt-2">
                    {scorecard.overallScore}<span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {scorecard.executiveSummary}
                  </p>
                </div>

                {/* Category Scores */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Competency Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: 'Technical Depth', score: scorecard.categoryScores.technicalProficiency },
                      { label: 'Communication Clarity', score: scorecard.categoryScores.communicationClarity },
                      { label: 'Problem Structure', score: scorecard.categoryScores.problemSolvingStructure },
                      { label: 'Confidence & Pacing', score: scorecard.categoryScores.confidenceAndPacing },
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                        <span className="text-slate-300">{cat.label}</span>
                        <span className="font-bold font-mono text-indigo-400">{cat.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {scorecard.keyStrengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Growth Areas
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {scorecard.weaknessesAndGaps?.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                {/* 7-Day Roadmap */}
                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-1.5">
                  <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    7-Day Action Plan
                  </h4>
                  <ul className="text-xs text-indigo-200/90 space-y-1 list-decimal list-inside">
                    {scorecard.actionableRoadmap?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Restart */}
                <button
                  onClick={() => setIsSessionActive(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Start Another Mock Round
                </button>
              </div>
            ) : (
              /* Ongoing session overview */
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Interview Assessment
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As you answer each question, the interviewer evaluates:
                </p>
                <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                  <li><strong>Answer Relevance:</strong> Did you directly answer the prompt?</li>
                  <li><strong>Technical Accuracy:</strong> Are your C++ and CS concepts sound?</li>
                  <li><strong>Conciseness:</strong> Avoiding rambling or excessive fillers.</li>
                  <li><strong>Structure:</strong> Logical progression from context to result.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
