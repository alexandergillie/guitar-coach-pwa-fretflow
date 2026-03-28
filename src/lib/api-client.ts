import { ApiResponse } from "../../shared/types"

// Injected by AuthSync component when Clerk is present
let _getToken: (() => Promise<string | null>) | null = null;
let _userName: string | null = null;

export function configureAuth(getToken: () => Promise<string | null>, userName?: string | null) {
  _getToken = getToken;
  if (userName) _userName = userName;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Append the user's real name to profile fetches so the backend can
  // seed/update the stored name from the SSO identity on first sign-in.
  let resolvedPath = path;
  if (path === '/api/user/profile' && _userName && (!init || init.method === undefined || init.method === 'GET')) {
    resolvedPath = `${path}?name=${encodeURIComponent(_userName)}`;
  }

  const res = await fetch(resolvedPath, { headers, ...init })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) throw new Error(json.error || 'Request failed')
  return json.data
}
