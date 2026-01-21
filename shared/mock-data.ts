import type { User, Chat, ChatMessage, Exercise, Roadmap, SkillProfile } from './types';
export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Guitar God', 
    streak: 5,
    skillProfile: {
      alternatePicking: 75,
      sweepPicking: 40,
      legato: 80,
      tapping: 60,
      rhythm: 90,
      bending: 85,
      vibrato: 70,
      theory: 50
    }
  }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'General' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Shred on!', ts: Date.now() },
];
export const DEFAULT_SKILL_PROFILE: SkillProfile = {
  alternatePicking: 0,
  sweepPicking: 0,
  legato: 0,
  tapping: 0,
  rhythm: 0,
  bending: 0,
  vibrato: 0,
  theory: 0
};
export const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex1',
    title: 'Spider Walk',
    description: 'The classic chromatic finger independence exercise. Practice ascending and descending across all strings, moving up the neck one fret at a time.',
    difficulty: 'Beginner',
    technique: ['Finger Independence', 'Chromatic'],
    bpm: 80,
    category: 'Accuracy',
    moveable: true,
    defaultPosition: 1,
    // Pattern: 4 notes per string, ascending from low E to high E
    pattern: [
      // Low E string (6)
      [6, 0], [6, 1], [6, 2], [6, 3],
      // A string (5)
      [5, 0], [5, 1], [5, 2], [5, 3],
      // D string (4)
      [4, 0], [4, 1], [4, 2], [4, 3],
      // G string (3)
      [3, 0], [3, 1], [3, 2], [3, 3],
      // B string (2)
      [2, 0], [2, 1], [2, 2], [2, 3],
      // High E string (1)
      [1, 0], [1, 1], [1, 2], [1, 3],
    ],
    drill: {
      direction: 'alternate',
      startPosition: 1,
      endPosition: 12,
      positionIncrement: 1,
      repetitionsPerPosition: 1,
    },
  },
  {
    id: 'ex2',
    title: 'Minor Pentatonic Box 1',
    description: 'The most common pentatonic shape. Default position is A minor (5th fret). Move to different positions to play in different keys.',
    difficulty: 'Beginner',
    technique: ['Alternate Picking', 'Scales'],
    bpm: 100,
    category: 'Speed',
    moveable: true,
    defaultPosition: 5, // A minor
    // Pattern: Minor pentatonic box 1, ascending
    pattern: [
      // Low E string: root, b3
      [6, 0], [6, 3],
      // A string: 4, 5
      [5, 0], [5, 2],
      // D string: b7, root
      [4, 0], [4, 2],
      // G string: b3, 4
      [3, 0], [3, 2],
      // B string: 5, b7
      [2, 0], [2, 3],
      // High E string: root, b3
      [1, 0], [1, 3],
    ],
    drill: {
      direction: 'alternate',
      startPosition: 5,
      endPosition: 17, // Up to high A minor
      positionIncrement: 2, // Move in whole steps through common keys
    },
  },
  {
    id: 'ex3',
    title: 'Arpeggio Sequence',
    description: 'Three-note-per-string arpeggio pattern. Great for developing sweep picking or economy picking across strings.',
    difficulty: 'Advanced',
    technique: ['Sweep Picking', 'Arpeggios'],
    bpm: 120,
    category: 'Speed',
    moveable: true,
    defaultPosition: 12,
    // Pattern: Ascending arpeggio shape
    pattern: [
      // G string
      [3, 0], [3, 2], [3, 4],
      // B string
      [2, 0], [2, 1], [2, 3],
      // High E string
      [1, 0], [1, 1], [1, 4],
    ],
    drill: {
      direction: 'alternate',
      startPosition: 12,
      endPosition: 1,
      positionIncrement: -1, // Descend the neck
    },
  },
  {
    id: 'ex4',
    title: 'Economy Picking Threes',
    description: 'Three-note ascending pattern across strings. Focus on the pick direction change when crossing strings.',
    difficulty: 'Intermediate',
    technique: ['Economy Picking'],
    bpm: 100,
    category: 'Speed',
    moveable: true,
    defaultPosition: 5,
    pattern: [
      // Three notes ascending on G string
      [3, 0], [3, 2], [3, 4],
      // Continue on B string
      [2, 0], [2, 2], [2, 3],
      // Finish on high E
      [1, 0], [1, 2], [1, 3],
    ],
    drill: {
      direction: 'ascending',
      startPosition: 1,
      endPosition: 12,
      positionIncrement: 1,
    },
  },
  {
    id: 'ex5',
    title: 'Open Chord Transitions: G-C-D',
    description: 'Practice smooth transitions between the three most common open chords. Focus on minimizing finger movement and keeping time.',
    difficulty: 'Beginner',
    technique: ['Chord Changes', 'Rhythm'],
    bpm: 60,
    category: 'Accuracy',
    moveable: false,
    tablature: `e|--3-----0-----2-----|\nB|--0-----1-----3-----|\nG|--0-----0-----2-----|\nD|--0-----2-----0-----|\nA|--2-----3-----------|\nE|--3-----------------|`,
  },
];
export const SEED_ROADMAPS: Roadmap[] = [
  {
    id: 'road1',
    title: 'Speed Starter',
    description: 'A 4-step path to increasing your picking speed.',
    steps: [
      { exerciseId: 'ex1', targetBpm: 120 },
      { exerciseId: 'ex2', targetBpm: 140 }
    ]
  }
];