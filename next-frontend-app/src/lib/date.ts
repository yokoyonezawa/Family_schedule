// 日付まわりの便利関数(すべて日本時間で扱う)

const TZ = "Asia/Tokyo";

// ISO文字列 → "2026-12-05"
export function toDateKey(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

// ISO文字列 → "9:00"
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

// "2026-12-05" → "12月5日(土)"
export function formatDateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const week = ["日", "月", "火", "水", "木", "金", "土"][
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ];
  return `${m}月${d}日(${week})`;
}

// "2026-12" が正しい形ならそのまま、違えば今月を返す
export function normalizeMonth(value?: string) {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  return toDateKey(new Date()).slice(0, 7);
}

// 月を前後にずらす("2026-12", 1 → "2027-01")
export function shiftMonth(month: string, diff: number) {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + diff, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// カレンダーのマス目(日曜始まり)。空きマスは null
export function buildMonthGrid(month: string) {
  const [y, m] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return {
    cells,
    from: `${month}-01`,
    to: `${month}-${String(daysInMonth).padStart(2, "0")}`,
  };
}

// ISO文字列 → "09:00"(<input type="time"> 用)
export function toTimeValue(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
