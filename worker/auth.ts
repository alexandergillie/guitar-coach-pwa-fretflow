import type { Context } from 'hono';
import type { Env } from './core-utils';
import { createClerkClient } from '@clerk/backend';

type AuthEnv = Env & { CLERK_SECRET_KEY?: string };

/**
 * Extracts and verifies the authenticated user ID from the request.
 *
 * - If CLERK_SECRET_KEY is configured: verifies the Bearer JWT via Clerk.
 * - If not configured (local dev): falls back to 'u1' so the app works
 *   without a Clerk account during development.
 *
 * Returns null if auth is configured but the token is missing/invalid.
 */
export async function getAuthUserId(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const env = c.env as AuthEnv;
  const clerkKey = env.CLERK_SECRET_KEY;

  // Dev fallback — no Clerk key means auth is not configured yet
  if (!clerkKey) return 'u1';

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const clerk = createClerkClient({ secretKey: clerkKey });
    const payload = await clerk.verifyToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}
