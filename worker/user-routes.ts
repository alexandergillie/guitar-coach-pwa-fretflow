import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ExerciseEntity, RoadmapEntity, PracticeSessionEntity } from "./entities";
import { ok, bad, notFound, Index } from './core-utils';
import type { SkillProfile, PracticeSession } from "@shared/types";
import { SEED_ROADMAPS } from "@shared/mock-data";
import { getAuthUserId } from './auth';

/**
 * Ensures a user profile exists for the given userId, creating it if new.
 */
async function ensureUser(env: Env, userId: string) {
  const user = new UserEntity(env, userId);
  if (!await user.exists()) {
    await UserEntity.create(env, { id: userId, streak: 0 });
  }
  return user;
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // EXERCISES
  app.get('/api/exercises', async (c) => {
    await ExerciseEntity.ensureSeed(c.env);
    const page = await ExerciseEntity.list(c.env);
    return ok(c, page.items);
  });
  app.get('/api/exercises/:id', async (c) => {
    const entity = new ExerciseEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c);
    return ok(c, await entity.getState());
  });

  // USER PREFS (KV — fast edge reads for name + theme)
  app.get('/api/user/prefs', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const raw = await c.env.USER_PREFS.get(`prefs:${userId}`);
    const prefs = raw ? JSON.parse(raw) : {};
    return ok(c, prefs);
  });

  app.put('/api/user/prefs', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const updates = await c.req.json<{ name?: string; theme?: string }>();
    const raw = await c.env.USER_PREFS.get(`prefs:${userId}`);
    const current = raw ? JSON.parse(raw) : {};
    const next = { ...current, ...updates };
    await c.env.USER_PREFS.put(`prefs:${userId}`, JSON.stringify(next));
    return ok(c, next);
  });

  // USER PROFILE
  app.get('/api/user/profile', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const name = c.req.query('name') || undefined;
    const user = await ensureUser(c.env, userId);
    // Keep KV prefs in sync when a real name is available from SSO
    if (name) {
      const raw = await c.env.USER_PREFS.get(`prefs:${userId}`);
      const prefs = raw ? JSON.parse(raw) : {};
      if (!prefs.name) {
        await c.env.USER_PREFS.put(`prefs:${userId}`, JSON.stringify({ ...prefs, name }));
      }
    }
    return ok(c, await user.getState());
  });

  app.post('/api/user/assessment', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const { skillProfile, goals } = (await c.req.json()) as { skillProfile: SkillProfile; goals?: string[] };
    if (!skillProfile) return bad(c, 'skillProfile required');
    const user = await ensureUser(c.env, userId);
    await user.patch({ skillProfile, ...(goals ? { goals } : {}) });
    return ok(c, await user.getState());
  });

  // SESSIONS
  app.post('/api/sessions', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const sessionData = (await c.req.json()) as Omit<PracticeSession, 'userId' | 'id' | 'timestamp'>;
    const session = await PracticeSessionEntity.create(c.env, {
      ...sessionData,
      userId,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    // Also index the session under the user's own index for efficient per-user listing
    const userSessionIdx = new Index<string>(c.env, `sessions:${userId}`);
    await userSessionIdx.add(session.id);
    // Update streak
    const user = await ensureUser(c.env, userId);
    const userData = await user.getState();
    const now = Date.now();
    const last = userData.lastPracticeAt || 0;
    const isNextDay = (now - last) > 86400000 && (now - last) < 172800000;
    await user.patch({
      lastPracticeAt: now,
      streak: isNextDay ? (userData.streak + 1) : (userData.lastPracticeAt ? userData.streak : 1),
    });
    return ok(c, session);
  });

  app.get('/api/sessions', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    // Read from per-user index — no full scan, no cross-user data leakage
    const userSessionIdx = new Index<string>(c.env, `sessions:${userId}`);
    const ids = await userSessionIdx.list();
    const sessions = await Promise.all(
      ids.map(id => new PracticeSessionEntity(c.env, id).getState())
    );
    // Sort newest first
    sessions.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, sessions);
  });

  // ASSESSMENT RECORDINGS
  app.post('/api/assessments/recordings', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const body = await c.req.json();
    const key = `${userId}/${Date.now()}.json`;
    await c.env.ASSESSMENT_RECORDINGS.put(key, JSON.stringify(body), {
      httpMetadata: { contentType: 'application/json' },
    });
    return ok(c, { key });
  });

  // ROADMAPS
  app.get('/api/roadmaps', async (c) => {
    await RoadmapEntity.ensureSeed(c.env);
    const page = await RoadmapEntity.list(c.env);
    if (page.items.length > 0 && !('weeks' in page.items[0])) {
      await RoadmapEntity.deleteMany(c.env, page.items.map(r => r.id));
      await Promise.all(SEED_ROADMAPS.map(s => RoadmapEntity.create(c.env, s)));
      const fresh = await RoadmapEntity.list(c.env);
      return ok(c, fresh.items);
    }
    return ok(c, page.items);
  });

  app.post('/api/roadmaps/:id/start', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const roadmapId = c.req.param('id');
    const user = await ensureUser(c.env, userId);
    const userData = await user.getState();
    const progress = { ...(userData.roadmapProgress || {}), [roadmapId]: 0 };
    await user.patch({ activeRoadmapId: roadmapId, roadmapProgress: progress });
    return ok(c, await user.getState());
  });

  app.post('/api/roadmaps/:id/week/complete', async (c) => {
    const userId = await getAuthUserId(c);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const roadmapId = c.req.param('id');
    const user = await ensureUser(c.env, userId);
    const userData = await user.getState();
    const current = userData.roadmapProgress?.[roadmapId] ?? 0;
    const progress = { ...(userData.roadmapProgress || {}), [roadmapId]: current + 1 };
    await user.patch({ roadmapProgress: progress });
    return ok(c, await user.getState());
  });
}
