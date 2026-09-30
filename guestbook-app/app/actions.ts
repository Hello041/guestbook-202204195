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

export type EntryFormState = {
  ok?: boolean;
  // Why the whole action was refused (e.g. wrong password).
  error?: string;
  errors?: FieldErrors;
  // Echoed back on failure so the form keeps what was typed (never the password).
  message?: string;
};

const WRONG_PASSWORD = "비밀번호가 일치하지 않습니다.";
const NOT_FOUND = "이미 삭제되었거나 존재하지 않는 글입니다.";

export async function editEntryAction(
  id: string,
  _prev: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const message = String(formData.get("message") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await guestbook.editEntry({ id, message, password });
  if (!result.ok) {
    if (result.reason === "invalid") return { errors: result.errors, message };
    return {
      error: result.reason === "wrong-password" ? WRONG_PASSWORD : NOT_FOUND,
      message,
    };
  }

  revalidatePath("/");
  return { ok: true };
}
