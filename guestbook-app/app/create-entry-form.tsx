"use client";

import { useActionState } from "react";
import { createEntryAction, type CreateEntryFormState } from "./actions";
import {
  AUTHOR_NAME_MAX,
  MESSAGE_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from "@/lib/guestbook/entry-rules";

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900";

export function CreateEntryForm() {
  const [state, formAction, pending] = useActionState<
    CreateEntryFormState,
    FormData
  >(createEntryAction, {});

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
    >
      <h2 className="text-lg font-semibold">글 남기기</h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          이름
          <input
            name="authorName"
            defaultValue={state.values?.authorName}
            maxLength={AUTHOR_NAME_MAX}
            required
            className={inputClass}
          />
          <FieldError message={state.errors?.authorName} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          비밀번호
          <input
            name="password"
            type="password"
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            required
            autoComplete="new-password"
            className={inputClass}
          />
          <FieldError message={state.errors?.password} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        메시지
        <textarea
          name="message"
          defaultValue={state.values?.message}
          maxLength={MESSAGE_MAX}
          required
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <FieldError message={state.errors?.message} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="text-sm text-red-600 dark:text-red-400">
      {message}
    </span>
  );
}
