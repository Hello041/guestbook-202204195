import { neon } from "@neondatabase/serverless";
import type { EntryStore, StoredEntry } from "./entry-store";

type EntryRow = {
  id: string;
  author_name: string;
  message: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date | null;
};

export function createNeonEntryStore(databaseUrl: string): EntryStore {
  const sql = neon(databaseUrl);

  return {
    async findAll() {
      const rows = (await sql`
        SELECT * FROM entries ORDER BY created_at DESC
      `) as EntryRow[];
      return rows.map(fromRow);
    },

    async insert(entry) {
      const [row] = (await sql`
        INSERT INTO entries (author_name, message, password_hash)
        VALUES (${entry.authorName}, ${entry.message}, ${entry.passwordHash})
        RETURNING *
      `) as EntryRow[];
      return fromRow(row);
    },
  };
}

function fromRow(row: EntryRow): StoredEntry {
  return {
    id: row.id,
    authorName: row.author_name,
    message: row.message,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at === null ? null : new Date(row.updated_at),
  };
}
