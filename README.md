# 👨‍👩‍👧‍👦 Family Schedule(家族のスケジュール管理アプリ)

家族みんなの予定を、ひとつのカレンダーでまとめて管理できるWebアプリです。
メンバーごとに色分けされるので、同じ日に複数の予定があっても「誰の予定か」がひと目でわかります。

## 作った理由

子ども3人を含む5人家族で、保育園・学校の行事、予防接種、習い事などの予定が多く、紙のカレンダーや個人のスマホだけでは家族全員の予定を把握しきれませんでした。
「家族の予定を1か所にまとめて、色で見分けられるようにしたい」と思い、Laravel と Next.js の学習を兼ねて開発しました。

## 主な機能

- **月間カレンダー表示**
  - 前の月・次の月・今日への移動
  - 土日・今日の日付を色で区別
- **家族ごとの色分け**
  - 予定チップをメンバーの色で表示
  - 複数人の予定は、2人目以降の色をドットで表示
- **予定の登録・編集・削除**
  - 日付のマスをクリックすると、ポップアップでその日の予定確認と追加ができる
  - 予定をクリックすると詳細・編集ページへ移動
  - 予定名・日付・開始/終了時刻・メンバー・メモを登録できる
  - 削除時は確認ダイアログを表示
- **家族メンバーの管理**
  - メンバーの追加・名前と色の変更・削除

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フロントエンド | Next.js 16(App Router / Server Actions)、React 19、TypeScript、Tailwind CSS 4 |
| バックエンド | Laravel 13(REST API)、PHP 8.5 |
| データベース | MySQL 8.4 |
| 開発環境 | Docker(Laravel Sail) |

## 構成

バックエンド(Laravel)とフロントエンド(Next.js)を分離した構成です。
Next.js のサーバー側から Laravel の API を呼び出してデータを取得・保存しています。

```
.
├── laravel-next-app/    # バックエンド(Laravel API) http://localhost
└── next-frontend-app/   # フロントエンド(Next.js)   http://localhost:3000
```

```
[ブラウザ] ⇄ [Next.js (画面・Server Actions)] ⇄ [Laravel (API)] ⇄ [MySQL]
```

## テーブル設計

| テーブル | 内容 | 主なカラム |
| --- | --- | --- |
| `events` | 予定 | `title`, `starts_at`, `ends_at`, `memo` |
| `members` | 家族メンバー | `name`, `color` |
| `event_member` | 予定とメンバーの中間テーブル(多対多) | `event_id`, `member_id` |

## API

| メソッド | URL | 内容 |
| --- | --- | --- |
| GET | `/api/events?from=YYYY-MM-DD&to=YYYY-MM-DD` | 予定の一覧(期間で絞り込み) |
| POST | `/api/events` | 予定の登録 |
| GET | `/api/events/{id}` | 予定の詳細 |
| PUT | `/api/events/{id}` | 予定の更新 |
| DELETE | `/api/events/{id}` | 予定の削除 |
| GET | `/api/members` | メンバーの一覧 |
| POST | `/api/members` | メンバーの登録 |
| PUT | `/api/members/{id}` | メンバーの更新 |
| DELETE | `/api/members/{id}` | メンバーの削除 |

## 環境構築

### 必要なもの

- Docker Desktop
- Node.js(v20 以上)

### バックエンド(Laravel)

```bash
cd laravel-next-app
cp .env.example .env
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html laravelsail/php84-composer:latest composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed --class=MemberSeeder
```

`.env.example` は Sail(MySQL)用と日本時間(`APP_TIMEZONE=Asia/Tokyo`)の設定になっているので、コピーするだけで動きます。

### フロントエンド(Next.js)

```bash
cd next-frontend-app
npm install
echo "API_URL=http://localhost/api" > .env.local
npm run dev
```

ブラウザで http://localhost:3000 を開くと、カレンダーが表示されます。

## 今後追加したい機能

- [ ] ログイン機能(Laravel Sanctum + NextAuth.js)と、家族ごとのデータの分離
- [ ] 予定ごとの持ち物チェックリスト
- [ ] 予定前日のリマインド通知
- [ ] 毎週の習い事など、繰り返し予定の登録
- [ ] 週表示・日表示