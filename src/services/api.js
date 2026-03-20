export const API_BASE = 'http://localhost:8081/api';

export const safeStorage = {
  get(key, fallback = '') {
    try {
      const value = localStorage.getItem(key);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};

export async function refreshSession(setAuth) {
  const refreshToken = safeStorage.get('refreshToken', '');
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', headers: { 'X-Refresh-Token': refreshToken } });
    if (!response.ok) return false;
    const data = await response.json();
    safeStorage.set('accessToken', data.accessToken);
    safeStorage.set('refreshToken', data.refreshToken);
    safeStorage.set('login', data.login);
    setAuth((prev) => ({ ...prev, authInfo: data.login, authenticated: true }));
    return true;
  } catch {
    return false;
  }
}

export function authHeaders() {
  const token = safeStorage.get('accessToken', '');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
