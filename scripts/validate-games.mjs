import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesPath = path.resolve(__dirname, '../src/data/games.json');

try {
  const raw = fs.readFileSync(gamesPath, 'utf8');
  const games = JSON.parse(raw);

  if (!Array.isArray(games)) {
    throw new Error('games.json のトップレベルは配列である必要があります。');
  }

  const invalid = games.filter((game) => {
    const isValidObject = game && typeof game === 'object' && !Array.isArray(game);
    if (!isValidObject) return true;

    const titleOk = typeof game.title === 'string' && game.title.trim().length > 0;
    const dateOk = typeof game.releaseDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(game.releaseDate);
    return !(titleOk && dateOk);
  });

  if (invalid.length > 0) {
    console.error('Invalid entries found:');
    console.error(JSON.stringify(invalid, null, 2));
    process.exit(1);
  }

  console.log(`games.json validation passed (${games.length} entries).`);
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}
