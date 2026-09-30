"use server";

import { revalidatePath } from "next/cache";
import type { FieldErrors } from "@/lib/guestbook/entry-rules";
import { guestbook } from "@/lib/guestbook/server";

export type CreateEntryFormState = {
  errors?: FieldErrors;
  // Echoed back on failure so the form keeps what was typed (never the password).
  values?: { authorName: string; message: string };
};

export async function createEntryAction(
  _prev: CreateEntryFormState,
  formData: FormData,
): Promise<CreateEntryFormState> {
  const authorName = String(formData.get("authorName") ?? "");
  const message = String(formData.get("message") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await guestbook.createEntry({ authorName, message, password });
  if (!result.ok) {
    return { errors: result.errors, values: { authorName, message } };
  }

  revalidatePath("/");
  return {};
}
