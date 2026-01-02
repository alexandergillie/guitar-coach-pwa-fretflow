export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  skillProfile?: SkillProfile;
  streak: number;
  lastPracticeAt?: number;
}
export interface SkillProfile {
  alternatePicking: number;
  sweepPicking: number;
  legato: number;
  tapping: number;
  rhythm: number;
  bending: number;
  vibrato: number;
  theory: number;
}
export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  technique: string[];
  tablature: string;
  bpm: number;
  category: 'Speed' | 'Accuracy' | 'Expression' | 'Theory';
}
export interface PracticeSession {
  id: string;
  userId: string;
  exerciseId: string;
  timestamp: number;
  duration: number;
  accuracy: number;
  achievedBpm: number;
}
export interface Roadmap {
  id: string;
  title: string;
  description: string;
  steps: {
    exerciseId: string;
    targetBpm: number;
  }[];
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}