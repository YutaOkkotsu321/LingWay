/* ─── ALL INTERFACES / MODELS ─────────────────────────────────────────── */

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  joinedAt?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GrammarTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rules?: GrammarRule[];
  examples?: string[];
  exercises?: Exercise[];
}

export interface GrammarRule {
  id: number;
  title: string;
  explanation: string;
  formula?: string;
  examples: string[];
}

export interface Exercise {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface VocabularyWord {
  id: number;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  category: 'business' | 'academic' | 'everyday';
  isFavorited: boolean;
  audioUrl?: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isMastered: boolean;
  timesReviewed: number;
}

export interface FlashcardProgress {
  total: number;
  mastered: number;
  needPractice: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface UpdateProfileRequest {
  displayName: string;
  bio: string;
  email?: string;
}
