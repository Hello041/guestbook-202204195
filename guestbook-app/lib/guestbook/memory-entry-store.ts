import type { EntryStore, StoredEntry } from "./entry-store";

export function createMemoryEntryStore(): EntryStore {
  const entries: StoredEntry[] = [];

  return {
    async findAll() {
      return entries.map((entry) => ({ ...entry }));
    },
  };
}
