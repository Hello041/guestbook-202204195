import { createGuestbook } from "./guestbook";
import { createMemoryEntryStore } from "./memory-entry-store";

// The guestbook instance the app talks to.
export const guestbook = createGuestbook(createMemoryEntryStore());
