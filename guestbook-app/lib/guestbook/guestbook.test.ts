import { describe, expect, it } from "vitest";
import { createGuestbook, type NewEntryInput } from "./guestbook";
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

describe("createEntry", () => {
  it("adds an unedited entry that then appears in the list", async () => {
    const guestbook = newGuestbook();

    const result = await guestbook.createEntry({
      authorName: "김철수",
      message: "안녕하세요!",
      password: "1234",
    });

    expect(result.ok).toBe(true);
    const entries = await guestbook.listEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      authorName: "김철수",
      message: "안녕하세요!",
      edited: false,
    });
    expect(entries[0].createdAt).toBeInstanceOf(Date);
  });

  it("lists entries newest first", async () => {
    const guestbook = newGuestbook();

    await guestbook.createEntry(validInput({ message: "첫 번째" }));
    await guestbook.createEntry(validInput({ message: "두 번째" }));
    await guestbook.createEntry(validInput({ message: "세 번째" }));

    const messages = (await guestbook.listEntries()).map((e) => e.message);
    expect(messages).toEqual(["세 번째", "두 번째", "첫 번째"]);
  });

  it("never exposes the password in the list", async () => {
    const guestbook = newGuestbook();

    await guestbook.createEntry(validInput({ password: "secret-pw" }));

    const listed = JSON.stringify(await guestbook.listEntries());
    expect(listed).not.toContain("secret-pw");
    expect(listed).not.toMatch(/password/i);
  });
});

describe("createEntry input rules", () => {
  it.each([
    ["an empty author name", "authorName", ""],
    ["a blank author name", "authorName", "   "],
    ["a 21-character author name", "authorName", "가".repeat(21)],
    ["an empty message", "message", ""],
    ["a blank message", "message", " \n "],
    ["a 501-character message", "message", "가".repeat(501)],
    ["an empty password", "password", ""],
    ["a 3-character password", "password", "123"],
    ["a 21-character password", "password", "a".repeat(21)],
  ] as const)("rejects %s and adds nothing", async (_label, field, value) => {
    const guestbook = newGuestbook();

    const result = await guestbook.createEntry(validInput({ [field]: value }));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid");
    expect(Object.keys(result.errors)).toEqual([field]);
    expect(await guestbook.listEntries()).toEqual([]);
  });

  it.each([
    ["a 20-character author name", "authorName", "가".repeat(20)],
    ["a 1-character author name", "authorName", "김"],
    ["a 500-character message", "message", "가".repeat(500)],
    ["a 1-character message", "message", "a"],
    ["a 4-character password", "password", "1234"],
    ["a 20-character password", "password", "a".repeat(20)],
  ] as const)("accepts %s", async (_label, field, value) => {
    const guestbook = newGuestbook();

    const result = await guestbook.createEntry(validInput({ [field]: value }));

    expect(result.ok).toBe(true);
  });

  it("trims the author name and message before saving", async () => {
    const guestbook = newGuestbook();

    await guestbook.createEntry(
      validInput({ authorName: "  김철수  ", message: "\n  안녕  \n" }),
    );

    const [entry] = await guestbook.listEntries();
    expect(entry.authorName).toBe("김철수");
    expect(entry.message).toBe("안녕");
  });

  it("allows two entries with the same author name", async () => {
    const guestbook = newGuestbook();

    await guestbook.createEntry(validInput({ authorName: "김철수" }));
    const second = await guestbook.createEntry(
      validInput({ authorName: "김철수" }),
    );

    expect(second.ok).toBe(true);
    expect(await guestbook.listEntries()).toHaveLength(2);
  });
});

function validInput(overrides: Partial<NewEntryInput> = {}): NewEntryInput {
  return {
    authorName: "김철수",
    message: "안녕하세요!",
    password: "1234",
    ...overrides,
  };
}
