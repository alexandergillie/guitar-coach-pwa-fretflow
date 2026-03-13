import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ExerciseEntity, RoadmapEntity, PracticeSessionEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { SkillProfile, PracticeSession } from "@shared/types";
import { SEED_ROADMAPS } from "@shared/mock-data";
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
  // USER PROFILE
  app.get('/api/user/profile', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const user = new UserEntity(c.env, 'u1');
    return ok(c, await user.getState());
  });
  app.post('/api/user/assessment', async (c) => {
    const { skillProfile } = (await c.req.json()) as { skillProfile: SkillProfile };
    if (!skillProfile) return bad(c, 'skillProfile required');
    const user = new UserEntity(c.env, 'u1');
    await user.patch({ skillProfile });
    return ok(c, await user.getState());
  });
  // SESSIONS
  app.post('/api/sessions', async (c) => {
    const sessionData = (await c.req.json()) as PracticeSession;
    const session = await PracticeSessionEntity.create(c.env, {
      ...sessionData,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    // Update user streak/lastPractice
    const user = new UserEntity(c.env, session.userId);
    const userData = await user.getState();
    const now = Date.now();
    const lastPractice = userData.lastPracticeAt || 0;
    const isNextDay = (now - lastPractice) > 86400000 && (now - lastPractice) < 172800000;
    await user.patch({
      lastPracticeAt: now,
      streak: isNextDay ? (userData.streak + 1) : (userData.lastPracticeAt ? userData.streak : 1)
    });
    return ok(c, session);
  });
  app.get('/api/sessions', async (c) => {
    const page = await PracticeSessionEntity.list(c.env);
    return ok(c, page.items);
  });
  // ROADMAPS
  app.get('/api/roadmaps', async (c) => {
    await RoadmapEntity.ensureSeed(c.env);
    const page = await RoadmapEntity.list(c.env);
    // Re-seed if stored data is the old format (no `weeks` field)
    if (page.items.length > 0 && !('weeks' in page.items[0])) {
      await RoadmapEntity.deleteMany(c.env, page.items.map(r => r.id));
      await Promise.all(SEED_ROADMAPS.map(s => RoadmapEntity.create(c.env, s)));
      const fresh = await RoadmapEntity.list(c.env);
      return ok(c, fresh.items);
    }
    return ok(c, page.items);
  });
}