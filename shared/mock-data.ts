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
    title: 'Spider Walk Warmup',
    description: 'The classic chromatic independence exercise.',
    difficulty: 'Beginner',
    technique: ['Finger Independence'],
    bpm: 80,
    category: 'Accuracy',
    tablature: `E|-----------------------1-2-3-4-|\nB|---------------1-2-3-4---------|\nG|-------1-2-3-4-----------------|\nD|1-2-3-4-------------------------|`
  },
  {
    id: 'ex2',
    title: 'Minor Pentatonic Speed',
    description: 'Develop speed with the A minor pentatonic scale.',
    difficulty: 'Intermediate',
    technique: ['Alternate Picking'],
    bpm: 120,
    category: 'Speed',
    tablature: `E|---------------------------5-8-|\nB|-----------------------5-8-----|\nG|-------------------5-7---------|\nD|---------------5-7-------------|`
  },
  {
    id: 'ex3',
    title: 'Arpeggio from Hell Intro',
    description: 'Yngwie-style alternate picking madness.',
    difficulty: 'Master',
    technique: ['Alternate Picking'],
    bpm: 160,
    category: 'Speed',
    tablature: `E|------------------12-13-16-13-12-|\nB|---------12-13-15----------------|\nG|13-14-16-------------------------|`
  },
  {
    id: 'ex4',
    title: 'Economy Picking 101',
    description: 'Transition smoothly between strings.',
    difficulty: 'Intermediate',
    technique: ['Economy Picking'],
    bpm: 100,
    category: 'Speed',
    tablature: `E|-----------------12-14-15-----|\nB|--------12-14-15--------------|\nG|12-14-15----------------------|`
  }
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