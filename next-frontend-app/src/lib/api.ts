// LaravelのAPIとやりとりする処理

export const API_URL = process.env.API_URL ?? "http://localhost/api";

export type Member = {
  id: number;
  name: string;
  color: string;
};

export type Event = {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string | null;
  memo: string | null;
  members: Member[];
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store", // 毎回最新のデータを取りに行く
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`データの取得に失敗しました (${res.status}: ${path})`);
  }
  return res.json();
}

// 期間を指定して予定を取得(from, to は "2026-12-01" の形)
export function getEvents(from: string, to: string) {
  return get<Event[]>(`/events?from=${from}&to=${to}`);
}

// 家族メンバーを取得
export function getMembers() {
  return get<Member[]>("/members");
}

// 予定を1件取得(見つからなければ null)
export async function getEvent(id: string): Promise<Event | null> {
  const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`データの取得に失敗しました (${res.status}: /events/${id})`);
  }
  return res.json();
}
