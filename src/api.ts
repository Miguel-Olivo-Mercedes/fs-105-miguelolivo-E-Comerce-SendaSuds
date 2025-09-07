// /src/api.ts
/// <reference types="vite/client" />

// Detecta Codespaces: mapea 5173 -> 5000 para hablar con el back
function detectOrigin(): string {
  if (typeof location === 'undefined') return '';
  const h = location.hostname;
  if (h.endsWith('app.github.dev')) {
    // https://<codespace>-5173.app.github.dev  ->  https://<codespace>-5000.app.github.dev
    return location.origin.replace('-5173.', '-5000.');
  }
  return location.origin;
}

const ENV_ORIGIN = (import.meta.env?.VITE_API_ORIGIN ?? '').trim();
const ENV_BASE   = (import.meta.env?.VITE_API_BASE   ?? '').trim();

export const API_ORIGIN = ENV_ORIGIN || detectOrigin() || '';
export const API_BASE   = ENV_BASE   || (API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, '')}/api` : '/api');

// Pequeño helper de fetch con JSON y manejo de errores
export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${txt}`.trim());
  }
  return res.json();
}

// Atajos CRUD
export const api = {
  get : (p: string, init?: RequestInit) => apiFetch(p, { ...init, method: 'GET' }),
  post: (p: string, body?: any, init?: RequestInit) =>
    apiFetch(p, { ...init, method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) },
      body: JSON.stringify(body ?? {}) }),
  put : (p: string, body?: any, init?: RequestInit) =>
    apiFetch(p, { ...init, method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) },
      body: JSON.stringify(body ?? {}) }),
  del : (p: string, init?: RequestInit) => apiFetch(p, { ...init, method: 'DELETE' }),
};
