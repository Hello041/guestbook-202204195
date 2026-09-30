import { describe, expect, it } from "vitest";
import {
  createGuestbook,
  type Guestbook,
  type NewEntryInput,
} from "./guestbook";
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

describe("editEntry", () => {
  it("changes the message with the right password, keeping time and order", async () => {
    const guestbook = newGuestbook();
    const older = await createOk(guestbook, validInput({ message: "옛 글" }));
    await createOk(guestbook, validInput({ message: "새 글" }));

    const result = await guestbook.editEntry({
      id: older.id,
      message: "고친 글",
      password: "1234",
    });

    expect(result.ok).toBe(true);
    const entries = await guestbook.listEntries();
    expect(entries.map((e) => e.message)).toEqual(["새 글", "고친 글"]);
    expect(entries[1]).toMatchObject({
      id: older.id,
      authorName: older.authorName,
      createdAt: older.createdAt,
      edited: true,
    });
  });

  it("refuses a wrong password and leaves the entry unchanged", async () => {
    const guestbook = newGuestbook();
    const entry = await createOk(guestbook, validInput({ password: "1234" }));

    const result = await guestbook.editEntry({
      id: entry.id,
      message: "몰래 고친 글",
      password: "9999",
    });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    const [listed] = await guestbook.listEntries();
    expect(listed).toMatchObject({ message: entry.message, edited: false });
  });

  it("does not let another entry's password edit an entry with the same author name", async () => {
    const guestbook = newGuestbook();
    const mine = await createOk(
      guestbook,
      validInput({ authorName: "김철수", password: "mine-pw" }),
    );
    await createOk(
      guestbook,
      validInput({ authorName: "김철수", password: "other-pw" }),
    );

    const result = await guestbook.editEntry({
      id: mine.id,
      message: "남이 고친 글",
      password: "other-pw",
    });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
  });

  it("reports an entry that does not exist", async () => {
    const guestbook = newGuestbook();

    const result = await guestbook.editEntry({
      id: "00000000-0000-0000-0000-000000000000",
      message: "고친 글",
      password: "1234",
    });

    expect(result).toEqual({ ok: false, reason: "not-found" });
  });

  it("reports a missing entry even when the new message is invalid", async () => {
    const guestbook = newGuestbook();

    const result = await guestbook.editEntry({
      id: "00000000-0000-0000-0000-000000000000",
      message: "   ",
      password: "1234",
    });

    expect(result).toEqual({ ok: false, reason: "not-found" });
  });

  it.each([
    ["an empty message", ""],
    ["a blank message", "   "],
    ["a 501-character message", "가".repeat(501)],
  ])("rejects %s and leaves the entry unchanged", async (_label, message) => {
    const guestbook = newGuestbook();
    const entry = await createOk(guestbook, validInput());

    const result = await guestbook.editEntry({
      id: entry.id,
      message,
      password: "1234",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid");
    const [listed] = await guestbook.listEntries();
    expect(listed).toMatchObject({ message: entry.message, edited: false });
  });

  it("trims the edited message", async () => {
    const guestbook = newGuestbook();
    const entry = await createOk(guestbook, validInput());

    await guestbook.editEntry({
      id: entry.id,
      message: "  고친 글 \n",
      password: "1234",
    });

    const [listed] = await guestbook.listEntries();
    expect(listed.message).toBe("고친 글");
  });
});

describe("deleteEntry", () => {
  it("removes the entry with the right password", async () => {
    const guestbook = newGuestbook();
    const gone = await createOk(guestbook, validInput({ message: "지울 글" }));
    await createOk(guestbook, validInput({ message: "남을 글" }));

    const result = await guestbook.deleteEntry({
      id: gone.id,
      password: "1234",
    });

    expect(result).toEqual({ ok: true });
    const messages = (await guestbook.listEntries()).map((e) => e.message);
    expect(messages).toEqual(["남을 글"]);
  });

  it("refuses a wrong password and keeps the entry", async () => {
    const guestbook = newGuestbook();
    const entry = await createOk(guestbook, validInput({ password: "1234" }));

    const result = await guestbook.deleteEntry({
      id: entry.id,
      password: "9999",
    });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await guestbook.listEntries()).toHaveLength(1);
  });

  it("does not let another entry's password delete an entry with the same author name", async () => {
    const guestbook = newGuestbook();
    const mine = await createOk(
      guestbook,
      validInput({ authorName: "김철수", password: "mine-pw" }),
    );
    await createOk(
      guestbook,
      validInput({ authorName: "김철수", password: "other-pw" }),
    );

    const result = await guestbook.deleteEntry({
      id: mine.id,
      password: "other-pw",
    });

    expect(result).toEqual({ ok: false, reason: "wrong-password" });
    expect(await guestbook.listEntries()).toHaveLength(2);
  });

  it("reports an entry that does not exist", async () => {
    const guestbook = newGuestbook();

    const result = await guestbook.deleteEntry({
      id: "00000000-0000-0000-0000-000000000000",
      password: "1234",
    });

    expect(result).toEqual({ ok: false, reason: "not-found" });
  });
});

async function createOk(guestbook: Guestbook, input: NewEntryInput) {
  const result = await guestbook.createEntry(input);
  if (!result.ok) throw new Error("expected createEntry to succeed");
  return result.entry;
}

function validInput(overrides: Partial<NewEntryInput> = {}): NewEntryInput {
  return {
    authorName: "김철수",
    message: "안녕하세요!",
    password: "1234",
    ...overrides,
  };
}
