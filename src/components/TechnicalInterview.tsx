import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  FolderGit2, 
  Layers, 
  ArrowRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TechnicalQuestion, TechnicalEvaluation, UserProgress } from '../types';
import { SAMPLE_PROFILES, POPULAR_SKILLS, SampleProject } from '../data/sampleProfiles';
import { recordTechnicalAnswer } from '../utils/storage';

interface TechnicalInterviewProps {
  progress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const TechnicalInterview: React.FC<TechnicalInterviewProps> = ({
  progress,
  onProgressUpdate,
}) => {
  // Candidate Profile State
  const [skills, setSkills] = useState<string[]>(SAMPLE_PROFILES[0].skills);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [projects, setProjects] = useState<SampleProject[]>(SAMPLE_PROFILES[0].projects);
  const [targetRole, setTargetRole] = useState<string>('Software Development Engineer (Fresher)');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Generated Questions State
  const [generating, setGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([
    {
      id: 'tq-demo-1',
      category: 'Project Architecture',
      question: 'In your Distributed In-Memory Key-Value Store, how did you handle race conditions when multiple client connections attempted simultaneous LRU eviction?',
      targetSkill: 'C++ & Concurrency',
      whyInterviewerAsks: 'Assesses whether you actually implemented thread safety with locks/mutexes or just used a single-threaded naive approach.',
      keyConceptsExpected: ['Mutex synchronization / std::lock_guard', 'Fine-grained locking vs global lock', 'Atomic operations for counters'],
      difficulty: 'Medium',
    },
    {
      id: 'tq-demo-2',
      category: 'Core CS Fundamentals',
      question: 'How does virtual memory paging work under the hood in an Operating System, and what happens during a Page Fault?',
      targetSkill: 'Operating Systems',
      whyInterviewerAsks: 'Core CS interview benchmark testing MMU hardware, page tables, disk swap, and context switching.',
      keyConceptsExpected: ['Page table lookup', 'TLB cache hit vs miss', 'Kernel interrupt / trap handler', 'Disk I/O latency'],
      difficulty: 'Medium',
    },
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState<string>('tq-demo-1');

  // Answer Submission State
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<TechnicalEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Speech Recognition (Voice Input)
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Handle Load Preset Profile
  const handleLoadPreset = (profileIndex: number) => {
    const p = SAMPLE_PROFILES[profileIndex];
    if (p) {
      setSkills(p.skills);
      setProjects(p.projects);
      setTargetRole(p.roleTarget);
      setEvaluation(null);
    }
  };

  // Add / Remove Skill
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Add Project
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: 'New CS Project',
        techStack: 'C++, Node.js, SQL',
        description: 'Describe the core objective and architecture...',
        challenges: 'What technical bottlenecks or concurrency bugs did you solve?',
      },
    ]);
  };

  const handleUpdateProject = (index: number, field: keyof SampleProject, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Generate Questions via AI
  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setEvalError(null);
    try {
      const res = await fetch('/api/technical/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          projects,
          difficulty,
          roleTarget: targetRole,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate technical questions');
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setActiveQuestionId(data.questions[0].id);
        setCandidateAnswer('');
        setEvaluation(null);
      }
    } catch (err: any) {
      setEvalError(err?.message || 'Error generating questions.');
    } finally {
      setGenerating(false);
    }
  };

