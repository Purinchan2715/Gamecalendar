// ゲームデータの型定義
export interface Game {
  id: string;         // UUID: 各ゲームを一意に識別するID
  title: string;      // ゲームタイトル
  releaseDate: string; // リリース日 (YYYY-MM-DD形式)
}

// カレンダーに表示するイベントの型定義
export interface CalendarEvent {
  gameId: string;     // 対応するゲームのID
  title: string;      // ゲームタイトル
  type: 'anniversary' | 'half-anniversary'; // イベント種別
  label: string;      // 表示テキスト（例: "ゲームA 周年"）
}

// GitHub APIのコンテンツレスポンス型
export interface GitHubContent {
  sha: string;        // ファイルのSHA（更新時に必要）
  content: string;    // Base64エンコードされたファイル内容
  encoding: string;
}
