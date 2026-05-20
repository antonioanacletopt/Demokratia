/**
 * db-client.ts — Client-side fetch wrappers for the /api/data REST layer.
 * Replaces all direct Firestore SDK calls in client components.
 *
 * Usage:
 *   import { dbAdd, dbSet, dbUpdate, dbDelete, dbGet, dbGetAll } from '@/lib/db-client';
 */

export type WithId<T> = T & { id: string };

export interface ClientQueryParams {
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
  userId?: string;
  where?: Array<[string, '==' | '!=' | '>' | '<' | '>=' | '<=', unknown]>;
}

// Current timestamp as a number (replaces Firestore serverTimestamp())
export function nowTs(): number {
  return Date.now();
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch all documents in a collection with optional filters. */
export async function dbGetAll<T>(
  collection: string,
  params: ClientQueryParams = {},
): Promise<WithId<T>[]> {
  const url = new URL(`/api/data/${encodeURIComponent(collection)}`, window.location.origin);

  if (params.orderBy) url.searchParams.set('orderBy', params.orderBy);
  if (params.orderDir) url.searchParams.set('orderDir', params.orderDir);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.userId) url.searchParams.set('userId', params.userId);
  if (params.where) {
    for (const [field, op, value] of params.where) {
      url.searchParams.append('where', `${field},${op},${value}`);
    }
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`dbGetAll(${collection}) failed: ${res.status}`);
  const json = await res.json() as { data: WithId<T>[] };
  return json.data;
}

/** Fetch a single document by collection + id. */
export async function dbGet<T>(collection: string, id: string): Promise<WithId<T> | null> {
  const res = await fetch(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`dbGet(${collection}/${id}) failed: ${res.status}`);
  const json = await res.json() as { data: WithId<T> };
  return json.data;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/** Insert a new document. Returns the generated or provided id. */
export async function dbAdd(
  collection: string,
  data: Record<string, unknown>,
): Promise<string> {
  const res = await fetch(`/api/data/${encodeURIComponent(collection)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, createdAt: nowTs() }),
  });
  if (!res.ok) throw new Error(`dbAdd(${collection}) failed: ${res.status}`);
  const json = await res.json() as { id: string };
  return json.id;
}

/** Set (upsert) a document — replaces the entire data blob. */
export async function dbSet(
  collection: string,
  id: string,
  data: Record<string, unknown>,
  merge = false,
): Promise<void> {
  const method = merge ? 'PATCH' : 'PUT';
  const payload = merge ? data : { ...data, updatedAt: nowTs() };
  const res = await fetch(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`dbSet(${collection}/${id}) failed: ${res.status}`);
}

/** Merge-update a document (shallow patch). */
export async function dbUpdate(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, updatedAt: nowTs() }),
  });
  if (!res.ok) throw new Error(`dbUpdate(${collection}/${id}) failed: ${res.status}`);
}

/** Delete a document. */
export async function dbDelete(collection: string, id: string): Promise<void> {
  const res = await fetch(`/api/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`dbDelete(${collection}/${id}) failed: ${res.status}`);
}

// ─── Numeric increment helper ─────────────────────────────────────────────────

/** Atomically-ish increment a numeric field (read-modify-write on client). */
export async function dbIncrement(
  collection: string,
  id: string,
  field: string,
  delta = 1,
): Promise<void> {
  const doc = await dbGet<Record<string, unknown>>(collection, id);
  const current = typeof doc?.[field] === 'number' ? (doc[field] as number) : 0;
  await dbUpdate(collection, id, { [field]: current + delta });
}

/** Add a value to an array field (deduplicates). */
export async function dbArrayUnion(
  collection: string,
  id: string,
  field: string,
  value: unknown,
): Promise<void> {
  const doc = await dbGet<Record<string, unknown>>(collection, id);
  const current = Array.isArray(doc?.[field]) ? (doc[field] as unknown[]) : [];
  if (!current.includes(value)) {
    await dbUpdate(collection, id, { [field]: [...current, value] });
  }
}

/** Remove a value from an array field. */
export async function dbArrayRemove(
  collection: string,
  id: string,
  field: string,
  value: unknown,
): Promise<void> {
  const doc = await dbGet<Record<string, unknown>>(collection, id);
  const current = Array.isArray(doc?.[field]) ? (doc[field] as unknown[]) : [];
  await dbUpdate(collection, id, { [field]: current.filter(v => v !== value) });
}
