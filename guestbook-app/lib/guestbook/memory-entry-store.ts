import { randomUUID } from "node:crypto";
import type { EntryStore, StoredEntry } from "./entry-store";

export function createMemoryEntryStore(): EntryStore {
  const entries: StoredEntry[] = [];
  let lastCreatedAt = 0;

  // Entries written in the same millisecond still get distinct, ordered times.
  function nextCreatedAt() {
    lastCreatedAt = Math.max(Date.now(), lastCreatedAt + 1);
    return new Date(lastCreatedAt);
  }

  return {
    async findAll() {
      return entries.map((entry) => ({ ...entry }));
    },

    async insert(entry) {
      const stored: StoredEntry = {
        ...entry,
        id: randomUUID(),
        createdAt: nextCreatedAt(),
        updatedAt: null,
      };
      entries.push(stored);
      return { ...stored };
    },

    async findById(id) {
      const entry = entries.find((e) => e.id === id);
      return entry ? { ...entry } : null;
    },

    async updateMessage(id, message) {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return null;
      entry.message = message;
      entry.updatedAt = new Date();
      return { ...entry };
    },

    async remove(id) {
      const index = entries.findIndex((e) => e.id === id);
      if (index === -1) return false;
      entries.splice(index, 1);
      return true;
    },
  };
}
