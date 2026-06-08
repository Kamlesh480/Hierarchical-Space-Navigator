import type { Site, Space, Stream } from './types';

const BASE = 'https://interviews.ambient.ai/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function toArray<T>(data: unknown, keys = ['data', 'sites', 'spaces', 'results', 'items']): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
}

export const fetchSites = async (): Promise<Site[]> => {
  const data = await request<unknown>('/sites');
  return toArray<Site>(data, ['sites', 'data', 'results']);
};

export const fetchSpaces = async (siteId: string): Promise<Space[]> => {
  const data = await request<unknown>(`/spaces?siteId=${siteId}`);

  // Log raw shape once so we can verify field names in the console
  console.log('[fetchSpaces] raw:', JSON.stringify(data).slice(0, 600));

  // Unwrap until we reach actual Space objects (handle up to 2 levels of wrapping)
  function unwrap(val: unknown): Record<string, unknown>[] {
    if (Array.isArray(val)) {
      // If elements are group objects { spaces: [...] }, flatten one more level
      if (val.length > 0 && val[0] != null && 'spaces' in (val[0] as object)) {
        return (val as { spaces: Record<string, unknown>[] }[]).flatMap((g) => g.spaces ?? []);
      }
      return val as Record<string, unknown>[];
    }
    if (val && typeof val === 'object') {
      for (const key of ['spaces', 'data', 'results']) {
        const v = (val as Record<string, unknown>)[key];
        if (v != null) return unwrap(v);
      }
    }
    return [];
  }

  let items = unwrap(data);

  return items.map((sp) => {
    const id = (sp.id ?? sp.spaceId) as number;
    // Handle camelCase and snake_case parent references
    const parentSpaceId = (
      sp.parentSpaceId ?? sp.parent_space_id ?? sp.parentId ?? null
    ) as number | null;
    const rawStreams = (sp.streams ?? []) as Record<string, unknown>[];

    return {
      id,
      name: sp.name as string,
      parentSpaceId,
      streams: rawStreams.map((s) => ({
        id:      (s.id ?? s.streamId) as number,
        name:    s.name as string,
        spaceId: (s.spaceId ?? s.space_id ?? id) as number,
      })),
    };
  });
};

export const addStream = (spaceId: number, name: string): Promise<Stream> =>
  request('/streams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spaceId, name }),
  });

export const deleteStream = (streamId: number): Promise<void> =>
  request(`/streams/${streamId}`, { method: 'DELETE' });