  // Voice Input Toggle (Web Speech API)
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your answer in the box.');
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
        setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Evaluate Answer via AI
  const currentQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) {
      alert('Please enter your technical answer before submitting.');
      return;
    }

    setEvaluating(true);
    setEvalError(null);
    setEvaluation(null);

    try {
      const res = await fetch('/api/technical/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: candidateAnswer,
          targetSkill: currentQuestion.targetSkill,
          expectedConcepts: currentQuestion.keyConceptsExpected,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Evaluation failed.');
      }

      const data: TechnicalEvaluation = await res.json();
      setEvaluation(data);

      const updated = recordTechnicalAnswer(currentQuestion.question, data.score);
      onProgressUpdate(updated);

      if (data.score >= 80) {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setEvalError(err?.message || 'Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-md">
              Module 2
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Project & Skill-Based Technical Questions
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real CS campus interviewers grill you on YOUR projects and declared skills. Enter your tech stack to generate authentic questions and get AI scoring on engineering depth.
          </p>
        </div>

        {/* Load Preset Profiles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Load CS Sample:</span>
          {SAMPLE_PROFILES.map((prof, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPreset(idx)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              {prof.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile & Project Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                Target Role & Technical Skills
              </h2>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Placement Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder="e.g. SDE Fresher, Backend Engineer"
              />
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Your Skills ({skills.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto pr-1">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-950/40 text-violet-300 border border-violet-800/50 rounded-md text-xs font-mono"
                  >
                    {s}
                    <button
                      onClick={() => handleRemoveSkill(s)}
                      className="text-violet-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(newSkillInput)}
                  placeholder="Add custom skill (e.g. Redis, Linux)..."
                  className="flex-1 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggested Skills */}
              <div className="mt-2 flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-500">Popular:</span>
                {POPULAR_SKILLS.slice(0, 6).map((ps) => (
                  <button
                    key={ps}
                    onClick={() => handleAddSkill(ps)}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    +{ps}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  College & Personal Projects
                </h3>
                <button
                  onClick={handleAddProject}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Project
                </button>
              </div>

              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                      className="font-bold text-xs text-slate-200 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none w-4/5"
                      placeholder="Project Title"
                    />
                    {projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        className="text-slate-500 hover:text-rose-400"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value)}
                      className="w-full text-[11px] font-mono text-indigo-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 focus:outline-none"
                      placeholder="e.g. C++, WebSockets, Express, PostgreSQL"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                      className="w-full text-xs text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-amber-500/80 block font-semibold">
                      Key Technical Challenge / Concurrency / Scale
                    </label>
                    <textarea
                      rows={2}
                      value={proj.challenges}
                      onChange={(e) => handleUpdateProject(idx, 'challenges', e.target.value)}
                      className="w-full text-xs text-amber-200/90 bg-amber-950/20 p-1.5 rounded border border-amber-900/30 focus:outline-none"
                      placeholder="e.g. Handled race conditions with mutexes..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerateQuestions}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Stack & Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Tailored Technical Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Drills & AI Answer Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Questions Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Generated Interview Questions ({questions.length})
              </span>
              <span className="text-[11px] text-indigo-400">
                Click question to practice
              </span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isActive = q.id === activeQuestionId;
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => {
                      setActiveQuestionId(q.id);
                      setCandidateAnswer('');
                      setEvaluation(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-violet-950/30 border-violet-500 shadow-md shadow-violet-500/10'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-violet-300 rounded border border-slate-700">
                        {q.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {q.targetSkill}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white mt-1 leading-snug">
                      {q.question}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{q.whyInterviewerAsks}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Drill Workspace */}
          {currentQuestion && (
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Your Spoken or Written Response:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleRecording}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                        isRecording
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{isRecording ? 'Recording (Click to stop)' : 'Voice Dictate'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder="Articulate your technical reasoning here (e.g. 'In our architecture, we opted for X over Y because of Z trade-off. To handle race conditions, we initialized a mutex with std::lock_guard...')"
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed"
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">
                    Expected concepts to hit: {currentQuestion.keyConceptsExpected?.join(', ')}
                  </span>
                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={evaluating || !candidateAnswer.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/30 transition-all disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Scoring Answer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Evaluate My Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {evalError && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                  {evalError}
                </div>
              )}

              {/* Evaluation Result */}
              {evaluation && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  {/* Verdict header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl font-bold text-sm ${
                        evaluation.score >= 80 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : evaluation.score >= 55
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {evaluation.score}/100
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {evaluation.verdict}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {evaluation.strengths}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Covered vs Missed Concepts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1.5">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Covered Concepts
                      </div>
                      <ul className="text-emerald-200/90 space-y-1 list-disc list-inside">
                        {evaluation.conceptsCovered?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl space-y-1.5">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Gaps & Overlooked
                      </div>
                      <ul className="text-amber-200/90 space-y-1 list-disc list-inside">
                        {evaluation.conceptsMissed?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Areas to improve */}
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">How to elevate your response: </span>
                    {evaluation.areasToImprove}
                  </div>

                  {/* Top-Tier Model Answer */}
                  <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Model Answer (How a Top Candidate Articulates This)
                    </div>
                    <p className="text-xs text-indigo-100/90 leading-relaxed italic">
                      "{evaluation.modelAnswer}"
                    </p>
                  </div>

                  {/* Follow-up question */}
                  {evaluation.followUpQuestion && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Next Follow-up Probe:
                        </span>
                        <span className="text-slate-200 font-semibold">{evaluation.followUpQuestion}</span>
                      </div>
                      <button
                        onClick={() => {
                          setCandidateAnswer('');
                          setEvaluation(null);
                        }}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        Try Answering
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
