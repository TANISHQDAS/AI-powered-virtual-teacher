export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';

export type TimeDuration = '5m' | '20m' | '60m' | '7d';

export type SubjectCategory = 'mathematics' | 'physics' | 'biology' | 'history' | 'programming' | 'general';

export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'es' | 'fr';

export interface TeacherPersona {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatarId: 'priya' | 'alan' | 'maya' | 'arjun';
  teachingStyle: string;
  voiceGender: 'female' | 'male';
  voicePitch: number;
  voiceRate: number;
  bio: string;
  tagline: string;
}

export interface MisconceptionTrap {
  wrongAnswerPattern: string; // keyword or option
  detectedTrap: string;
  remedyAnalogy: string;
  alternativeExplanation: string;
  followUpCheck: string;
}

export interface CheckpointQuestion {
  id: string;
  type: 'mcq' | 'explain' | 'conceptual';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  misconceptionTraps: MisconceptionTrap[];
}

export interface LessonSegment {
  id: string;
  segmentNumber: number;
  title: string;
  summary: string;
  teacherScript: string;
  whiteboardNotes: string[];
  latexEquations?: string[];
  visualType: 'none' | 'math-graph' | 'physics-circuit' | 'biology-cell' | 'history-timeline' | 'code-sandbox';
  visualData?: any;
  keyTakeaway: string;
  codeSnippet?: string;
  checkpoint?: CheckpointQuestion;
}

export interface LessonPlan {
  id: string;
  title: string;
  topic: string;
  subject: SubjectCategory;
  level: LearnerLevel;
  duration: TimeDuration;
  language: LanguageCode;
  estimatedMinutes: number;
  overview: string;
  segments: LessonSegment[];
  ragSourcesUsed?: { sourceName: string; page?: number; snippet: string }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  conceptTested: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DiagnosticAssessment {
  score: number;
  totalQuestions: number;
  percentage: number;
  conceptsMastered: string[];
  conceptsNeedingWork: string[];
  misconceptionAlerts: {
    concept: string;
    identifiedMistake: string;
    correctiveGuidance: string;
  }[];
  recommendedRevisionAction: string;
  nextSuggestedTopic: string;
  personalized7DayPlan: {
    day: number;
    title: string;
    focus: string;
    tasks: string[];
  }[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
}

export interface StudentProfile {
  name: string;
  level: LearnerLevel;
  preferredLanguage: LanguageCode;
  preferredTeacherId: string;
  topicsStudiedCount: number;
  averageScore: number;
  strongConcepts: string[];
  weakConcepts: string[];
  studyHistory: {
    topic: string;
    date: string;
    score: number;
    level: string;
  }[];
}

export interface RAGChunk {
  id: string;
  documentName: string;
  content: string;
  pageNumber?: number;
  sectionTitle?: string;
  score?: number;
}
