import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Game } from '../types';
import { saveGamesToGitHub } from '../utils/githubApi';

interface EditViewProps {
  initialGames: Game[];
  onNavigateToCalendar: () => void;
  onSaveSuccess: (updatedGames: Game[]) => void;
}

const EditView: React.FC<EditViewProps> = ({ initialGames, onNavigateToCalendar, onSaveSuccess }) => {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [githubToken, setGithubToken] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // フォームの状態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');

  // 初回マウント時にLocalStorageから設定を読み込む
  useEffect(() => {
    const savedToken = localStorage.getItem('gc_github_token') || '';
    const savedOwner = localStorage.getItem('gc_repo_owner') || '';
    const savedRepo = localStorage.getItem('gc_repo_name') || '';
    setGithubToken(savedToken);
    setRepoOwner(savedOwner);
    setRepoName(savedRepo);
  }, []);

  // 設定の保存処理
  const handleSaveSettings = () => {
    localStorage.setItem('gc_github_token', githubToken);
    localStorage.setItem('gc_repo_owner', repoOwner);
    localStorage.setItem('gc_repo_name', repoName);
    alert('設定を保存しました。');
  };

  // ゲームデータの追加・更新
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !releaseDate) return;

    if (editingId) {
      // 更新
      setGames(games.map(g => g.id === editingId ? { id: editingId, title, releaseDate } : g));
      setEditingId(null);
    } else {
      // 追加
      setGames([...games, { id: uuidv4(), title, releaseDate }]);
    }
    
    setTitle('');
    setReleaseDate('');
  };

  // ゲームの編集
  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    setTitle(game.title);
    setReleaseDate(game.releaseDate);
  };

  // ゲームの削除
  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      setGames(games.filter(g => g.id !== id));
    }
  };

  // GitHubへの保存処理
  const handleSaveToGitHub = async () => {
    if (!githubToken || !repoOwner || !repoName) {
      setSaveMessage({ type: 'error', text: 'GitHubの設定が未入力です。' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveGamesToGitHub(
        repoOwner,
        repoName,
        'src/data/games.json',
        githubToken,
        games
      );
      setSaveMessage({ type: 'success', text: 'GitHubへの保存に成功しました！' });
      onSaveSuccess(games);
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || '保存に失敗しました。' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">データ編集画面 (管理者用)</h1>
          <button 
            onClick={onNavigateToCalendar}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            カレンダーへ戻る
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左カラム：設定とフォーム */}
          <div className="md:col-span-1 space-y-6">
            {/* GitHub設定 */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">GitHub連携設定</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner (ユーザー名)</label>
                  <input 
                    type="text" 
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="例: octocat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Repository (リポジトリ名)</label>
                  <input 
                    type="text" 
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="例: GameCalender"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Personal Access Token</label>
                  <input 
                    type="password" 
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="ghp_xxxxxxxxxxxx"
                  />
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="w-full py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded font-medium transition-colors"
                >
                  設定をブラウザに保存
                </button>
              </div>
            </div>

            {/* データ入力フォーム */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                {editingId ? 'データの編集' : 'データの追加'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ゲームタイトル</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="タイトルを入力"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">リリース日</label>
                  <input 
                    type="date" 
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full text-sm p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
                  >
                    {editingId ? '更新する' : '追加する'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setTitle('');
                        setReleaseDate('');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* 右カラム：データ一覧 */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold">登録データ一覧</h2>
                <span className="text-sm text-gray-500">{games.length}件</span>
              </div>
              
              <div className="flex-1 overflow-auto max-h-[400px]">
                {games.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">データがありません。</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {games.map(game => (
                      <li key={game.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors">
                        <div>
                          <p className="font-medium text-gray-800">{game.title}</p>
                          <p className="text-xs text-gray-500">リリース: {game.releaseDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(game)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            編集
                          </button>
                          <button 
                            onClick={() => handleDelete(game.id)}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                {saveMessage && (
                  <div className={`p-3 mb-4 text-sm rounded-lg ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {saveMessage.text}
                  </div>
                )}
                <button 
                  onClick={handleSaveToGitHub}
                  disabled={isSaving}
                  className={`w-full py-3 text-sm font-bold text-white rounded-lg shadow-sm transition-all
                    ${isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-md'
                    }`}
                >
                  {isSaving ? 'GitHubへ保存中...' : '変更をGitHubに保存'}
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  ※保存すると `games.json` がコミットされ、自動的にサイトが再ビルドされます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditView;
