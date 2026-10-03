# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## プロジェクト概要

`task-kanban` は Create Next App で作成した Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4 のプロジェクトです。現状は初期テンプレートのままで、`src/app/page.tsx` がトップページです。

- Next.js は 16.x で、学習済みの知識と API・規約が異なる可能性があります。コードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読んでください（AGENTS.md の指示）。
- パスエイリアス: `@/*` → `src/*`（`tsconfig.json`）

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run lint       # ESLint
npm test           # Vitest（watch モード）
npm run test:run   # Vitest（1 回だけ実行）
npx vitest run __tests__/page.test.tsx          # 単一ファイルのテスト実行
npx vitest run -t "テスト名の一部"               # テスト名で絞り込み
```

## Supabase 接続

- クライアントは `src/lib/supabase.ts` の `supabase`（`@supabase/supabase-js` の `createClient`）を `@/lib/supabase` から import して使います。他の場所で `createClient` を再作成しないでください。
- 環境変数の定義（変数名のみ）は `.env.example` に書き、git 管理します。実際の値は `.env.local` にあります（`.env*` は git 管理外。`.env.example` のみ例外）。新しい変数を追加するときは `.env.example` にも変数名を追加してください。
  - `NEXT_PUBLIC_SUPABASE_URL`: プロジェクト URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key（ブラウザに公開される前提のキー。secret key は `NEXT_PUBLIC_` を付けず、クライアントコードで使わないでください）
- どちらかが未設定だと `src/lib/supabase.ts` は import 時に例外を投げます。テストで import する場合は環境変数を設定するか、外部依存としてモック化してください。
- `src/instrumentation.ts` は Node.js ランタイムの起動時に `/auth/v1/health` へ疎通確認を行います。失敗時（環境変数未設定・HTTP エラー・例外）のみ `[Supabase] 接続失敗…` をログ出力し、成功時は何も出力しません。
- `.mcp.json` に Supabase MCP（`https://mcp.supabase.com/mcp`）を設定済みです。スキーマ確認・SQL 実行・型生成などはこの MCP を使います。スキーマ変更前は `list_tables` で現状を確認してください。
- `.env.local` 変更後は開発サーバーを再起動してください（環境変数は起動時に読み込まれるため）。

## テスト

- Vitest + React Testing Library（環境は jsdom）。設定は `vitest.config.mts`、テストは `__tests__/` に置きます。
- `vitest.config.mts` で `pool: 'forks'` を指定しています。デフォルトの threads プールだと、この環境ではワーカー起動がタイムアウトしたためです。
- 実行は 1 回あたり約 60 秒かかることがあります（OneDrive 配下・日本語を含むパスの影響の可能性）。
- Vitest は `async` な Server Component をサポートしないため、それらは E2E テストで確認します。
- `@types/node` は Vitest の peer 依存の都合で ^22 以上にしています。

##コーディングルール
変更後は必ず'npm test'でテストが通ることを確認してください
変更は一つの確認ごとに絞り、小さい単位で行ってください
指示された範囲外のコードを変更しないでください

##コーディング規約
コンポーネントは関数コンポーネントで記述してください
変数名、関数名はキャメルケースで書いてください
コミットメッセージは日本語で書いてください

##テストルール
網羅性: 正常性、異常系、境界値を検討してください
可読性: テスト名に条件と期待する結果を明示してください
保守性: 実装の内部構造ではなくユーザーから見た振る舞いをテストしてください
独立性: テスト間で上体を共有しないでください
状態遷移: 画面遷移の順方向、逆方向を検証してください
モック方針: 外部依存のみモック化してください

##禁止事項
console.logを本番コードに残さないでください
既存のテストを削除しないでください
any型を使用しないでください

## MCP活用ルール
Next.js、Supabase、Vitestなどの最新使用はcontext7 MCPをつかって公式ドキュメントを確認してください