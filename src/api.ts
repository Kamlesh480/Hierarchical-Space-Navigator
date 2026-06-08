import type { Site, Space, Stream } from './types';

const BASE = 'http://localhost:4001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const fetchSites = (): Promise<Site[]> => request('/sites');

export const fetchSpaces = (siteId: string): Promise<Space[]> =>
  request(`/spaces?siteId=${siteId}`);

export const addStream = (spaceId: number, name: string): Promise<Stream> =>
  request('/streams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spaceId, name }),
  });

export const deleteStream = (streamId: number): Promise<void> =>
  request(`/streams/${streamId}`, { method: 'DELETE' });
