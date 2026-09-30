import type { EntryStore, StoredEntry } from "./entry-store";

// What anyone may see of an entry. The password never leaves the module.
export type Entry = {
  id: string;
  authorName: string;
  message: string;
  createdAt: Date;
  edited: boolean;
};

export type Guestbook = ReturnType<typeof createGuestbook>;

export function createGuestbook(store: EntryStore) {
  return {
    async listEntries(): Promise<Entry[]> {
      const entries = await store.findAll();
      return entries.map(toEntry);
    },
  };
}

function toEntry(stored: StoredEntry): Entry {
  return {
    id: stored.id,
    authorName: stored.authorName,
    message: stored.message,
    createdAt: stored.createdAt,
    edited: stored.updatedAt !== null,
  };
}
