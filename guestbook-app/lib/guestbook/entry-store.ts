// The storage seam for the guestbook module. A store only saves and loads
// entries; every guestbook rule lives in the guestbook module.

export type StoredEntry = {
  id: string;
  authorName: string;
  message: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export interface EntryStore {
  findAll(): Promise<StoredEntry[]>;
}
