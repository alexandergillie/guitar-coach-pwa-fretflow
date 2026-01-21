/**
 * Tablature Parser
 *
 * Parses ASCII guitar tablature into Note objects with expected pitch and timing.
 */

import type { Note } from './ml';

// Standard guitar tuning (low to high)
const STANDARD_TUNING = [
  82.41,  // E2 (6th string)
  110.00, // A2 (5th string)
  146.83, // D3 (4th string)
  196.00, // G3 (3rd string)
  246.94, // B3 (2nd string)
  329.63  // E4 (1st string)
];

// String names for parsing
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'e'];

interface ParsedNote {
  stringIndex: number; // 0-5 (E string = 0, e string = 5)
  fret: number;
  position: number; // Character position in tab
}

/**
 * Calculate frequency for a given string and fret
 */
function calculateFrequency(stringIndex: number, fret: number): number {
  // Reverse index (tab shows high E first, but we store low E first)
  const actualStringIndex = 5 - stringIndex;
  const openFrequency = STANDARD_TUNING[actualStringIndex];

  // Each fret raises pitch by one semitone (factor of 2^(1/12))
  return openFrequency * Math.pow(2, fret / 12);
}

/**
 * Convert frequency to note name
 */
function frequencyToNote(frequency: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);

  const halfSteps = Math.round(12 * Math.log2(frequency / C0));
  const octave = Math.floor(halfSteps / 12);
  const noteIndex = halfSteps % 12;

  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Parse ASCII tablature string into array of expected notes
 *
 * @param tabString - ASCII tab notation (e.g., "E|--1-2-3--|\nB|--4-5-6--|")
 * @param bpm - Beats per minute for timing calculation
 * @returns Array of Note objects with pitch, note name, and timestamp
 */
export function parseTablature(tabString: string, bpm: number = 120): Note[] {
  const lines = tabString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const notes: ParsedNote[] = [];

  // Parse each line (string)
  for (let stringIndex = 0; stringIndex < lines.length; stringIndex++) {
    const line = lines[stringIndex];

    // Extract the tab content after the "|"
    const pipeIndex = line.indexOf('|');
    if (pipeIndex === -1) continue;

    const tabContent = line.substring(pipeIndex + 1);

    // Find all fret numbers in this line
    let currentNumber = '';
    for (let i = 0; i < tabContent.length; i++) {
      const char = tabContent[i];

      if (char >= '0' && char <= '9') {
        currentNumber += char;
      } else {
        if (currentNumber) {
          const fret = parseInt(currentNumber);
          notes.push({
            stringIndex,
            fret,
            position: i - currentNumber.length
          });
          currentNumber = '';
        }
      }
    }

    // Handle last number if line ends with a digit
    if (currentNumber) {
      notes.push({
        stringIndex,
        fret: parseInt(currentNumber),
        position: tabContent.length - currentNumber.length
      });
    }
  }

  // Sort notes by position (left to right in tab)
  notes.sort((a, b) => a.position - b.position);

  // Calculate timing based on BPM
  // Assume each character represents 1/16th note by default
  const millisecondsPerBeat = 60000 / bpm;
  const millisecondsPerSixteenth = millisecondsPerBeat / 4;

  // Convert to Note objects with timing
  return notes.map((parsedNote, index) => {
    const frequency = calculateFrequency(parsedNote.stringIndex, parsedNote.fret);
    const note = frequencyToNote(frequency);

    // Calculate timestamp based on position
    // This is approximate - real timing would come from rhythm notation
    const timestamp = parsedNote.position * millisecondsPerSixteenth;

    return {
      pitch: frequency,
      note,
      timestamp,
      confidence: 1.0 // Expected notes have 100% confidence
    };
  });
}

/**
 * Get total duration of tablature in milliseconds
 */
export function getTablatureDuration(tabString: string, bpm: number = 120): number {
  const lines = tabString.split('\n');
  const maxLength = Math.max(...lines.map(line => {
    const pipeIndex = line.indexOf('|');
    return pipeIndex === -1 ? 0 : line.substring(pipeIndex + 1).length;
  }));

  const millisecondsPerBeat = 60000 / bpm;
  const millisecondsPerSixteenth = millisecondsPerBeat / 4;

  return maxLength * millisecondsPerSixteenth;
}

/**
 * Count total number of notes in tablature
 */
export function countNotes(tabString: string): number {
  const notes = parseTablature(tabString);
  return notes.length;
}
