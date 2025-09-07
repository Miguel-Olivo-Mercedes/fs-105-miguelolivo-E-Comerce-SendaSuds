/// <reference types="vite/client" />

/**
 * Detecta el origen del backend:
 * - En Codespaces: mapea 5173 -> 5000
 * - En local: usa location.origin
 */
function detectOrigin() {
  const h = location.hostname;
  if (h.endsWith('app.github.dev')) {
    return location.origin.replace('-5173.', '-5000.');
  }
  return location.origin;
}

const ENV_ORIGIN = (import.meta.env?.VITE_API_ORIGIN || '').trim();
const ENV_BASE   = (import.meta.env?.VITE_API_BASE   || '').trim();

export const API_ORIGIN = ENV_ORIGIN || detectOrigin();
export const API_BASE   = ENV_BASE   || `${API_ORIGIN.replace(/\/$/, '')}/api`;

/**
 * Helper de fetch con JSON.
 * Uso:
 *   const products = await api.get('/products')
 *   const created  = await api.post('/cart', { productId })
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${txt ? ` - ${txt}` : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null as any;
  return res.json();
}

export const api = {
  get : (p: string, init?: RequestInit) =>
    apiFetch(p, { ...init, method: 'GET' }),

  post: (p: string, body?: any, init?: RequestInit) =>
    apiFetch(p, {
      ...init,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) },
      body: JSON.stringify(body ?? {})
    }),

  put : (p: string, body?: any, init?: RequestInit) =>
    apiFetch(p, {
      ...init,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) },
      body: JSON.stringify(body ?? {})
    }),

  del : (p: string, init?: RequestInit) =>
    apiFetch(p, { ...init, method: 'DELETE' }),
};

/** Convierte rutas relativas del backend (p.ej. "/api/static/x.jpg") a absolutas */
export function absoluteFromApi(pathOrUrl: string) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${API_ORIGIN}${pathOrUrl}`;
  return `${API_BASE.replace(/\/api$/, '')}/${pathOrUrl}`;
}
