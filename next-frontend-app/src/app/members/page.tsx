import Link from "next/link";
import { getMembers } from "@/lib/api";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createMember, deleteMember, updateMember } from "../actions";

const COLOR_CHOICES = [
  "#0ea5e9",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

// 家族メンバーの登録・編集・削除ページ
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : null;
  const members = await getMembers();
  const nextColor = COLOR_CHOICES[members.length % COLOR_CHOICES.length];

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <Link href="/" className="text-sm text-sky-700 hover:underline">
        ‹ カレンダーに戻る
      </Link>
      <h1 className="mb-1 mt-4 text-xl font-bold text-slate-800">
        ⚙️ 家族の管理
      </h1>
      <p className="mb-5 text-sm text-slate-500">
        名前と色を変えたら「保存」を押してください
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      {/* 登録済みの家族 */}
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <form action={updateMember} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="id" value={m.id} />
              <input
                type="color"
                name="color"
                defaultValue={m.color}
                aria-label={`${m.name}の色`}
                className="h-9 w-10 shrink-0 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
              />
              <input
                name="name"
                required
                defaultValue={m.name}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
              >
                保存
              </button>
            </form>
            <form action={deleteMember}>
              <input type="hidden" name="id" value={m.id} />
              <ConfirmButton
                message={`「${m.name}」を削除しますか？\n(予定は残りますが、${m.name}との紐づけは外れます)`}
                className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                削除
              </ConfirmButton>
            </form>
          </li>
        ))}
        {members.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            まだ家族が登録されていません
          </li>
        )}
      </ul>

      {/* 新しく追加 */}
      <h2 className="mb-2 mt-8 font-semibold text-slate-800">家族を追加</h2>
      <form
        action={createMember}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <input
          type="color"
          name="color"
          defaultValue={nextColor}
          aria-label="色"
          className="h-9 w-10 shrink-0 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
        />
        <input
          name="name"
          required
          placeholder="例：おばあちゃん"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 focus:border-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          追加
        </button>
      </form>
    </main>
  );
}
