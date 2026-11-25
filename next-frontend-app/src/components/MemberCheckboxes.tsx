import type { Member } from "@/lib/api";

// 「誰の予定？」のチェックボックス
export function MemberCheckboxes({
  members,
  checkedIds = [],
}: {
  members: Member[];
  checkedIds?: number[];
}) {
  if (members.length === 0) {
    return (
      <p className="mt-2 text-sm text-slate-400">
        家族が登録されていません(「家族の管理」から追加できます)
      </p>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {members.map((m) => (
        <label
          key={m.id}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-sm has-[:checked]:border-slate-400 has-[:checked]:bg-slate-100"
        >
          <input
            type="checkbox"
            name="member_ids"
            value={m.id}
            defaultChecked={checkedIds.includes(m.id)}
          />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: m.color }}
          />
          <span className="text-slate-700">{m.name}</span>
        </label>
      ))}
    </div>
  );
}
