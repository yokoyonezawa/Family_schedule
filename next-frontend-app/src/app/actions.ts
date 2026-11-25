"use server";

// フォームから呼ばれる処理(Next.jsのサーバー側で動き、LaravelのAPIを呼ぶ)

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";

// LaravelのAPIにデータを送る。失敗したらエラーメッセージを返す
async function send(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<string | null> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.message ?? `保存に失敗しました (${res.status})`;
}

function backTo(date: string, error?: string | null) {
  const params = new URLSearchParams({ month: date.slice(0, 7), date });
  if (error) params.set("error", error);
  return `/?${params.toString()}`;
}

// フォームの値を、Laravelに送る予定データの形にする
function eventBody(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") || "00:00");
  const endTime = String(formData.get("end_time") ?? "");
  const memo = String(formData.get("memo") ?? "").trim();
  return {
    date,
    body: {
      title: String(formData.get("title") ?? "").trim(),
      starts_at: `${date} ${startTime}`,
      ends_at: endTime ? `${date} ${endTime}` : null,
      memo: memo || null,
      member_ids: formData.getAll("member_ids").map(Number),
    },
  };
}

// ---------- 予定 ----------

export async function createEvent(formData: FormData) {
  const { date, body } = eventBody(formData);
  const error = await send("POST", "/events", body);
  revalidatePath("/");
  redirect(backTo(date, error));
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id"));
  const { date, body } = eventBody(formData);
  const error = await send("PUT", `/events/${id}`, body);
  if (error) {
    redirect(`/events/${id}?error=${encodeURIComponent(error)}`);
  }
  revalidatePath("/");
  redirect(backTo(date));
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id"));
  const date = String(formData.get("date"));
  const error = await send("DELETE", `/events/${id}`);
  revalidatePath("/");
  redirect(backTo(date, error && "削除に失敗しました"));
}

// ---------- 家族メンバー ----------

function membersPage(error?: string | null) {
  return error ? `/members?error=${encodeURIComponent(error)}` : "/members";
}

export async function createMember(formData: FormData) {
  const error = await send("POST", "/members", {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? ""),
  });
  revalidatePath("/members");
  redirect(membersPage(error));
}

export async function updateMember(formData: FormData) {
  const id = String(formData.get("id"));
  const error = await send("PUT", `/members/${id}`, {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? ""),
  });
  revalidatePath("/members");
  redirect(membersPage(error));
}

export async function deleteMember(formData: FormData) {
  const id = String(formData.get("id"));
  const error = await send("DELETE", `/members/${id}`);
  revalidatePath("/members");
  redirect(membersPage(error && "削除に失敗しました"));
}
