/** 「初めて出る仕掛けの一言ヒント」を見たかどうか（KP-24）。面 ID の配列を 1 つのキーに入れる。 */
const KEY = 'king-puzzle:hints-seen:v1';

function readAll(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function hasSeenHint(levelId: string): boolean {
  return readAll().includes(levelId);
}

export function markHintSeen(levelId: string): void {
  try {
    const all = readAll();
    if (!all.includes(levelId)) window.localStorage.setItem(KEY, JSON.stringify([...all, levelId]));
  } catch {
    // 保存できなくてもゲームは続行できる
  }
}

export function clearHintsSeen(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 何もしない
  }
}
