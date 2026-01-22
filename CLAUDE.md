# CLAUDE.md - AI Assistant Guide

**Last Updated:** January 22, 2026
**Project:** FretFlow Guitar Coach PWA
**Purpose:** Comprehensive guide for AI assistants working with this codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Development Workflow](#development-workflow)
6. [Code Conventions](#code-conventions)
7. [Common Patterns](#common-patterns)
8. [Key Files Reference](#key-files-reference)
9. [API Endpoints](#api-endpoints)
10. [Audio Analysis System](#audio-analysis-system)
11. [PWA Features](#pwa-features)
12. [Testing Guidelines](#testing-guidelines)
13. [Deployment Process](#deployment-process)
14. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**FretFlow** is a production-ready **Progressive Web App (PWA)** for guitar practice and skill development. It combines real-time audio analysis with structured practice exercises to help guitarists improve their technique.

### Core Features

- **Real-time Audio Analysis**: DSP-based pitch detection and BPM tracking using YIN algorithm
- **Interactive Practice Sessions**: Audio visualization, metronome, and tablature display
- **Moveable Exercises**: Position-based exercises with drill mode for neck exploration
- **Progress Tracking**: Skill profiles, practice streaks, and session analytics
- **Offline-First PWA**: Service worker caching, installable on mobile devices
- **Serverless Architecture**: Cloudflare Workers backend with Durable Objects storage

### Project Goals

1. Provide accurate real-time feedback for guitar practice
2. Work offline on all devices (mobile-first design)
3. Maintain low latency (&lt;100ms) for audio analysis
4. Scale efficiently using serverless architecture
5. Deliver native-like app experience on mobile

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6.3.1 | Build tool & dev server |
| **React Router** | 6.30.0 | Client-side routing |
| **TanStack Query** | 5.83.0 | Server state management |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Radix UI** | Latest | Accessible component primitives |
| **shadcn/ui** | Latest | Pre-built component library |
| **Framer Motion** | 12.23.0 | Animations |
| **Lucide React** | 0.525.0 | Icon library |

### Audio & Music

| Technology | Version | Purpose |
|------------|---------|---------|
| **pitchfinder** | 2.3.4 | YIN pitch detection algorithm |
| **@tonaljs/tonal** | 4.10.0 | Music theory utilities |
| **Web Audio API** | Native | Audio processing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Cloudflare Workers** | Latest | Serverless compute |
| **Hono** | 4.9.8 | Web framework |
| **Durable Objects** | Latest | Persistent storage |
| **SQLite** | CF-managed | Database backend |

### Developer Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Bun** | 1.1+ | Package manager & runtime |
| **Wrangler** | Latest | Cloudflare CLI |
| **ESLint** | 9.31.0 | Code linting |
| **PostCSS** | 8.5.3 | CSS processing |

---

## Directory Structure

```
/home/user/guitar-coach-pwa-fretflow/
├── src/                              # Frontend React application
│   ├── pages/                        # Page components (8 routes)
│   │   ├── HomePage.tsx              # Dashboard & overview
│   │   ├── AssessmentPage.tsx        # Skill assessment flow
│   │   ├── ExerciseLibraryPage.tsx   # Browse exercises
│   │   ├── ExerciseDetailPage.tsx    # Exercise info & drill config
│   │   ├── PracticePage.tsx          # Main practice interface (20KB)
│   │   ├── SessionAnalysisPage.tsx   # Post-practice results
│   │   ├── ProgressPage.tsx          # Analytics dashboard
│   │   └── RoadmapsPage.tsx          # Learning paths
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui primitives (~40 components)
│   │   ├── layout/                   # AppLayout, sidebar
│   │   ├── practice/                 # Visualizer, Metronome
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   ├── PwaInstallPrompt.tsx      # PWA install UI
│   │   ├── ThemeToggle.tsx           # Dark/light mode switcher
│   │   └── app-sidebar.tsx           # Navigation sidebar
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-audio-analysis.ts     # Real-time pitch/BPM detection
│   │   ├── use-audio-engine.ts       # Audio Context & mic access
│   │   ├── use-theme.ts              # Theme management
│   │   └── use-mobile.tsx            # Mobile detection
│   │
│   ├── lib/                          # Utilities & business logic
│   │   ├── ml/                       # Audio analysis modules
│   │   │   ├── capabilities.ts       # Device capability detection
│   │   │   ├── audio-analyzer.ts     # Base analyzer interface
│   │   │   ├── dsp-analyzer.ts       # YIN algorithm implementation
│   │   │   ├── analyzer-factory.ts   # Factory pattern
│   │   │   └── index.ts              # Public API
│   │   ├── api-client.ts             # TanStack Query wrapper
│   │   ├── errorReporter.ts          # Global error tracking
│   │   ├── tablature-parser.ts       # Guitar tab parsing
│   │   └── utils.ts                  # General utilities
│   │
│   ├── assets/                       # SVG assets
│   ├── App.tsx                       # Route configuration
│   ├── main.tsx                      # App entry & SW registration
│   └── vite-env.d.ts                 # Vite type definitions
│
├── worker/                           # Cloudflare Workers backend
│   ├── index.ts                      # Hono server with hot-reload
│   ├── user-routes.ts                # API route definitions
│   ├── entities.ts                   # Data entity classes
│   └── core-utils.ts                 # Base entity & storage utilities
│
├── shared/                           # Shared types & utilities
│   ├── types.ts                      # TypeScript interfaces
│   ├── mock-data.ts                  # Seed data
│   └── pattern-utils.ts              # Exercise pattern utilities
│
├── public/                           # Static assets
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   └── icons/                        # App icons (SVG + PNGs)
│
├── Configuration Files
│   ├── vite.config.ts                # Vite build & dev config
│   ├── wrangler.jsonc                # Cloudflare Workers config
│   ├── tailwind.config.js            # Tailwind theme & extensions
│   ├── tsconfig.json                 # TypeScript config
│   ├── eslint.config.js              # ESLint rules
│   ├── postcss.config.js             # PostCSS config
│   ├── components.json               # shadcn/ui config
│   └── package.json                  # Dependencies & scripts
│
└── Documentation
    ├── README.md                     # Main project guide
    ├── AUDIO-ANALYSIS.md             # Audio system deep dive
    ├── PWA-IMPLEMENTATION.md         # PWA features & setup
    └── CLAUDE.md                     # This file
```

### Important Path Aliases

```typescript
// Configured in vite.config.ts and tsconfig.json
"@/*"       → "src/*"        // Frontend code
"@shared/*" → "shared/*"     // Shared types
```

---

## Architecture Patterns

### Frontend Architecture

#### State Management Strategy

```typescript
// SERVER STATE: Use TanStack Query
const { data: exercises } = useQuery({
  queryKey: ['exercises'],
  queryFn: fetchExercises,
});

// LOCAL STATE: Use React hooks
const [position, setPosition] = useState(1);

// PERSISTENT STATE: Use localStorage
const theme = localStorage.getItem('theme') || 'dark';

// ZUSTAND: Available but not yet used (v5.0.6 installed)
// Can be added for global app state when needed
```

#### Component Patterns

```typescript
// PAGE COMPONENTS: Use AppLayout wrapper
import { AppLayout } from '@/components/layout/AppLayout';

export function HomePage() {
  return (
    <AppLayout>
      {/* Page content */}
    </AppLayout>
  );
}

// UI COMPONENTS: Use shadcn/ui primitives
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// CUSTOM HOOKS: Extract complex logic
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
```

#### Error Handling

```typescript
// Route-level error boundaries
<Route
  path="/practice/:id"
  element={<PracticePage />}
  errorElement={<RouteErrorBoundary />}
/>

// Global error reporting (automatic)
// Sends errors to /api/client-errors
// Configured in src/lib/errorReporter.ts
```

### Backend Architecture

#### Entity Pattern (Durable Objects)

```typescript
// ALL ENTITIES extend IndexedEntity
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", streak: 0 };
  static seedData = MOCK_USERS;
}

// CRUD operations via base class
await entity.getState();           // Read
await entity.mutate(s => ({ ...s, name: 'New' })); // Update
await entity.delete();             // Delete
```

#### API Route Pattern

```typescript
// Routes defined in worker/user-routes.ts
export function userRoutes(app: Hono) {
  app.get('/api/exercises', async (c) => {
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const result = await ExerciseEntity.listAll(db);
    return c.json({ success: true, data: result });
  });
}
```

#### Transaction Pattern (ACID)

```typescript
// All mutations use optimistic locking (CAS)
await entity.mutate(state => {
  // This function runs inside a transaction
  // If another mutation happens concurrently, this will retry
  return { ...state, streak: state.streak + 1 };
});
```

---

## Development Workflow

### Local Development

```bash
# 1. Install dependencies
bun install

# 2. Start dev server (frontend + backend hot-reload)
bun dev
# Opens at http://localhost:3000
# API available at http://localhost:3000/api/*

# 3. Run linter
bun run lint

# 4. Add shadcn components (as needed)
npx shadcn@latest add <component-name>
```

### Build & Preview

```bash
# Build for production
bun run build
# Output: /dist folder

# Preview production build locally
bun run preview
# Opens at http://localhost:4173
```

### Hot Reload Behavior

- **Frontend**: Vite Fast Refresh (React components update without full reload)
- **Backend**: Automatic reload on file changes in `worker/` directory
- **Dependencies**: Watches `package.json` and `bun.lock` for cache invalidation
- **Trigger File**: `.reload-trigger` can force full reload

### Type Generation

```bash
# Generate Cloudflare Workers types (after deployment)
bun run cf-typegen
```

---

## Code Conventions

### File Naming

```typescript
// COMPONENTS: PascalCase with .tsx extension
HomePage.tsx
AppLayout.tsx
PwaInstallPrompt.tsx

// HOOKS: camelCase with use prefix
use-audio-analysis.ts
use-audio-engine.ts

// UTILITIES: camelCase
api-client.ts
errorReporter.ts
tablature-parser.ts

// TYPES: camelCase
types.ts
mock-data.ts

// CONSTANTS: UPPER_SNAKE_CASE (inside files)
const SEED_EXERCISES = [...];
const MAX_NOTES_HISTORY = 100;
```

### Component Structure

```typescript
// 1. Imports (grouped)
import { useState, useEffect } from 'react';           // React
import { useQuery } from '@tanstack/react-query';      // External libs
import { Button } from '@/components/ui/button';       // Internal UI
import { useAudioEngine } from '@/hooks/use-audio-engine'; // Hooks
import type { Exercise } from '@shared/types';         // Types

// 2. Type definitions
interface Props {
  exerciseId: string;
}

// 3. Component
export function PracticePage({ exerciseId }: Props) {
  // Hooks first
  const [position, setPosition] = useState(1);
  const { data } = useQuery(...);

  // Effects after hooks
  useEffect(() => {
    // ...
  }, []);

  // Event handlers
  const handleStart = () => {
    // ...
  };

  // Render
  return (
    <AppLayout>
      {/* JSX */}
    </AppLayout>
  );
}
```

### TypeScript Conventions

```typescript
// ALWAYS use explicit types for function parameters
function calculateAccuracy(expected: number, detected: number): number {
  // ...
}

// PREFER interfaces over types for object shapes
interface Exercise {
  id: string;
  title: string;
  // ...
}

// USE type for unions and intersections
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
type PatternNote = [string: number, fretOffset: number];

// EXPORT types from shared/types.ts for cross-boundary usage
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Import Order

```typescript
// 1. React & React ecosystem
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

// 3. Internal UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal hooks & utilities
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { cn } from '@/lib/utils';

// 5. Types (always with 'type' keyword)
import type { Exercise, PracticeSession } from '@shared/types';
```

### Styling Conventions

```typescript
// USE Tailwind utility classes (preferred)
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">

// USE cn() for conditional classes
import { cn } from '@/lib/utils';

<Button className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)}>

// AVOID inline styles unless dynamic values required
<div style={{ width: `${progress}%` }}>

// USE CSS variables for theming (defined in tailwind.config.js)
bg-background    // --background
text-foreground  // --foreground
border-border    // --border
```

### ESLint Rules (Important)

```javascript
// Enforced rules (will error on violation):

// 1. React Hooks rules
"react-hooks/rules-of-hooks": "error"        // Hooks only in components/hooks
"react-hooks/exhaustive-deps": "error"       // Complete dependency arrays

// 2. Prevent infinite render loops
// State setters NOT allowed in render body
// ❌ BAD:
function Component() {
  const [state, setState] = useState(0);
  setState(1); // ERROR: Infinite loop!
  return <div />;
}

// ✅ GOOD:
function Component() {
  const [state, setState] = useState(0);

  const handleClick = () => {
    setState(1); // OK: In event handler
  };

  useEffect(() => {
    setState(1); // OK: In effect
  }, []);

  return <button onClick={handleClick} />;
}

// 3. Component exports (React Fast Refresh)
// Only components or constants allowed at root level
export function MyComponent() {} // ✅
export const CONSTANT = 10;      // ✅
export function utilityFn() {}   // ❌ (except in ui/ folder)

// 4. Import validation
"import/no-unresolved": "error"  // Catch broken imports
"import/named": "error"          // Catch invalid named imports
```

---

## Common Patterns

### Pattern 1: Fetching Data with TanStack Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

function ExerciseList() {
  // GET request
  const { data, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiClient.get<Exercise[]>('/api/exercises'),
  });

  // POST request with optimistic update
  const mutation = useMutation({
    mutationFn: (newExercise: Exercise) =>
      apiClient.post('/api/exercises', newExercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(exercise => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}
```

### Pattern 2: Audio Analysis Hook

```typescript
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { useAudioEngine } from '@/hooks/use-audio-engine';

function PracticeSession() {
  // 1. Initialize audio engine
  const {
    analyser,      // AnalyserNode
    audioContext,  // AudioContext
    isActive,      // Boolean
    start,         // Function
    stop           // Function
  } = useAudioEngine();

  // 2. Start audio analysis
  const {
    pitch,          // number | null (Hz)
    note,           // string | null (e.g., "E2", "A3")
    bpm,            // number | null
    confidence,     // number (0-1)
    detectedNotes,  // Array<{ note, timestamp, confidence }>
    calculateAccuracy, // Function
    reset           // Function
  } = useAudioAnalysis(analyser, audioContext, isActive);

  // 3. Control audio
  const handleStart = async () => {
    await start(); // Requests mic permission
  };

  return (
    <div>
      <Button onClick={handleStart}>Start Practice</Button>
      <p>Current Note: {note || 'Silence'}</p>
      <p>Tempo: {bpm || 'Detecting...'} BPM</p>
      <p>Detected Notes: {detectedNotes.length}</p>
    </div>
  );
}
```

### Pattern 3: Moveable Exercise Pattern

```typescript
import { generateTablature } from '@shared/pattern-utils';
import type { Exercise, PatternNote, DrillConfig } from '@shared/types';

// Exercise definition with pattern
const exercise: Exercise = {
  id: 'spider-walk',
  title: 'Spider Walk',
  moveable: true,  // Can be played at different positions

  // Pattern: [string, fretOffset] pairs
  pattern: [
    [6, 0], [6, 1], [6, 2], [6, 3],  // Low E string: index-middle-ring-pinky
    [5, 0], [5, 1], [5, 2], [5, 3],  // A string
    // ... continues for all strings
  ] as PatternNote[],

  defaultPosition: 1,  // Start at 1st fret

  // Drill mode: Move up the neck
  drill: {
    direction: 'ascending',      // String order stays same
    startPosition: 1,            // Start at 1st fret
    endPosition: 12,             // End at 12th fret
    positionIncrement: 1,        // Move 1 fret per cycle
    repetitionsPerPosition: 1    // Play once per position
  }
};

// Generate tablature for specific position
const tablature = generateTablature(
  exercise.pattern!,
  5  // Play at 5th position
);

// Result: Tab with actual fret numbers
// e|-5-6-7-8-|
// B|-5-6-7-8-|
// G|-5-6-7-8-|
// D|-5-6-7-8-|
// A|-5-6-7-8-|
// E|-5-6-7-8-|
```

### Pattern 4: Error Boundary Usage

```typescript
// Automatic for all routes (configured in App.tsx)
<Route
  path="/practice/:id"
  element={<PracticePage />}
  errorElement={<RouteErrorBoundary />}
/>

// Manual for specific components
import { ErrorBoundary } from '@/components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Pattern 5: Durable Object CRUD

```typescript
// worker/user-routes.ts
import { ExerciseEntity } from './entities';

export function exerciseRoutes(app: Hono) {
  // LIST all
  app.get('/api/exercises', async (c) => {
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const exercises = await ExerciseEntity.listAll(db);
    return c.json({ success: true, data: exercises });
  });

  // GET one
  app.get('/api/exercises/:id', async (c) => {
    const { id } = c.req.param();
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const entity = ExerciseEntity.create(db, id);
    const exercise = await entity.getState();
    return c.json({ success: true, data: exercise });
  });

  // CREATE
  app.post('/api/exercises', async (c) => {
    const newExercise = await c.req.json<Exercise>();
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const entity = ExerciseEntity.create(db, newExercise.id);
    await entity.mutate(() => newExercise);
    return c.json({ success: true, data: newExercise });
  });

  // UPDATE
  app.patch('/api/exercises/:id', async (c) => {
    const { id } = c.req.param();
    const updates = await c.req.json();
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const entity = ExerciseEntity.create(db, id);
    await entity.mutate(state => ({ ...state, ...updates }));
    const updated = await entity.getState();
    return c.json({ success: true, data: updated });
  });

  // DELETE
  app.delete('/api/exercises/:id', async (c) => {
    const { id } = c.req.param();
    const db = c.env.GLOBAL_DB as DurableObjectStub;
    const entity = ExerciseEntity.create(db, id);
    await entity.delete();
    return c.json({ success: true });
  });
}
```

---

## Key Files Reference

### Critical Files (Must Read Before Editing)

| File | Lines | Purpose | Notes |
|------|-------|---------|-------|
| `/src/pages/PracticePage.tsx` | ~600 | Main practice interface | Complex state, audio integration |
| `/src/lib/errorReporter.ts` | ~800 | Global error tracking | DO NOT modify without review |
| `/worker/core-utils.ts` | ~500 | Base entity class | Handles all storage logic |
| `/worker/index.ts` | ~200 | Hono server entry | Hot-reload & route loading |
| `/vite.config.ts` | ~150 | Build configuration | Comment: "STRICTLY forbidden" to change |
| `/shared/types.ts` | ~400 | TypeScript interfaces | Shared between frontend/backend |

### Configuration Files

| File | Purpose |
|------|---------|
| `/package.json` | Dependencies & scripts |
| `/tsconfig.json` | TypeScript compiler options |
| `/tailwind.config.js` | Theme, colors, animations |
| `/eslint.config.js` | Linting rules |
| `/wrangler.jsonc` | Cloudflare Workers deployment |
| `/components.json` | shadcn/ui configuration |
| `/public/manifest.json` | PWA metadata |

### Entry Points

| File | Purpose |
|------|---------|
| `/index.html` | HTML entry (PWA meta tags) |
| `/src/main.tsx` | Frontend entry (React + SW) |
| `/worker/index.ts` | Backend entry (Hono server) |
| `/public/sw.js` | Service worker entry |

---

## API Endpoints

### Current Endpoints

```typescript
// Health
GET  /api/health                      → { success: true }

// Exercises
GET  /api/exercises                   → Exercise[]
GET  /api/exercises/:id               → Exercise

// User Profile
GET  /api/user/profile                → User (with skillProfile)
POST /api/user/assessment             → User (updated skills)
     Body: { skillProfile: SkillProfile }

// Practice Sessions
GET  /api/sessions                    → PracticeSession[]
     Query: ?limit=10&cursor=abc
POST /api/sessions                    → PracticeSession
     Body: { exerciseId, duration, accuracy, achievedBpm }

// Roadmaps
GET  /api/roadmaps                    → Roadmap[]

// Error Reporting
POST /api/client-errors               → { success: true }
     Body: { message, stack, url, timestamp, category }

// Legacy Demo Endpoints (from template)
GET  /api/users                       → User[]
POST /api/users                       → User
DELETE /api/users/:id                 → { success: true }
POST /api/users/deleteMany            → { success: true }
     Body: { ids: string[] }
```

### Response Format

```typescript
// All responses use ApiResponse wrapper
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example
{
  "success": true,
  "data": {
    "id": "ex1",
    "title": "Spider Walk",
    // ...
  }
}

// Error example
{
  "success": false,
  "error": "Exercise not found"
}
```

---

## Audio Analysis System

### Current Implementation: Tier 3 (DSP-Based)

**Status:** Production-ready
**Documentation:** See `/AUDIO-ANALYSIS.md` for full details

#### Core Capabilities

| Feature | Algorithm | Performance |
|---------|-----------|-------------|
| **Pitch Detection** | YIN | ±10 cents, ~100ms latency |
| **BPM Detection** | Onset-based | ±5 BPM |
| **Note Tracking** | RMS threshold | Real-time, 10 FPS |
| **Accuracy Calc** | Frequency matching | ±50 cents tolerance |

#### Usage Pattern

```typescript
// 1. Import hooks
import { useAudioAnalysis } from '@/hooks/use-audio-analysis';
import { useAudioEngine } from '@/hooks/use-audio-engine';

// 2. Initialize in component
const { analyser, audioContext, isActive, start } = useAudioEngine();
const { pitch, note, bpm, detectedNotes } = useAudioAnalysis(
  analyser,
  audioContext,
  isActive
);

// 3. Start analysis
await start(); // Requests microphone permission

// 4. Monitor results
console.log(`Playing: ${note}, Tempo: ${bpm} BPM`);
```

#### Key Constraints

- **Sample Rate:** 44100 Hz (standard)
- **FFT Size:** 2048 samples
- **Update Rate:** 10 FPS (100ms intervals)
- **Frequency Range:** 60-2000 Hz (guitar range)
- **CPU Usage:** ~5-10%
- **Bundle Size:** ~50KB (pitchfinder + @tonaljs/tonal)

#### Future Tiers (Infrastructure Ready)

- **Tier 2:** WebGL + TensorFlow.js Lite (~95% accuracy, ~30ms latency)
- **Tier 1:** WebGPU + Full TensorFlow.js (~98% accuracy, ~10ms latency)
- **Tier 0:** Replicate API for post-session analysis (cloud-based)

---

## PWA Features

**Status:** Production-ready
**Documentation:** See `/PWA-IMPLEMENTATION.md` for full details

### Implemented Features

✅ **Core PWA**
- Web App Manifest with metadata
- Service Worker with intelligent caching
- Offline support for static assets
- Install prompt (dismissible, localStorage-based)
- Standalone mode (native app feel)

✅ **Mobile Optimization**
- Theme color (#8b5cf6 purple)
- Apple touch icon support
- Splash screen metadata
- Portrait orientation lock
- Status bar styling

✅ **Advanced Features**
- App shortcuts (Practice, Progress)
- Share target API infrastructure
- Push notifications infrastructure
- Background sync preparation

### Service Worker Caching Strategy

```javascript
// API Calls: Network first → Cache fallback
if (url.pathname.startsWith('/api/')) {
  return fetch(event.request)
    .catch(() => caches.match(event.request));
}

// Static Assets: Cache first → Network fallback
return caches.match(event.request)
  .then(response => response || fetch(event.request));
```

### Testing PWA

```bash
# 1. Build for production
bun run build

# 2. Preview locally
bun run preview

# 3. Check PWA in Chrome DevTools
# - Application → Manifest
# - Application → Service Workers
# - Lighthouse → PWA audit

# 4. Deploy and test on mobile
bun run deploy
```

---

## Testing Guidelines

### Current Testing Approach

**Manual Testing:** Primary method
- Browser DevTools for debugging
- Mobile device testing for PWA features
- Audio testing with real guitar input

**Automated Testing:** Not yet configured
- ESLint catches common errors
- TypeScript prevents type errors
- Error reporting catches runtime issues

### Recommended Testing Patterns

```typescript
// Unit tests (future implementation)
import { DSPAnalyzer } from '@/lib/ml/dsp-analyzer';

describe('DSPAnalyzer', () => {
  it('detects pitch from synthetic audio', async () => {
    const analyzer = new DSPAnalyzer(44100);
    const frequency = 440; // A4
    const buffer = generateSineWave(frequency, 44100);

    const detected = await analyzer.detectPitch(buffer);
    expect(detected).toBeCloseTo(frequency, 1);
  });
});

// Integration tests (future)
describe('Practice Session', () => {
  it('saves session to backend', async () => {
    const session = { exerciseId: 'ex1', duration: 300, accuracy: 85 };
    const response = await apiClient.post('/api/sessions', session);
    expect(response.success).toBe(true);
  });
});
```

### Manual Testing Checklist

**Before Each Commit:**
- [ ] Run `bun run lint` (no errors)
- [ ] Check browser console (no errors)
- [ ] Test audio functionality (mic permission, pitch detection)
- [ ] Verify PWA install prompt appears
- [ ] Test offline mode (Service Worker active)

**Before Deployment:**
- [ ] Run `bun run build` successfully
- [ ] Preview build with `bun run preview`
- [ ] Test on mobile device (iOS & Android if possible)
- [ ] Lighthouse PWA audit score > 90
- [ ] Verify all API endpoints return expected data

---

## Deployment Process

### Prerequisites

- [Bun](https://bun.sh/) v1.1+ installed
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI authenticated
- Cloudflare account with Workers enabled

### Deployment Steps

```bash
# 1. Build frontend assets
bun run build
# Output: /dist folder

# 2. Deploy to Cloudflare Workers (includes build)
bun run deploy
# Equivalent to: bun run build && wrangler deploy

# 3. Verify deployment
# Visit: https://guitar-coach-pwa-fretflow.alexandergillie.workers.dev
# Or custom domain: https://fretflow.alexandergillie.com
```

### Wrangler Configuration

**File:** `/wrangler.jsonc`

```jsonc
{
  "name": "guitar-coach-pwa-fretflow",
  "main": "worker/index.ts",
  "compatibility_date": "2025-01-20",

  // Custom domain
  "routes": [
    { "pattern": "fretflow.alexandergillie.com", "custom_domain": true }
  ],

  // Observability
  "observability": {
    "enabled": true,
    "logs": { "enabled": true },
    "head_sampling_rate": 1
  },

  // Durable Objects
  "durable_objects": {
    "bindings": [{
      "name": "GLOBAL_DB",
      "class_name": "GlobalDurableObject",
      "script_name": "guitar-coach-pwa-fretflow"
    }]
  },

  // SQLite migration
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["GlobalDurableObject"] }
  ]
}
```

### Post-Deployment Verification

```bash
# 1. Check health endpoint
curl https://fretflow.alexandergillie.com/api/health

# 2. Verify exercises load
curl https://fretflow.alexandergillie.com/api/exercises

# 3. Test PWA manifest
curl https://fretflow.alexandergillie.com/manifest.json

# 4. Check Cloudflare dashboard
# - Workers & Pages → guitar-coach-pwa-fretflow
# - Analytics → Requests, Errors, Latency
# - Logs → Real-time logs
```

### Rollback Procedure

```bash
# List recent deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback [DEPLOYMENT_ID]
```

---

## AI Assistant Guidelines

### When Working with This Codebase

#### DO:

1. **Read Before Editing**
   - Always read files before modifying them
   - Check related files to understand context
   - Review `/AUDIO-ANALYSIS.md` for audio features
   - Review `/PWA-IMPLEMENTATION.md` for PWA features

2. **Follow Patterns**
   - Use TanStack Query for server state
   - Use React hooks for local state
   - Extend `IndexedEntity` for new backend entities
   - Use shadcn/ui components for UI (not custom HTML)
   - Follow established naming conventions

3. **Maintain Type Safety**
   - Add types to `shared/types.ts` for cross-boundary interfaces
   - Use explicit types for function parameters
   - Export types with `type` keyword in imports

4. **Test Changes**
   - Run `bun run lint` after editing
   - Test in browser (especially audio features)
   - Verify PWA functionality still works
   - Check mobile responsiveness

5. **Error Handling**
   - Use ErrorBoundary for component errors
   - Let errorReporter catch runtime errors
   - Add validation for user inputs
   - Return proper ApiResponse from backend

6. **Performance**
   - Keep audio analysis at 10 FPS (100ms)
   - Use React.memo for expensive components
   - Optimize images and assets
   - Lazy load heavy dependencies

#### DON'T:

1. **Break Existing Functionality**
   - Don't modify `/vite.config.ts` (marked as forbidden)
   - Don't change audio analysis algorithms without testing
   - Don't break PWA service worker caching
   - Don't remove error reporting functionality

2. **Violate Conventions**
   - Don't use `var` (use `const`/`let`)
   - Don't call state setters in render body (infinite loop)
   - Don't skip dependency arrays in hooks
   - Don't mix styling approaches (stick to Tailwind)

3. **Add Unnecessary Dependencies**
   - Don't install large libraries without justification
   - Don't add CSS frameworks (Tailwind is sufficient)
   - Don't duplicate existing functionality
   - Don't add testing frameworks yet (manual testing first)

4. **Ignore Mobile Users**
   - Don't break responsive design
   - Don't increase bundle size unnecessarily
   - Don't add features that don't work offline
   - Don't ignore PWA requirements

5. **Bypass Type Safety**
   - Don't use `any` excessively
   - Don't skip TypeScript errors with `@ts-ignore`
   - Don't use untyped API responses
   - Don't mix typed and untyped code

### Common Tasks Guide

#### Adding a New Page

```typescript
// 1. Create page component
// src/pages/MyNewPage.tsx
import { AppLayout } from '@/components/layout/AppLayout';

export function MyNewPage() {
  return (
    <AppLayout>
      <h1>My New Page</h1>
    </AppLayout>
  );
}

// 2. Add route in src/App.tsx
import { MyNewPage } from './pages/MyNewPage';

<Route path="/my-new-page" element={<MyNewPage />} />

// 3. Add to sidebar (src/components/app-sidebar.tsx)
{
  title: 'My New Page',
  url: '/my-new-page',
  icon: Music,
}
```

#### Adding a New API Endpoint

```typescript
// 1. Define type in shared/types.ts
export interface MyEntity {
  id: string;
  name: string;
}

// 2. Create entity in worker/entities.ts
export class MyEntity extends IndexedEntity<MyEntity> {
  static readonly entityName = "my-entity";
  static readonly indexName = "my-entities";
  static readonly initialState: MyEntity = { id: "", name: "" };
}

// 3. Add route in worker/user-routes.ts
app.get('/api/my-entities', async (c) => {
  const db = c.env.GLOBAL_DB as DurableObjectStub;
  const entities = await MyEntity.listAll(db);
  return c.json({ success: true, data: entities });
});

// 4. Use in frontend with TanStack Query
const { data } = useQuery({
  queryKey: ['my-entities'],
  queryFn: () => apiClient.get<MyEntity[]>('/api/my-entities'),
});
```

#### Adding a New shadcn/ui Component

```bash
# 1. Find component name at https://ui.shadcn.com/
# 2. Run CLI command
npx shadcn@latest add <component-name>

# 3. Import in your component
import { ComponentName } from '@/components/ui/component-name';
```

#### Debugging Audio Issues

```typescript
// 1. Check microphone permission
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Mic access granted'))
  .catch(err => console.error('Mic access denied:', err));

// 2. Verify audio context state
console.log('AudioContext state:', audioContext.state);
// Should be 'running', not 'suspended'

// 3. Check analyser node
console.log('Analyser connected:', analyser !== null);

// 4. Monitor pitch detection
useEffect(() => {
  console.log('Pitch:', pitch, 'Note:', note);
}, [pitch, note]);

// 5. Check browser console for errors
// Look for: "NotAllowedError: Permission denied"
```

### Code Review Checklist

Before submitting changes, verify:

- [ ] **TypeScript:** No type errors (`bun run lint`)
- [ ] **ESLint:** No linting errors
- [ ] **Imports:** All imports resolve correctly
- [ ] **Naming:** Follows established conventions
- [ ] **Patterns:** Uses existing patterns (TanStack Query, etc.)
- [ ] **Types:** Added to `shared/types.ts` if needed
- [ ] **Error Handling:** Errors are caught and reported
- [ ] **Mobile:** Responsive design maintained
- [ ] **PWA:** Service worker still functions
- [ ] **Audio:** Audio features still work (if touched)
- [ ] **Performance:** No unnecessary re-renders or heavy computations

---

## Additional Resources

### Documentation Files

- `/README.md` - Project setup and quick start
- `/AUDIO-ANALYSIS.md` - Deep dive into audio system
- `/PWA-IMPLEMENTATION.md` - PWA features and testing

### External Documentation

- [React 18 Docs](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Hono](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [PWA Docs](https://web.dev/progressive-web-apps/)

### Key Concepts

- **Moveable Exercises:** Pattern-based exercises playable at any fret position
- **Drill Mode:** Progressive practice across multiple fret positions
- **Durable Objects:** Persistent, stateful storage with ACID transactions
- **YIN Algorithm:** Pitch detection using autocorrelation
- **Service Worker:** Offline caching and PWA functionality
- **TanStack Query:** Server state management with caching and optimistic updates

---

## Changelog

### January 22, 2026
- Initial CLAUDE.md creation
- Comprehensive documentation of codebase structure
- Added AI assistant guidelines
- Documented all major patterns and conventions

---

**For questions or clarifications, refer to:**
- Primary documentation: `/README.md`, `/AUDIO-ANALYSIS.md`, `/PWA-IMPLEMENTATION.md`
- Source code comments (especially in `worker/core-utils.ts`, `src/lib/errorReporter.ts`)
- Type definitions: `shared/types.ts`

**Last Updated:** January 22, 2026
