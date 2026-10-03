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