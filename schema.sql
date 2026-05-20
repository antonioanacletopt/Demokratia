-- Demokratia — D1 (SQLite) schema
-- Single generic table for all Firestore-equivalent document collections.
-- Field-level queries use json_extract(data, '$.field').

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT    NOT NULL,
  collection  TEXT    NOT NULL,
  user_id     TEXT,
  data        TEXT    NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS idx_collection_created
  ON documents (collection, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_collection
  ON documents (collection, user_id);
