import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ExerciseEntity, RoadmapEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { SkillProfile } from "@shared/types";
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
    // Hardcoded for demo u1
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
  // ROADMAPS
  app.get('/api/roadmaps', async (c) => {
    await RoadmapEntity.ensureSeed(c.env);
    const page = await RoadmapEntity.list(c.env);
    return ok(c, page.items);
  });
}