import type { Member } from "@/lib/api";

export function MemberBadge({ member }: { member: Member }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: member.color }}
    >
      {member.name}
    </span>
  );
}
