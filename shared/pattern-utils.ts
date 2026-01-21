import type { PatternNote, DrillConfig, Exercise } from './types';

/** String names for tablature display (index 1-6) */
const STRING_NAMES = ['', 'e', 'B', 'G', 'D', 'A', 'E'] as const;

/**
 * Validation result for drill configuration
 */
export interface DrillValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a drill configuration for consistency
 */
export function validateDrillConfig(drill: DrillConfig): DrillValidationResult {
  const errors: string[] = [];

  // Validate position bounds
  if (drill.startPosition < 1 || drill.startPosition > 24) {
    errors.push(`startPosition must be between 1 and 24, got ${drill.startPosition}`);
  }
  if (drill.endPosition < 1 || drill.endPosition > 24) {
    errors.push(`endPosition must be between 1 and 24, got ${drill.endPosition}`);
  }

  // Validate increment is non-zero
  if (drill.positionIncrement === 0) {
    errors.push('positionIncrement cannot be 0');
  }

  // Validate increment direction matches start/end relationship
  if (drill.startPosition < drill.endPosition && drill.positionIncrement < 0) {
    errors.push(
      `positionIncrement must be positive when startPosition (${drill.startPosition}) < endPosition (${drill.endPosition})`
    );
  }
  if (drill.startPosition > drill.endPosition && drill.positionIncrement > 0) {
    errors.push(
      `positionIncrement must be negative when startPosition (${drill.startPosition}) > endPosition (${drill.endPosition})`
    );
  }

  // Validate repetitions if provided
  if (drill.repetitionsPerPosition !== undefined && drill.repetitionsPerPosition < 1) {
    errors.push(`repetitionsPerPosition must be at least 1, got ${drill.repetitionsPerPosition}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an exercise's pattern and drill configuration
 */
export function validateExercise(exercise: Exercise): DrillValidationResult {
  const errors: string[] = [];

  if (exercise.moveable) {
    // Moveable exercises must have a pattern
    if (!exercise.pattern || exercise.pattern.length === 0) {
      errors.push('Moveable exercises must have a pattern defined');
    } else {
      // Validate pattern notes
      for (let i = 0; i < exercise.pattern.length; i++) {
        const [string, fretOffset] = exercise.pattern[i];
        if (string < 1 || string > 6) {
          errors.push(`Pattern note ${i}: string must be between 1 and 6, got ${string}`);
        }
        if (fretOffset < 0 || fretOffset > 24) {
          errors.push(`Pattern note ${i}: fretOffset must be between 0 and 24, got ${fretOffset}`);
        }
      }
    }

    // Validate defaultPosition if provided
    if (exercise.defaultPosition !== undefined) {
      if (exercise.defaultPosition < 1 || exercise.defaultPosition > 24) {
        errors.push(`defaultPosition must be between 1 and 24, got ${exercise.defaultPosition}`);
      }
    }

    // Validate drill config if provided
    if (exercise.drill) {
      const drillValidation = validateDrillConfig(exercise.drill);
      errors.push(...drillValidation.errors);
    }
  } else {
    // Non-moveable exercises must have static tablature
    if (!exercise.tablature) {
      errors.push('Non-moveable exercises must have tablature defined');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates the sequence of positions for a drill
 */
export function getDrillPositions(drill: DrillConfig): number[] {
  const positions: number[] = [];
  const { startPosition, endPosition, positionIncrement } = drill;

  let current = startPosition;
  const isAscending = positionIncrement > 0;

  while (isAscending ? current <= endPosition : current >= endPosition) {
    positions.push(current);
    current += positionIncrement;
  }

  return positions;
}

/**
 * Determines if strings should be traversed in descending order (high to low)
 * at a given position index.
 * 
 * Note: This reverses STRING ORDER, not the fret pattern on each string.
 * For Spider Walk: ascending = 6→5→4→3→2→1, descending = 1→2→3→4→5→6
 */
export function shouldReverseStringOrder(drill: DrillConfig, positionIndex: number): boolean {
  switch (drill.direction) {
    case 'ascending':
      return false;
    case 'descending':
      return true;
    case 'alternate':
      return positionIndex % 2 === 1;
  }
}

// Keep old name as alias for backwards compatibility
export const shouldReversePattern = shouldReverseStringOrder;

/**
 * Gets the pattern for a specific position in a drill, handling string direction.
 * 
 * This reverses the STRING ORDER while keeping the fret pattern on each string intact.
 * For example, Spider Walk with pattern [[6,0],[6,1],[6,2],[6,3],[5,0],...,[1,3]]:
 * - Ascending: plays as defined (low E first)
 * - Descending: reorders so high E comes first, but each string still plays 0,1,2,3
 */
export function getPatternAtPosition(
  pattern: PatternNote[],
  drill: DrillConfig,
  positionIndex: number
): PatternNote[] {
  const shouldReverse = shouldReverseStringOrder(drill, positionIndex);
  
  if (!shouldReverse) {
    return pattern;
  }
  
  // Group notes by string, preserving order within each string
  const notesByString = new Map<number, PatternNote[]>();
  for (const note of pattern) {
    const [string] = note;
    if (!notesByString.has(string)) {
      notesByString.set(string, []);
    }
    notesByString.get(string)!.push(note);
  }
  
  // Get strings in the order they appear in the pattern
  const stringOrder = Array.from(notesByString.keys());
  
  // Reverse the string order
  const reversedStringOrder = [...stringOrder].reverse();
  
  // Rebuild pattern with reversed string order
  const reversedPattern: PatternNote[] = [];
  for (const string of reversedStringOrder) {
    reversedPattern.push(...notesByString.get(string)!);
  }
  
  return reversedPattern;
}

/**
 * Converts a pattern to absolute fret numbers at a given position
 */
export function patternToAbsoluteFrets(
  pattern: PatternNote[],
  position: number
): Array<{ string: number; fret: number }> {
  return pattern.map(([string, fretOffset]) => ({
    string,
    fret: position + fretOffset,
  }));
}

/**
 * Generates tablature string from a pattern at a specific position
 */
export function generateTablature(
  pattern: PatternNote[],
  position: number,
  options: {
    /** Include string labels (E, A, D, G, B, e) */
    includeLabels?: boolean;
    /** Characters per beat (affects spacing) */
    spacing?: number;
  } = {}
): string {
  const { includeLabels = true, spacing = 2 } = options;

  // Group notes by string
  const stringNotes: Map<number, number[]> = new Map();
  for (let s = 1; s <= 6; s++) {
    stringNotes.set(s, []);
  }

  // Track timing - each note gets a position in sequence
  let noteIndex = 0;
  for (const [string, fretOffset] of pattern) {
    const fret = position + fretOffset;
    const notes = stringNotes.get(string)!;
    
    // Pad with dashes up to current position
    while (notes.length < noteIndex) {
      notes.push(-1); // -1 represents a dash
    }
    notes.push(fret);
    noteIndex++;
  }

  // Pad all strings to same length
  const maxLength = noteIndex;
  for (const notes of stringNotes.values()) {
    while (notes.length < maxLength) {
      notes.push(-1);
    }
  }

  // Build tablature string (high E first = string 1)
  const lines: string[] = [];
  for (let s = 1; s <= 6; s++) {
    const label = includeLabels ? `${STRING_NAMES[s]}|` : '|';
    const notes = stringNotes.get(s)!;
    const noteStr = notes
      .map((fret) => {
        if (fret === -1) return '-'.repeat(spacing);
        const fretStr = fret.toString();
        return fretStr.padEnd(spacing, '-');
      })
      .join('');
    lines.push(`${label}${noteStr}|`);
  }

  return lines.join('\n');
}

/**
 * Generates a preview tablature for an exercise
 * Uses defaultPosition or falls back to position 1
 */
export function generateExercisePreviewTab(exercise: Exercise): string | null {
  if (!exercise.moveable || !exercise.pattern) {
    return exercise.tablature || null;
  }

  const position = exercise.defaultPosition || 1;
  return generateTablature(exercise.pattern, position);
}
