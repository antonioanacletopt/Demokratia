'use client';

/**
 * use-collection.ts — Polling-based collection hook.
 * Replaces the Firestore onSnapshot useCollection hook.
 *
 * Polls GET /api/data/[collection] every `pollMs` ms (default 10 s).
 * Returns the same { data, isLoading, error } shape as before.
 *
 * Usage:
 *   const { data, isLoading } = useCollection<Proposal>('communityProposals', {
 *     orderBy: 'voteCount', orderDir: 'desc', limit: 50,
 *   });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { dbGetAll, type ClientQueryParams, type WithId } from '@/lib/db-client';

export type { WithId };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useCollection<T = Record<string, unknown>>(
  collection: string | null | undefined,
  params: ClientQueryParams = {},
  pollMs = 10_000,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchData = useCallback(async (showLoading: boolean) => {
    if (!collection) {
      setData(null);
      setIsLoading(false);
      return;
    }
    if (showLoading) setIsLoading(true);
    try {
      const result = await dbGetAll<T>(collection, paramsRef.current);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    if (!collection) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Initial fetch — show spinner
    fetchData(true);

    // Subsequent polls — silent refresh (no spinner)
    const timer = setInterval(() => fetchData(false), pollMs);
    return () => clearInterval(timer);
  }, [collection, pollMs, fetchData]);

  return { data, isLoading, error, refresh: () => fetchData(false) };
}
