import { addMonths, getDate, getMonth } from 'date-fns';
import { Game, CalendarEvent } from '../types';

/**
 * 指定した日付（年月日は無視し、月・日のみ）がアニバーサリーかどうか判定する
 * @param targetDate カレンダー上で判定対象となる日付
 * @param releaseDate ゲームのリリース日
 * @returns 一致する場合はtrue
 */
export const isAnniversary = (targetDate: Date, releaseDate: Date): boolean => {
  return getMonth(targetDate) === getMonth(releaseDate) && getDate(targetDate) === getDate(releaseDate);
};

/**
 * 指定した日付がハーフアニバーサリー（半年後）かどうか判定する
 * 月末補正ロジックを内包（例: 8/31の半年後は2/28 または 2/29）
 * @param targetDate カレンダー上で判定対象となる日付
 * @param releaseDate ゲームのリリース日
 * @returns 一致する場合はtrue
 */
export const isHalfAnniversary = (targetDate: Date, releaseDate: Date): boolean => {
  // targetDateの年のリリース日を基準として計算する
  // 閏年などの影響を正しく反映させるため、判定対象の年を使用
  const releaseDateInTargetYear = new Date(targetDate.getFullYear(), getMonth(releaseDate), getDate(releaseDate));
  
  // リリース日から6ヶ月後を計算
  const halfAnnivDate = addMonths(releaseDateInTargetYear, 6);

  // もし元のリリース日が月末だった場合、date-fnsのaddMonthsは
  // 必要に応じて月末に丸めてくれる（例: 8/31 -> 2/28）
  // そのため、月と日が一致するかどうかを判定すればよい
  return getMonth(targetDate) === getMonth(halfAnnivDate) && getDate(targetDate) === getDate(halfAnnivDate);
};

/**
 * 対象の日付に該当する全イベント（アニバーサリー・ハーフアニバーサリー）を取得する
 * @param targetDate 判定対象の日付
 * @param games 全ゲームデータ
 * @returns イベントの配列
 */
export const getEventsForDate = (targetDate: Date, games: Game[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  games.forEach(game => {
    // 文字列 "YYYY-MM-DD" から Dateオブジェクトを作成 (時間は00:00:00)
    // ハイフン区切りだとUTC扱いになるブラウザの差異を防ぐため、安全にパース
    const [year, month, day] = game.releaseDate.split('-').map(Number);
    const releaseDateObj = new Date(year, month - 1, day);

    // アニバーサリー判定
    if (isAnniversary(targetDate, releaseDateObj)) {
      events.push({
        gameId: game.id,
        title: game.title,
        type: 'anniversary',
        label: `${game.title} 周年`
      });
    }

    // ハーフアニバーサリー判定
    if (isHalfAnniversary(targetDate, releaseDateObj)) {
      events.push({
        gameId: game.id,
        title: game.title,
        type: 'half-anniversary',
        label: `${game.title} ハーフ`
      });
    }
  });

  return events;
};
