export interface LevelProgress {
  cleared: boolean;
  bestStars: 0 | 1 | 2 | 3;
  bestTurns?: number;
}

const KEY = 'king-puzzle:progress:v1';

type ProgressMap = Record<string, LevelProgress>;

function readAll(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

function writeAll(data: ProgressMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 保存できなくてもゲーム自体は続行できる
  }
}

export function getProgress(levelId: string): LevelProgress {
  return readAll()[levelId] ?? { cleared: false, bestStars: 0 };
}

export function recordClear(levelId: string, stars: 1 | 2 | 3, turns: number): void {
  const all = readAll();
  const current = all[levelId] ?? { cleared: false, bestStars: 0 as const };
  all[levelId] = {
    cleared: true,
    bestStars: Math.max(current.bestStars, stars) as 0 | 1 | 2 | 3,
    bestTurns: current.bestTurns !== undefined ? Math.min(current.bestTurns, turns) : turns,
  };
  writeAll(all);
}

export function isChapterUnlocked(chapter: number, levelIdsInPreviousChapter: string[]): boolean {
  if (chapter <= 1) return true;
  if (levelIdsInPreviousChapter.length === 0) return true;
  const all = readAll();
  const clearedCount = levelIdsInPreviousChapter.filter((id) => all[id]?.cleared).length;
  return clearedCount / levelIdsInPreviousChapter.length >= 0.7;
}

export function clearAllProgress(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 何もしない
  }
}
