'use client';

/**
 * use-doc.ts — Polling-based single document hook.
 * Replaces the Firestore onSnapshot useDoc hook.
 *
 * Polls GET /api/data/[collection]/[id] every `pollMs` ms (default 10 s).
 * Returns the same { data, isLoading, error } shape as before.
 *
 * Usage:
 *   const { data } = useDoc<UserProfile>('users', userId);
 *   const { data } = useDoc<BudgetConfig>('user_budgetConfig', userId);
 */

import { useState, useEffect, useCallback } from 'react';
import { dbGet, type WithId } from '@/lib/db-client';

export type { WithId };

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDoc<T = Record<string, unknown>>(
  collection: string | null | undefined,
  id: string | null | undefined,
  pollMs = 10_000,
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (showLoading: boolean) => {
    if (!collection || !id) {
      setData(null);
      setIsLoading(false);
      return;
    }
    if (showLoading) setIsLoading(true);
    try {
      const result = await dbGet<T>(collection, id);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [collection, id]);

  useEffect(() => {
    if (!collection || !id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    fetchData(true);

    const timer = setInterval(() => fetchData(false), pollMs);
    return () => clearInterval(timer);
  }, [collection, id, pollMs, fetchData]);

  return { data, isLoading, error, refresh: () => fetchData(false) };
}
