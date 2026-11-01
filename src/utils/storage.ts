import { UserProgress } from '../types';

const STORAGE_KEY = 'algoprep_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  solvedProblemIds: ['cpp-1'],
  attemptedProblemIds: ['cpp-1', 'cpp-2'],
  technicalAnswersCount: 2,
  hrAnswersPolishedCount: 1,
  mockInterviewsCompleted: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakDays: 3,
  recentScores: [
    {
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
      type: 'cpp',
      score: 90,
      title: 'Reverse an Array In-Place',
    },
    {
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
      type: 'technical',
      score: 85,
      title: 'Distributed Key-Value Store Architecture',
    },
    {
      date: new Date().toLocaleDateString(),
      type: 'mock',
      score: 82,
      title: 'Campus SDE Full Mock Round',
    },
  ],
  masteredSkills: ['C++ Two-Pointer', 'STAR Method', 'SQL Indexing', 'Stack LIFO'],
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function recordSolvedProblem(problemId: string, score: number, title: string): UserProgress {
  const current = loadUserProgress();
  const solved = new Set(current.solvedProblemIds);
  const attempted = new Set(current.attemptedProblemIds);

  if (score >= 70) {
    solved.add(problemId);
  }
  attempted.add(problemId);

  const updated: UserProgress = {
    ...current,
    solvedProblemIds: Array.from(solved),
    attemptedProblemIds: Array.from(attempted),
    recentScores: [
      {
        date: new Date().toLocaleDateString(),
        type: 'cpp',
        score,
        title,
      },
      ...current.recentScores.slice(0, 9),
    ],
  };

  updateStreak(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordTechnicalAnswer(title: string, score: number): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    technicalAnswersCount: current.technicalAnswersCount + 1,
    recentScores: [
      {
        date: new Date().toLocaleDateString(),
        type: 'technical',
        score,
        title,
      },
      ...current.recentScores.slice(0, 9),
    ],
  };

  updateStreak(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordHrPolish(): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    hrAnswersPolishedCount: current.hrAnswersPolishedCount + 1,
  };
  updateStreak(updated);
  saveUserProgress(updated);
  return updated;
}

export function recordMockInterview(title: string, score: number): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    mockInterviewsCompleted: current.mockInterviewsCompleted + 1,
    recentScores: [
      {
        date: new Date().toLocaleDateString(),
        type: 'mock',
        score,
        title,
      },
      ...current.recentScores.slice(0, 9),
    ],
  };
  updateStreak(updated);
  saveUserProgress(updated);
  return updated;
}

function updateStreak(progress: UserProgress): void {
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastActiveDate === today) {
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (progress.lastActiveDate === yesterday) {
    progress.streakDays += 1;
  } else if (!progress.lastActiveDate) {
    progress.streakDays = 1;
  } else {
    progress.streakDays = 1;
  }
  progress.lastActiveDate = today;
}

export function calculateReadinessIndex(progress: UserProgress): number {
  // Balanced weighted score (0-100)
  // C++ solved: up to 35 pts (8 total problems * ~4.4 pts)
  const cppScore = Math.min(35, (progress.solvedProblemIds.length / 8) * 35);
  // Technical answers: up to 25 pts (5 answers * 5 pts)
  const techScore = Math.min(25, (progress.technicalAnswersCount / 5) * 25);
  // HR polished: up to 20 pts (4 answers * 5 pts)
  const hrScore = Math.min(20, (progress.hrAnswersPolishedCount / 4) * 20);
  // Mock interviews: up to 20 pts (2 completed mocks * 10 pts)
  const mockScore = Math.min(20, (progress.mockInterviewsCompleted / 2) * 20);

  return Math.round(cppScore + techScore + hrScore + mockScore);
}
