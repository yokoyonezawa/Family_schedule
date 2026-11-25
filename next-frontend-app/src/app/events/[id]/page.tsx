import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getMembers } from "@/lib/api";
import { formatDateLabel, toDateKey, toTimeValue } from "@/lib/date";
import { ConfirmButton } from "@/components/ConfirmButton";
import { MemberCheckboxes } from "@/components/MemberCheckboxes";
import { deleteEvent, updateEvent } from "../../actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none";

// 予定の詳細・編集ページ
export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : null;

  const [event, members] = await Promise.all([getEvent(id), getMembers()]);
  if (!event) notFound();

  const date = toDateKey(event.starts_at);
  const color = event.members[0]?.color ?? "#94a3b8";

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <Link
        href={`/?month=${date.slice(0, 7)}&date=${date}`}
        className="text-sm text-sky-700 hover:underline"
      >
        ‹ カレンダーに戻る
      </Link>

      <div
        className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <p className="text-sm text-slate-500">{formatDateLabel(date)}</p>
        <h1 className="mb-5 text-xl font-bold text-slate-800">{event.title}</h1>

        <form action={updateEvent} className="space-y-4">
          <input type="hidden" name="id" value={event.id} />

          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              予定名 <span className="text-rose-500">*</span>
            </span>
            <input
              name="title"
              required
              defaultValue={event.title}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">日付</span>
            <input
              type="date"
              name="date"
              required
              defaultValue={date}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">開始</span>
              <input
                type="time"
                name="start_time"
                defaultValue={toTimeValue(event.starts_at)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">終了</span>
              <input
                type="time"
                name="end_time"
                defaultValue={event.ends_at ? toTimeValue(event.ends_at) : ""}
                className={inputClass}
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">
              誰の予定？
            </legend>
            <MemberCheckboxes
              members={members}
              checkedIds={event.members.map((m) => m.id)}
            />
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">メモ</span>
            <textarea
              name="memo"
              rows={4}
              defaultValue={event.memo ?? ""}
              placeholder="持ち物、場所、連絡事項など"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-600 py-2.5 font-semibold text-white hover:bg-sky-700"
          >
            保存する
          </button>
        </form>

        <form action={deleteEvent} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="date" value={date} />
          <ConfirmButton
            message={`「${event.title}」を削除しますか？`}
            className="w-full rounded-lg border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            この予定を削除する
          </ConfirmButton>
        </form>
      </div>
    </main>
  );
}
