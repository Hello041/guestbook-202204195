import { createGuestbook } from "./guestbook";
import { createNeonEntryStore } from "./neon-entry-store";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

// The guestbook instance the app talks to.
export const guestbook = createGuestbook(createNeonEntryStore(databaseUrl));
