'use client';

import { useState, useEffect } from 'react';
import { errorEmitter, FirestorePermissionError } from '@/firebase/error-emitter';

/**
 * Invisible component that listens for globally emitted permission-error events
 * and re-throws them so Next.js error boundaries can catch them.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => setError(err);
    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, []);

  if (error) throw error;
  return null;
}
