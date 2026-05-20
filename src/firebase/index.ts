/**
 * @/firebase — central barrel for auth, data hooks, and DB helpers.
 *
 * Stack: Clerk (auth) · Cloudflare D1 via REST API (data) · polling hooks
 * All Firebase SDK dependencies have been removed.
 */

// ── Auth (Clerk) ──────────────────────────────────────────────────────────────
export { useUser, useAuth, type AppUser, type UserHookResult, type AuthHookResult } from '@/providers/auth-provider';

// ── Data hooks (D1 REST + polling) ───────────────────────────────────────────
export { useCollection, type UseCollectionResult, type WithId } from '@/hooks/use-collection';
export { useDoc, type UseDocResult } from '@/hooks/use-doc';

// ── DB write helpers ──────────────────────────────────────────────────────────
export {
  dbAdd,
  dbSet,
  dbUpdate,
  dbDelete,
  dbGet,
  dbGetAll,
  dbIncrement,
  dbArrayUnion,
  dbArrayRemove,
  nowTs,
  type ClientQueryParams,
} from '@/lib/db-client';

// ── Error broadcasting ────────────────────────────────────────────────────────
export { errorEmitter, FirestorePermissionError } from '@/firebase/error-emitter';
