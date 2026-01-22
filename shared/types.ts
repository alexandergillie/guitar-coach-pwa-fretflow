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
/**
 * A note in a pattern, represented as [string, fretOffset]
 * - string: 1-6 (1 = high E, 6 = low E)
 * - fretOffset: relative to the current position (0 = position fret, 1 = position + 1, etc.)
 */
export type PatternNote = [string: number, fretOffset: number];

/**
 * Drill configuration for moveable exercises
 */
export interface DrillConfig {
  /**
   * How the STRING ORDER changes between positions:
   * - 'ascending': always traverse strings low to high (6→1)
   * - 'descending': always traverse strings high to low (1→6)
   * - 'alternate': alternate string direction each position (6→1, then 1→6, etc.)
   * 
   * Note: This controls string traversal order, NOT the fret pattern.
   * The fret pattern (e.g., 1-2-3-4) stays the same on each string.
   */
  direction: 'ascending' | 'descending' | 'alternate';
  
  /** Starting fret position (1-24) */
  startPosition: number;
  
  /** Ending fret position (1-24) */
  endPosition: number;
  
  /**
   * How many frets to move between positions
   * - Positive: move up the neck (toward bridge)
   * - Negative: move down the neck (toward nut)
   * Must be consistent with start/end positions
   */
  positionIncrement: number;
  
  /** Number of times to repeat the pattern at each position (default: 1) */
  repetitionsPerPosition?: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  technique: string[];
  bpm: number;
  category: 'Speed' | 'Accuracy' | 'Expression' | 'Theory';
  
  /**
   * If true, this exercise can be played at different fret positions.
   * The `pattern` field defines the relative shape, and the user selects
   * a starting position when practicing.
   */
  moveable: boolean;
  
  /**
   * The pattern of notes to play, as an array of [string, fretOffset] pairs
   * in playing order. Only used when `moveable` is true.
   * 
   * Example - Spider Walk ascending:
   * [[6,0], [6,1], [6,2], [6,3], [5,0], [5,1], ...]
   */
  pattern?: PatternNote[];
  
  /**
   * Default starting position for this exercise (1-24).
   * Used as initial value in UI and for preview tablature generation.
   */
  defaultPosition?: number;
  
  /**
   * Drill configuration for practicing across multiple positions.
   * Optional - if not provided, exercise is practiced at a single position.
   */
  drill?: DrillConfig;
  
  /**
   * Static tablature string for display/preview.
   * For moveable exercises, this can be auto-generated from pattern + defaultPosition.
   * For fixed-position exercises, this is the definitive tablature.
   */
  tablature?: string;
}
export interface PracticeSession {
  id: string;
  userId: string;
  exerciseId: string;
  timestamp: number;
  duration: number;
  accuracy: number;
  achievedBpm: number;
  
  /**
   * Starting fret position for this practice session.
   * Only relevant for moveable exercises.
   */
  position?: number;
  
  /**
   * Whether this session was practiced in drill mode (multiple positions).
   */
  drillMode?: boolean;
  
  /**
   * Positions completed during a drill mode session.
   * Allows tracking progress across the fretboard.
   */
  positionsCompleted?: number[];
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