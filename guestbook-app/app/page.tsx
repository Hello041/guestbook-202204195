import { connection } from "next/server";
import { formatCreatedTime } from "@/lib/format-created-time";
import { guestbook } from "@/lib/guestbook/server";
import { CreateEntryForm } from "./create-entry-form";

export default async function Home() {
  // The list changes with every entry, so render it per request.
  await connection();
  const entries = await guestbook.listEntries();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">미니 방명록</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          개발자: 김정효 (202204195)
        </p>
      </header>

      <main className="flex flex-col gap-6">
        <CreateEntryForm />

        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            아직 작성된 글이 없습니다. 첫 글을 남겨보세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
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
                <p className="mt-2 whitespace-pre-wrap break-words">
                  {entry.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
