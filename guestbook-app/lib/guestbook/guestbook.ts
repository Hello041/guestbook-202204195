import type { EntryStore, StoredEntry } from "./entry-store";
import {
  checkAuthorName,
  checkMessage,
  checkPassword,
  type FieldErrors,
} from "./entry-rules";
import { hashPassword, verifyPassword } from "./password";

// What anyone may see of an entry. The password never leaves the module.
export type Entry = {
  id: string;
  authorName: string;
  message: string;
  createdAt: Date;
  edited: boolean;
};

export type NewEntryInput = {
  authorName: string;
  message: string;
  password: string;
};

export type CreateEntryResult =
  | { ok: true; entry: Entry }
  | { ok: false; reason: "invalid"; errors: FieldErrors };

export type EditEntryInput = {
  id: string;
  message: string;
  password: string;
};

export type EditEntryResult =
  | { ok: true; entry: Entry }
  | { ok: false; reason: "wrong-password" | "not-found" }
  | { ok: false; reason: "invalid"; errors: FieldErrors };

export type Guestbook =ReturnType<typeof createGuestbook>;

export function createGuestbook(store: EntryStore) {
  return {
    async listEntries(): Promise<Entry[]> {
      const entries = await store.findAll();
      return entries
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(toEntry);
    },

    async createEntry(input: NewEntryInput): Promise<CreateEntryResult> {
      const authorName = checkAuthorName(input.authorName);
      const message = checkMessage(input.message);
      const password = checkPassword(input.password);

      const errors: FieldErrors = {};
      if ("error" in authorName) errors.authorName = authorName.error;
      if ("error" in message) errors.message = message.error;
      if ("error" in password) errors.password = password.error;
      if ("error" in authorName || "error" in message || "error" in password) {
        return { ok: false, reason: "invalid", errors };
      }

      const stored = await store.insert({
        authorName: authorName.value,
        message: message.value,
        passwordHash: await hashPassword(password.value),
      });
      return { ok: true, entry: toEntry(stored) };
    },

    async editEntry(input: EditEntryInput): Promise<EditEntryResult> {
      const message = checkMessage(input.message);
      if ("error" in message) {
        return { ok: false, reason: "invalid", errors: { message: message.error } };
      }

      const existing = await store.findById(input.id);
      if (!existing) return { ok: false, reason: "not-found" };
      if (!(await verifyPassword(input.password, existing.passwordHash))) {
        return { ok: false, reason: "wrong-password" };
      }

      const updated = await store.updateMessage(input.id, message.value);
      if (!updated) return { ok: false, reason: "not-found" };
      return { ok: true, entry: toEntry(updated) };
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
