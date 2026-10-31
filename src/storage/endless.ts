/** むげんの進み具合。どこまで進んだか（次に遊ぶ番号）と、面ごとの最高の★。 */
export interface EndlessProgress {
  /** 次に遊ぶ面の番号（1 から）。クリアした最大の番号 + 1。 */
  next: number;
  best: Record<number, 1 | 2 | 3>;
}

const KEY = 'king-puzzle:endless:v1';

export function getEndlessProgress(): EndlessProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { next: 1, best: {} };
    const parsed = JSON.parse(raw) as Partial<EndlessProgress>;
    const next = Number.isInteger(parsed.next) && parsed.next! >= 1 ? parsed.next! : 1;
    return { next, best: typeof parsed.best === 'object' && parsed.best ? parsed.best : {} };
  } catch {
    return { next: 1, best: {} };
  }
}

export function recordEndlessClear(n: number, stars: 1 | 2 | 3): void {
  const p = getEndlessProgress();
  p.next = Math.max(p.next, n + 1);
  p.best[n] = Math.max(p.best[n] ?? 0, stars) as 1 | 2 | 3;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 保存できなくても遊べる
  }
}

export function clearEndlessProgress(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 何もしない
  }
}
