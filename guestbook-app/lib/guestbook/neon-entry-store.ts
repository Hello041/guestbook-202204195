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

// Anything else would make Postgres throw instead of simply matching nothing.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    async findById(id) {
      if (!UUID.test(id)) return null;
      const [row] = (await sql`
        SELECT * FROM entries WHERE id = ${id}
      `) as EntryRow[];
      return row ? fromRow(row) : null;
    },

    async updateMessage(id, message) {
      if (!UUID.test(id)) return null;
      const [row] = (await sql`
        UPDATE entries SET message = ${message}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `) as EntryRow[];
      return row ? fromRow(row) : null;
    },

    async remove(id) {
      if (!UUID.test(id)) return false;
      const rows = await sql`DELETE FROM entries WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
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
