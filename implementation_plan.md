# アーキテクチャ分離・再設計計画

セキュリティ向上および将来の拡張性（複数サイトの管理）を見据え、現在の「閲覧＋管理一体型」のアプリを、**「公開用アプリ」**と**「管理用ダッシュボード（新リポジトリ）」**の2つに分離します。

## アーキテクチャの概要

管理用アプリは「ヘッドレスCMS（データだけを管理・配信するシステム）」のように振る舞い、GitHub API を通じて各公開サイトのリポジトリにある JSON データを更新します。

### 1. 公開用リポジトリ (現在の `GameCalender`)
*   **役割**: データを読み込んでカレンダーを表示するだけの純粋な閲覧アプリ。
*   **データ**: 自身の `src/data/games.json` を読み込む（変更なし）。
*   **ホスティング**: 現在の通り GitHub Pages ＋ GitHub Actions。
*   **変更点**: 管理画面（`EditView`）や隠しボタン、GitHub API連携ロジックをすべて**削除**し、ソースコードを軽量化・安全化します。

### 2. 管理用リポジトリ (新規作成: 例 `AdminDashboard`)
*   **役割**: 将来的に複数のアプリのデータを一元管理できる統合ダッシュボード。
*   **ホスティング**: Cloudflare Pages にデプロイし、Cloudflare Access (Zero Trust) でメール認証などの**強固なアクセス制限**をかけます。
*   **構造**: 
    *   画面左側にサイドバー（メニュー）を配置し、将来「ゲームカレンダー」「別のアプリA」と切り替えられるような拡張性のあるUI設計（ルーターまたはステート管理）にします。
    *   今回は最初の機能として「ゲームカレンダー管理」モジュールを実装します。
*   **データ更新方式**: 画面から入力されたデータを GitHub API で `Purinchan2715/Gamecalendar` リポジトリの `src/data/games.json` にコミットします（これにより、公開側でActionsが走り自動デプロイされます）。

---

## 具体的な作業ステップ

### Phase 1: 現在のアプリ（GameCalender）の軽量化
1.  `src/components/EditView.tsx`, `src/utils/githubApi.ts` を削除。
2.  `src/App.tsx`, `src/components/CalendarView.tsx` から編集画面への遷移ロジック（トリプルクリックやURLパラメータ判定）を削除。
3.  変更をコミットして GitHub にプッシュ。

### Phase 2: 新規管理用アプリ（AdminDashboard）の構築
1.  ローカルに新しいフォルダ（例: `c:\Users\murata\Desktop\個人開発\AdminDashboard`）を作成。
2.  Vite + React + TypeScript + Tailwind CSS で初期化。
3.  **UI設計**:
    *   `Sidebar`: メニュー（現在は「ゲームカレンダー」のみ、将来追加可能）。
    *   `DashboardLayout`: 全体のレイアウト枠。
4.  **機能実装**:
    *   現在の `EditView.tsx` の機能（一覧表示、追加、編集、削除）を `GameCalendarManager` コンポーネントとして移植。
    *   `githubApi.ts` を移植し、更新対象のリポジトリを `Purinchan2715/Gamecalendar` に向ける設定フォームを実装。

### Phase 3: Cloudflare へのデプロイ準備
*   ローカルでの動作確認完了後、新規リポジトリとして GitHub にプッシュ。
*   （その後、ユーザー様にて Cloudflare Pages への連携と Access の設定を行っていただきます）

---

## ユーザー確認事項 (User Review Required)

> [!IMPORTANT]
> **管理用アプリのフォルダ名・リポジトリ名**
> 新しく作成する管理用アプリのフォルダ名は `AdminDashboard` で進めてよろしいでしょうか？（変更希望があればお知らせください）

> [!NOTE]
> **将来の拡張性について**
> 今回は React Router は使わず、シンプルな State（状態）による画面切り替えでサイドバーを実装する予定です（将来的に画面が増えたタイミングで Router を導入する方針）。これでよろしいでしょうか？

この分離計画で問題なければ「承認（Proceed）」をお願いします。Phase 1（現在のアプリの軽量化）から作業を開始します！
