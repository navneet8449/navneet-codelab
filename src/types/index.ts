export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface CppProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium';
  category: 'Arrays' | 'Strings' | 'Pointers & Memory' | 'Stack & Queue' | 'Hash Maps' | 'Vectors';
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: string;
  testCases: TestCase[];
  solutionHints: string[];
  timeComplexityOptimal: string;
  spaceComplexityOptimal: string;
}

export interface CppEvaluationResult {
  verdict: 'Passed' | 'Partial' | 'Needs Fix';
  score: number;
  syntaxValid: boolean;
  compilationNotes: string;
  timeComplexity: string;
  spaceComplexity: string;
  testCaseResults: {
    testCaseIndex: number;
    input: string;
    expected: string;
    passed: boolean;
    explanation: string;
  }[];
  feedback: string[];
  edgeCasesHandled: string[];
  cleanCodeTips: string;
}

export interface TechnicalQuestion {
  id: string;
  category: string;
  question: string;
  targetSkill: string;
  whyInterviewerAsks: string;
  keyConceptsExpected: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TechnicalEvaluation {
  score: number;
  verdict: string;
  conceptsCovered: string[];
  conceptsMissed: string[];
  strengths: string;
  areasToImprove: string;
  modelAnswer: string;
  followUpQuestion?: string;
}

export interface HrQuestionItem {
  id: string;
  question: string;
  category: 'Introduction' | 'Teamwork & Conflict' | 'Strengths & Growth' | 'Pressure & Deadlines' | 'Company Fit';
  whyAsked: string;
  starTip: string;
  starterTemplates: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface HrPolishResult {
  simpleEnglishAnswer: string;
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  whyThisWorks: string;
  wordsToAvoid: string[];
  interviewDeliveryTips: string;
}

export interface MockInterviewTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  feedback?: {
    clarity: number;
    relevance: number;
    strengths: string;
    critique: string;
  };
  timestamp: string;
}

export interface MockScorecard {
  overallScore: number;
  hiringRecommendation: string;
  categoryScores: {
    technicalProficiency: number;
    communicationClarity: number;
    problemSolvingStructure: number;
    confidenceAndPacing: number;
  };
  executiveSummary: string;
  keyStrengths: string[];
  weaknessesAndGaps: string[];
  actionableRoadmap: string[];
}

export interface UserProgress {
  solvedProblemIds: string[];
  attemptedProblemIds: string[];
  technicalAnswersCount: number;
  hrAnswersPolishedCount: number;
  mockInterviewsCompleted: number;
  lastActiveDate: string;
  streakDays: number;
  recentScores: {
    date: string;
    type: 'cpp' | 'technical' | 'hr' | 'mock';
    score: number;
    title: string;
  }[];
  masteredSkills: string[];
}
