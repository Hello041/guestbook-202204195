import { describe, expect, it } from "vitest";
import { createGuestbook } from "./guestbook";
import { createMemoryEntryStore } from "./memory-entry-store";

function newGuestbook() {
  return createGuestbook(createMemoryEntryStore());
}

describe("listEntries", () => {
  it("returns an empty list when the guestbook has no entries", async () => {
    const guestbook = newGuestbook();

    expect(await guestbook.listEntries()).toEqual([]);
  });
});
