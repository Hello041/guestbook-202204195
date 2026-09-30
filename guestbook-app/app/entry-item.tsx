"use client";

import { useActionState, useState } from "react";
import { formatCreatedTime } from "@/lib/format-created-time";
import type { Entry } from "@/lib/guestbook/guestbook";
import {
  deleteEntryAction,
  editEntryAction,
  type EntryFormState,
} from "./actions";
import { FieldError, inputClass } from "./create-entry-form";

type Mode = "view" | "edit" | "delete";

export function EntryItem({ entry }: { entry: Entry }) {
  const [mode, setMode] = useState<Mode>("view");

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-semibold">{entry.authorName}</span>
        <time
          dateTime={entry.createdAt.toISOString()}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {formatCreatedTime(entry.createdAt)}
          {entry.edited && " (수정됨)"}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words">{entry.message}</p>

      {mode === "view" && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={secondaryButtonClass}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => setMode("delete")}
            className={secondaryButtonClass}
          >
            삭제
          </button>
        </div>
      )}

      {mode === "edit" && (
        <EditForm entry={entry} onClose={() => setMode("view")} />
      )}

      {mode === "delete" && (
        <DeleteForm entry={entry} onClose={() => setMode("view")} />
      )}
    </li>
  );
}

function EditForm({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<EntryFormState, FormData>(
    async (prev, formData) => {
      const next = await editEntryAction(entry.id, prev, formData);
      if (next.ok) onClose();
      return next;
    },
    {},
  );

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        메시지
        <textarea
          name="message"
          defaultValue={state.message ?? entry.message}
          required
          rows={3}
          className={`${inputClass} resize-y`}
        />
        <FieldError message={state.errors?.message} />
      </label>
      <PasswordField />
      <FieldError message={state.error} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          취소
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

function DeleteForm({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<EntryFormState, FormData>(
    async (prev, formData) => {
      const next = await deleteEntryAction(entry.id, prev, formData);
      if (next.ok) onClose();
      return next;
    },
    {},
  );

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
    >
      <p className="text-sm">이 글을 삭제하려면 비밀번호를 입력하세요.</p>
      <PasswordField />
      <FieldError message={state.error} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          취소
        </button>
        <button type="submit" disabled={pending} className={dangerButtonClass}>
          {pending ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </form>
  );
}

function PasswordField() {
  return (
    <label className="flex flex-col gap-1 text-sm">
      비밀번호
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className={inputClass}
      />
    </label>
  );
}

const secondaryButtonClass =
  "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800";
const primaryButtonClass =
  "rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButtonClass =
  "rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
