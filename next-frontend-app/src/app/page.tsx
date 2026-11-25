import Link from "next/link";
import { getEvents, getMembers, type Event } from "@/lib/api";
import {
  buildMonthGrid,
  formatDateLabel,
  formatTime,
  normalizeMonth,
  shiftMonth,
  toDateKey,
} from "@/lib/date";
import { MemberBadge } from "@/components/MemberBadge";
import { MemberCheckboxes } from "@/components/MemberCheckboxes";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createEvent, deleteEvent } from "./actions";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const NO_MEMBER_COLOR = "#94a3b8"; // 誰の予定か未設定のときの色(グレー)

function eventColor(event: Event) {
  return event.members[0]?.color ?? NO_MEMBER_COLOR;
}

// カレンダーのマスに表示する予定チップ(クリックで詳細・編集へ)
function EventChip({ event }: { event: Event }) {
  const color = eventColor(event);
  return (
    <Link
      href={`/events/${event.id}`}
      className="pointer-events-auto flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight hover:brightness-95 sm:text-xs"
      style={{ backgroundColor: `${color}22`, borderLeft: `3px solid ${color}` }}
      title={`${formatTime(event.starts_at)} ${event.title}`}
    >
      {/* 複数人の予定は、2人目以降の色を点で表示 */}
      {event.members.slice(1).map((m) => (
        <span
          key={m.id}
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: m.color }}
        />
      ))}
      <span className="truncate text-slate-700">{event.title}</span>
    </Link>
  );
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const month = normalizeMonth(
    typeof params.month === "string" ? params.month : undefined,
  );
  const today = toDateKey(new Date());
  const selected =
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : null;
  const error = typeof params.error === "string" ? params.error : null;

  const { cells, from, to } = buildMonthGrid(month);
  const [events, members] = await Promise.all([
    getEvents(from, to),
    getMembers(),
  ]);

  // 日付ごとに予定をまとめる
  const byDate = new Map<string, Event[]>();
  for (const event of events) {
    const key = toDateKey(event.starts_at);
    byDate.set(key, [...(byDate.get(key) ?? []), event]);
  }

  const [year, monthNum] = month.split("-").map(Number);
  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6">
      {/* ヘッダー */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
          👨‍👩‍👧‍👦 家族のスケジュール
        </h1>
        <nav className="flex items-center gap-2">
          <Link
            href={`/?month=${shiftMonth(month, -1)}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            ‹ 前の月
          </Link>
          <span className="min-w-28 text-center text-lg font-semibold text-slate-800">
            {year}年{monthNum}月
          </span>
          <Link
            href={`/?month=${shiftMonth(month, 1)}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            次の月 ›
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            今日
          </Link>
        </nav>
      </header>

      {/* 色の凡例と、家族の管理へのリンク */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {members.map((m) => (
          <MemberBadge key={m.id} member={m} />
        ))}
        <Link
          href="/members"
          className="ml-auto text-sm text-sky-700 hover:underline"
        >
          ⚙️ 家族の管理
        </Link>
      </div>

      {/* カレンダー */}
      <div className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50 shadow-sm">
        <div className="grid grid-cols-7 border-b border-sky-200 bg-sky-100 text-center text-xs font-medium">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 ${i === 0 ? "text-rose-500" : i === 6 ? "text-sky-600" : "text-slate-500"}`}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((key, i) => {
            if (!key) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-20 border-b border-r border-sky-100 bg-sky-100/50 sm:min-h-28"
                />
              );
            }
            const dayEvents = byDate.get(key) ?? [];
            const day = Number(key.slice(8));
            const weekday = i % 7;
            const isToday = key === today;
            const isSelected = key === selected;
            return (
              <div
                key={key}
                className={`relative min-h-20 border-b border-r border-sky-100 p-1 sm:min-h-28 sm:p-1.5 ${isSelected ? "bg-white ring-2 ring-inset ring-sky-400" : ""}`}
              >
                {/* マス全体: クリックでその日を選ぶ */}
                <Link
                  href={`/?month=${month}&date=${key}`}
                  scroll={false}
                  aria-label={`${formatDateLabel(key)}を選ぶ`}
                  className="absolute inset-0 transition hover:bg-white/70"
                />
                <div
                  className={`pointer-events-none relative mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-slate-800 text-white"
                      : weekday === 0
                        ? "text-rose-500"
                        : weekday === 6
                          ? "text-sky-600"
                          : "text-slate-700"
                  }`}
                >
                  {day}
                </div>
                {/* 予定チップ: クリックでその予定の詳細へ */}
                <div className="pointer-events-none relative space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <EventChip key={event.id} event={event} />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-1 text-[10px] text-slate-500">
                      ほか{dayEvents.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!selected && (
        <p className="mt-4 text-center text-sm text-slate-500">
          日付のマスをタップすると予定を追加、予定をタップすると詳細の確認・編集ができます
        </p>
      )}

      {/* 選んだ日のポップアップ(その日の予定と、追加フォーム) */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* 背景の暗い部分: クリックで閉じる */}
          <Link
            href={`/?month=${month}`}
            scroll={false}
            aria-label="閉じる"
            className="absolute inset-0 bg-slate-900/40"
          />
          <section className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                📅 {formatDateLabel(selected)}
              </h2>
              <Link
                href={`/?month=${month}`}
                scroll={false}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                ✕
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-slate-700">
              この日の予定
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                予定はありません
              </p>
            ) : (
              <ul className="space-y-3">
                {selectedEvents.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    style={{ borderLeft: `4px solid ${eventColor(event)}` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/events/${event.id}`}
                        className="min-w-0 flex-1 hover:opacity-80"
                      >
                        <p className="text-sm font-semibold text-sky-700">
                          {formatTime(event.starts_at)}
                          {event.ends_at && ` 〜 ${formatTime(event.ends_at)}`}
                        </p>
                        <p className="font-medium text-slate-800">
                          {event.title}
                        </p>
                        {event.memo && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            📝 {event.memo}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {event.members.length === 0 ? (
                            <span className="text-xs text-slate-400">
                              メンバー未設定
                            </span>
                          ) : (
                            event.members.map((m) => (
                              <MemberBadge key={m.id} member={m} />
                            ))
                          )}
                        </div>
                      </Link>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Link
                          href={`/events/${event.id}`}
                          className="rounded-lg px-2 py-1 text-center text-xs text-sky-700 hover:bg-sky-50"
                        >
                          編集
                        </Link>
                        <form action={deleteEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="date" value={selected} />
                          <ConfirmButton
                            message={`「${event.title}」を削除しますか？`}
                            className="w-full rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            削除
                          </ConfirmButton>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-700">
              予定を追加
            </h3>
            <form
              action={createEvent}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <input type="hidden" name="date" value={selected} />

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
                  placeholder="例：保育園の遠足"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    開始
                  </span>
                  <input
                    type="time"
                    name="start_time"
                    defaultValue="09:00"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    終了
                  </span>
                  <input
                    type="time"
                    name="end_time"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
                  />
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-slate-700">
                  誰の予定？
                </legend>
                <MemberCheckboxes members={members} />
              </fieldset>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">メモ</span>
                <textarea
                  name="memo"
                  rows={2}
                  placeholder="例：お弁当・水筒"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-sky-600 py-2.5 font-semibold text-white hover:bg-sky-700"
              >
                追加する
              </button>
            </form>
          </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
