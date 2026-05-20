/**
 * db.ts — Server-side D1 (SQLite) helper for Cloudflare Workers / Pages.
 *
 * Uses Cloudflare bindings (DB and KV) accessed via getCloudflareContext()
 * at request time. Works with @cloudflare/next-on-pages v1+ and the
 * Cloudflare next-on-pages adapter.
 *
 * Schema: single `documents` table with generic JSON data column.
 * Field-level queries use json_extract(data, '$.field').
 */

import { nanoid } from 'nanoid';

// ─── Cloudflare context helper (lazily imported to avoid SSR issues) ──────────

type Env = {
  DB: D1Database;
  KV: KVNamespace;
};

// This file runs only inside Cloudflare Workers (server-side route handlers).
// At runtime, getRequestContext() exposes the bindings.
function getEnv(): Env {
  // Dynamic require so build tooling doesn't try to resolve it statically.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getCloudflareContext } = require('@opennextjs/cloudflare') as {
    getCloudflareContext: () => { env: Env };
  };
  return getCloudflareContext().env;
}

export type WithId<T> = T & { id: string };

export interface QueryParams {
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
  where?: Array<[string, '==' | '!=' | '>' | '<' | '>=' | '<=', unknown]>;
  userId?: string; // when set, adds a user_id filter
}

// ─── D1 / KV binding accessors ────────────────────────────────────────────────

function getDB(): D1Database {
  return getEnv().DB;
}

export function getKV(): KVNamespace {
  return getEnv().KV;
}

// ─── Operator map ─────────────────────────────────────────────────────────────

const OP_MAP: Record<string, string> = {
  '==': '=',
  '!=': '!=',
  '>':  '>',
  '<':  '<',
  '>=': '>=',
  '<=': '<=',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serializeData(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

function deserialize<T>(row: { id: string; data: string; created_at: number; updated_at: number }): WithId<T> {
  const parsed = JSON.parse(row.data) as T;
  return { ...parsed, id: row.id } as WithId<T>;
}

// ─── Read operations ──────────────────────────────────────────────────────────

/** Fetch a single document by collection + id. */
export async function dbGetDoc<T>(collection: string, id: string): Promise<WithId<T> | null> {
  const db = getDB();
  const row = await db
    .prepare('SELECT id, data, created_at, updated_at FROM documents WHERE collection = ? AND id = ?')
    .bind(collection, id)
    .first<{ id: string; data: string; created_at: number; updated_at: number }>();
  return row ? deserialize<T>(row) : null;
}

/** Fetch a list of documents from a collection with optional filtering. */
export async function dbGetDocs<T>(collection: string, params: QueryParams = {}): Promise<WithId<T>[]> {
  const db = getDB();
  const { orderBy, orderDir = 'asc', limit = 100, where = [], userId } = params;

  const conditions: string[] = ['collection = ?'];
  const bindings: unknown[] = [collection];

  if (userId) {
    conditions.push('user_id = ?');
    bindings.push(userId);
  }

  for (const [field, op, value] of where) {
    const sqlOp = OP_MAP[op] ?? '=';
    conditions.push(`json_extract(data, '$.${field}') ${sqlOp} ?`);
    bindings.push(value);
  }

  const whereClause = conditions.join(' AND ');

  // Order by: prefer json field, fall back to created_at / updated_at columns
  let orderClause = 'created_at DESC';
  if (orderBy === 'updatedAt' || orderBy === 'updated_at') {
    orderClause = `updated_at ${orderDir.toUpperCase()}`;
  } else if (orderBy && orderBy !== 'createdAt' && orderBy !== 'created_at') {
    orderClause = `json_extract(data, '$.${orderBy}') ${orderDir.toUpperCase()}, created_at DESC`;
  } else if (orderBy) {
    orderClause = `created_at ${orderDir.toUpperCase()}`;
  }

  const sql = `SELECT id, data, created_at, updated_at FROM documents WHERE ${whereClause} ORDER BY ${orderClause} LIMIT ?`;
  bindings.push(limit);

  const result = await db
    .prepare(sql)
    .bind(...bindings)
    .all<{ id: string; data: string; created_at: number; updated_at: number }>();

  return (result.results ?? []).map(row => deserialize<T>(row));
}

// ─── Write operations ─────────────────────────────────────────────────────────

/** Insert a new document (auto-generates id if not provided). Returns the id. */
export async function dbAddDoc(
  collection: string,
  data: Record<string, unknown>,
  userId?: string,
): Promise<string> {
  const db = getDB();
  const id = (data.id as string) ?? nanoid();
  const now = Math.floor(Date.now() / 1000);
  // Remove id from the JSON blob to avoid duplication
  const { id: _id, ...rest } = data;
  await db
    .prepare(
      'INSERT INTO documents (id, collection, user_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(id, collection, userId ?? null, serializeData(rest), now, now)
    .run();
  return id;
}

/** Set (upsert) a document. Replaces the entire data blob. */
export async function dbSetDoc(
  collection: string,
  id: string,
  data: Record<string, unknown>,
  userId?: string,
): Promise<void> {
  const db = getDB();
  const now = Math.floor(Date.now() / 1000);
  const { id: _id, ...rest } = data;
  await db
    .prepare(`
      INSERT INTO documents (id, collection, user_id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (collection, id) DO UPDATE SET
        data       = excluded.data,
        user_id    = COALESCE(excluded.user_id, user_id),
        updated_at = excluded.updated_at
    `)
    .bind(id, collection, userId ?? null, serializeData(rest), now, now)
    .run();
}

/** Merge-update a document (shallow merge into the existing JSON blob). */
export async function dbUpdateDoc(
  collection: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const db = getDB();
  const now = Math.floor(Date.now() / 1000);
  // Read existing, merge, write back
  const existing = await dbGetDoc<Record<string, unknown>>(collection, id);
  const merged = { ...(existing ?? {}), ...patch };
  const { id: _id, ...rest } = merged;
  await db
    .prepare('UPDATE documents SET data = ?, updated_at = ? WHERE collection = ? AND id = ?')
    .bind(serializeData(rest), now, collection, id)
    .run();
}

/** Delete a document. */
export async function dbDeleteDoc(collection: string, id: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('DELETE FROM documents WHERE collection = ? AND id = ?')
    .bind(collection, id)
    .run();
}

/** Delete all documents in a collection matching optional filters (e.g. all for a user). */
export async function dbDeleteDocs(collection: string, params: Pick<QueryParams, 'userId' | 'where'> = {}): Promise<void> {
  const db = getDB();
  const conditions = ['collection = ?'];
  const bindings: unknown[] = [collection];

  if (params.userId) {
    conditions.push('user_id = ?');
    bindings.push(params.userId);
  }
  for (const [field, op, value] of params.where ?? []) {
    const sqlOp = OP_MAP[op] ?? '=';
    conditions.push(`json_extract(data, '$.${field}') ${sqlOp} ?`);
    bindings.push(value);
  }

  await db
    .prepare(`DELETE FROM documents WHERE ${conditions.join(' AND ')}`)
    .bind(...bindings)
    .run();
}
