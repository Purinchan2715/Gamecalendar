import { Game, GitHubContent } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * リポジトリ上の data.json の最新の SHA を取得する
 */
export const getFileSha = async (owner: string, repo: string, path: string, token: string): Promise<string> => {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file info: ${response.status} ${response.statusText}`);
  }

  const data: GitHubContent = await response.json();
  return data.sha;
};

/**
 * games.json を GitHub にコミット（保存）する
 */
export const saveGamesToGitHub = async (
  owner: string, 
  repo: string, 
  path: string, 
  token: string, 
  games: Game[]
): Promise<void> => {
  try {
    // 1. 現在のファイルのSHAを取得
    const sha = await getFileSha(owner, repo, path, token);

    // 2. データを整形してBase64にエンコード
    // 日本語が含まれるため、TextEncoderを使用して正しくエンコードする
    const jsonString = JSON.stringify(games, null, 2);
    const encodedContent = btoa(
      new Uint8Array(new TextEncoder().encode(jsonString))
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // 3. ファイルを更新（コミット）
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
    const commitData = {
      message: 'Update games.json via Web App',
      content: encodedContent,
      sha: sha,
      branch: 'main'
    };

    const updateResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commitData),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Failed to commit: ${errorData.message || updateResponse.statusText}`);
    }
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    throw error;
  }
};
