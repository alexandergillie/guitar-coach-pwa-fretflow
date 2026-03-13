# FretFlow Guitar Coach - Product Requirements Document

**Last Updated:** March 13, 2026
**Project:** FretFlow Guitar Coach PWA
**Status:** Active Development

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Core Features](#core-features)
3. [Learning Roadmaps Specification](#learning-roadmaps-specification)
4. [Data Models](#data-models)
5. [Recommended Learning Order](#recommended-learning-order)

---

## Product Vision

FretFlow is a Progressive Web App that combines real-time audio analysis with structured practice programs to help guitarists develop technique systematically. The app targets guitarists from beginner to advanced who want guided, measurable improvement.

---

## Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| Real-time pitch & BPM detection | ✅ Live | YIN algorithm, ~100ms latency |
| Interactive practice sessions | ✅ Live | Audio visualizer + metronome |
| Exercise library | ✅ Live | Moveable + fixed exercises |
| Progress tracking | ✅ Live | Sessions, streaks, skill profile |
| Learning roadmaps | 🔄 In Progress | Rich weekly structure (this PRD) |
| Skill assessment | ✅ Live | Sets skill profile baseline |
| Offline PWA | ✅ Live | Service worker caching |

---

## Learning Roadmaps Specification

### Design Philosophy

- **Time Budget**: 15–30 minutes per session
- **Structure**: Each week has 3–4 focused exercises, practiced across 5–6 sessions
- **Progression**: BPM increases are gradual (5–10 BPM per week) to build clean technique before speed
- **Theory Integration**: Where relevant, roadmaps include "why this works" explanations

---

### Roadmap 1: Alternate Picking Precision

**Duration**: 6 weeks
**Goal**: Clean, consistent alternate picking at 160+ BPM
**Target Techniques**: `alternate_picking`, `pick_accuracy`, `synchronization`
**Difficulty**: Intermediate

#### The Approach

Most players hit a speed wall because they never built clean mechanics at slow tempos. This roadmap enforces "slow is smooth, smooth is fast" — weeks are spent at uncomfortable slow tempos to rewire the picking motion before speed is introduced.

#### Week 1: Motion Audit (BPM: 60–70)

**Focus**: Establish efficient picking motion, eliminate tension
**Theory Bite**: The pick should move the minimum distance needed. Most speed is lost to excessive motion, not lack of muscle.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Single String Chromatic | 1-2-3-4 on high E, strict alternate picking | 60 BPM | 5 min |
| Tremolo Bursts | 4 notes as fast as possible, then rest. Focus on relaxation | — | 5 min |
| Accent Patterns | 1-2-3-4 with accent on 1, then 2, etc. Forces pick control | 60 BPM | 5 min |
| Metronome Locking | Single note, quarter notes, eyes closed. Lock in before moving on | 70 BPM | 5 min |

**Milestone**: Can play chromatic 1-2-3-4 at 70 BPM with zero tension, zero missed picks

#### Week 2: String Crossing Foundation (BPM: 70–80)

**Focus**: Inside and outside picking across two strings
**Theory Bite**: "Inside picking" (pick trapped between strings) and "outside picking" (pick escapes over string) require different motions.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Two-String Loop | 5-7 on B, 5-7 on E, loop. Strict alternate | 70 BPM | 6 min |
| Outside Picking Drill | Pattern that forces pick to escape outward | 70 BPM | 6 min |
| Inside Picking Drill | Pattern that forces pick to stay between strings | 70 BPM | 6 min |
| Combined Pattern | Mix of inside/outside in single phrase | 75 BPM | 6 min |

**Milestone**: Both picking directions feel equally controlled at 80 BPM

#### Week 3: Three-String Patterns (BPM: 80–95)

**Focus**: Scale fragments across three strings
**Theory Bite**: Most metal riffs live in 2–3 string boxes.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Three-Note-Per-String Fragment | E minor pattern, strings 1-2-3 | 80 BPM | 6 min |
| Descending Sequence | Same pattern descending | 80 BPM | 6 min |
| Position Shift | Move the box up 2 frets mid-phrase | 85 BPM | 6 min |
| ABR-Style Melodic Run | Simplified melodic run | 90 BPM | 6 min |

**Milestone**: Clean three-string runs at 95 BPM, both directions

#### Week 4: Synchronization Focus (BPM: 95–110)

**Focus**: Both hands perfectly together
**Theory Bite**: At higher speeds, pick and fret hands desync.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Accent Sync | Accent beat 1 of every 4, fret hand must match | 95 BPM | 6 min |
| Gallop Patterns | Down-down-up rhythm | 100 BPM | 6 min |
| Pause and Resume | Play 8 notes, pause 4, resume | 100 BPM | 6 min |
| Speed Burst | 8 notes at 120, 8 at 100. Build burst capacity | 100–120 | 6 min |

**Milestone**: Clean playing at 110 BPM with intentional accents

#### Week 5: Speed Building (BPM: 110–140)

**Focus**: Progressive overload
**Theory Bite**: Your nervous system adapts to speed incrementally.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Plateau Breaker | Play at max clean speed for 2 min, rest, push 5 BPM | 120 BPM | 8 min |
| Sixteenth Note Runs | Full bar of 16ths on scale pattern | 120 BPM | 6 min |
| Tempo Pyramid | 100→120→140→120→100. Build then recover | Variable | 6 min |
| Riff Application | Apply to actual riff fragment | 130 BPM | 5 min |

**Milestone**: Can burst to 140 BPM cleanly for 2–4 bars

#### Week 6: Integration & Riffs (BPM: 140–160+)

**Focus**: Apply to real music

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Metal Riff #1 | Simplified ABR-style riff | 140 BPM | 8 min |
| Speed Consolidation | Chromatic exercise from Week 1, now at speed | 150 BPM | 5 min |
| Endurance Run | 2-minute continuous playing at 140 | 140 BPM | 5 min |
| Push Day | Attempt 160+, note where it breaks down | 160 BPM | 5 min |

**Milestone**: Can play a metal riff cleanly at 150+ BPM

---

### Roadmap 2: Metalcore Rhythm Foundations

**Duration**: 5 weeks
**Goal**: Tight, percussive rhythm playing for metalcore
**Target Techniques**: `palm_muting`, `rhythm`, `syncopation`, `chugging`
**Difficulty**: Beginner

#### The Approach

Metalcore rhythm is about precision, not just heaviness. Clean palm muting, locked-in timing, and dynamic control separate amateur chugging from pro-level tightness.

#### Week 1: Palm Mute Mechanics (BPM: 80–100)

**Focus**: Consistent mute pressure, clean attack
**Theory Bite**: Palm mute position changes tone — closer to bridge = tighter, toward neck = looser.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Mute Pressure Drill | Same note, vary mute pressure from tight to loose | 80 BPM | 5 min |
| Open-to-Mute Transitions | Alternate between open and muted on same string | 90 BPM | 5 min |
| Single String Chugs | Continuous 8th notes, perfect consistency | 100 BPM | 5 min |
| Power Chord Mutes | Palm muted power chords, E5-F5-G5 | 90 BPM | 5 min |

**Milestone**: Consistent mute tone, no accidental open notes

#### Week 2: Syncopation Basics (BPM: 90–110)

**Focus**: Off-beat accents
**Theory Bite**: Metalcore rarely sits on straight beats. Syncopation = accenting the "and" of beats.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Off-Beat Accents | Accent the "and" of each beat (1-AND-2-AND) | 90 BPM | 6 min |
| Djent Pattern #1 | 0-0-0-x-0-x-0-0 (x = rest) | 100 BPM | 6 min |
| Tied Note Feel | Hold notes across beat boundaries | 100 BPM | 6 min |
| Breakdown Groove | Simple breakdown pattern with syncopation | 110 BPM | 6 min |

**Milestone**: Can feel and play syncopated rhythms without counting

#### Week 3: Gallops and Rhythmic Variation (BPM: 100–130)

**Focus**: Triplet feels, gallops, rhythmic vocabulary
**Theory Bite**: The gallop (down-down-up) is a foundational metal rhythm — technically a dotted-eighth + sixteenth pattern.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Basic Gallop | D-D-U continuous on low E | 100 BPM | 5 min |
| Reverse Gallop | U-D-D continuous | 100 BPM | 5 min |
| Gallop with Chord Changes | Gallop while moving E5-A5-D5 | 110 BPM | 5 min |
| Mixed Rhythm | 8ths + gallop + 16ths in one phrase | 120 BPM | 5 min |
| ABR Rhythm Study | Breakdown rhythm from Composure | 125 BPM | 5 min |

**Milestone**: Smooth gallops at 130 BPM, can switch between rhythm types

#### Week 4: Breakdowns & Dynamics (BPM: 70–90, half-time feel)

**Focus**: Half-time grooves, dynamic control, space
**Theory Bite**: Breakdowns work because of contrast — half as fast but twice as heavy.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Half-Time Chugs | Heavy, spaced hits with room to breathe | 70 BPM | 6 min |
| Dynamic Swells | Soft → loud on repeated phrase | 80 BPM | 5 min |
| Rest Placement | Riff with intentional rests for impact | 80 BPM | 6 min |
| Classic Breakdown | Archetypal metalcore breakdown pattern | 85 BPM | 6 min |

**Milestone**: Can play a breakdown with confident, heavy attack

#### Week 5: Full Song Application (Variable BPM)

**Focus**: String techniques into song structures
**Theory Bite**: Metalcore songs typically follow: Intro → Verse → Chorus → Breakdown → Bridge → Chorus.

| Exercise | Description | Target | Time |
|----------|-------------|--------|------|
| Verse Rhythm | Continuous driving rhythm, steady | 130 BPM | 6 min |
| Chorus Chords | More open, sustained power chords | 130 BPM | 5 min |
| Breakdown Transition | Go from verse speed to breakdown | Variable | 6 min |
| Mini-Song Structure | Play through V-C-B-C structure | Variable | 8 min |

**Milestone**: Can play through a song structure maintaining tightness

---

### Roadmap 3: Left Hand Liberation (Legato & Stretches)

**Duration**: 5 weeks
**Goal**: Fluid legato playing, comfortable 4–5 fret stretches
**Target Techniques**: `legato`, `hammer_ons`, `pull_offs`, `finger_independence`, `stretching`
**Difficulty**: Intermediate

#### The Approach

The fretting hand is typically undertrained compared to the picking hand. Legato forces the left hand to do the work, building strength and independence.

*(See weekly breakdown in implementation — mirrors structure above)*

---

### Roadmap 4: Sweep Picking Foundations

**Duration**: 6 weeks
**Goal**: Clean 3-string and 5-string sweep arpeggios
**Target Techniques**: `sweep_picking`, `arpeggios`, `economy_picking`
**Difficulty**: Advanced

#### The Approach

Sweep picking fails when players try to go fast before the motion is correct. Three weeks are spent on 2–3 strings before adding more.

---

### Roadmap 5: Two-Hand Tapping

**Duration**: 5 weeks
**Goal**: Clean single-string and multi-string tapping
**Target Techniques**: `tapping`, `legato`, `finger_independence`
**Difficulty**: Advanced

---

### Roadmap 6: Lead Guitar Foundations

**Duration**: 6 weeks
**Goal**: Understand lead guitar fundamentals — scales, phrasing, and application
**Target Techniques**: `scales`, `phrasing`, `bending`, `vibrato`, `theory`
**Difficulty**: Intermediate
**Theory Focus**: Yes — 50% theory, 50% technique

---

### Roadmap 7: Rhythm & Timing Fundamentals

**Duration**: 4 weeks
**Goal**: Rock-solid timing, subdivision mastery
**Target Techniques**: `rhythm`, `timing`, `metronome_practice`, `subdivisions`
**Difficulty**: Beginner

---

## Data Models

```typescript
interface Roadmap {
  id: string;
  title: string;
  description: string;
  approach: string;
  durationWeeks: number;
  targetTechniques: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timePerSessionMinutes: number;
  prerequisites?: string[]; // roadmap IDs
  theoryFocus: boolean;
  weeks: RoadmapWeek[];
}

interface RoadmapWeek {
  weekNumber: number;
  title: string;
  focus: string;
  theoryBite: string;
  targetBpmRange: string;
  exercises: RoadmapWeekExercise[];
  milestone: string;
  theoryHomework?: string;
}

interface RoadmapWeekExercise {
  name: string;
  description: string;
  targetBpm?: string;
  durationMinutes: number;
  exerciseId?: string; // optional link to Exercise entity
}
```

---

## Recommended Learning Order

Based on goals of ABR riffs, 160+ BPM picking, sweep/tap, and theory:

1. **Start**: Rhythm & Timing Fundamentals (4 weeks) — Foundation for everything
2. **Then**: Alternate Picking Precision (6 weeks) — Core speed technique
3. **Then**: Metalcore Rhythm Foundations (5 weeks) — Direct ABR application
4. **Parallel/After**: Left Hand Liberation (5 weeks) — Legato weakness
5. **Then**: Lead Guitar Foundations (6 weeks) — Theory
6. **Finally**: Sweep Picking (6 weeks) and Tapping (5 weeks) — Advanced goals

**Total**: ~37 weeks sequential; many can overlap (e.g., rhythm morning, picking evening)
