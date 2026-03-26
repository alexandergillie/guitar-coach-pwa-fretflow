import { ApiResponse } from "../../shared/types"

// Injected by AuthSync component when Clerk is present
let _getToken: (() => Promise<string | null>) | null = null;

export function configureAuth(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { headers, ...init })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) throw new Error(json.error || 'Request failed')
  return json.data
}
