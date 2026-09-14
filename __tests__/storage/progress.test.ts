import { beforeEach, describe, expect, it } from 'vitest';

import { getProgress, isChapterUnlocked, recordClear } from '@/storage/progress';

beforeEach(() => {
  window.localStorage.clear();
});

describe('progress storage', () => {
  it('未クリアの初期値', () => {
    expect(getProgress('x')).toEqual({ cleared: false, bestStars: 0 });
  });

  it('クリアを記録し、ベストのみ保持する', () => {
    recordClear('x', 2, 12);
    recordClear('x', 3, 10); // より良い記録
    recordClear('x', 1, 20); // より悪い記録は上書きしない
    const p = getProgress('x');
    expect(p.cleared).toBe(true);
    expect(p.bestStars).toBe(3);
    expect(p.bestTurns).toBe(10);
  });

  it('章1は常に解放されている', () => {
    expect(isChapterUnlocked(1, [])).toBe(true);
  });

  it('前章がなければ解放されている', () => {
    expect(isChapterUnlocked(2, [])).toBe(true);
  });

  it('前章の7割未満クリアでは解放されない', () => {
    recordClear('a', 1, 5);
    expect(isChapterUnlocked(2, ['a', 'b', 'c'])).toBe(false); // 1/3
  });

  it('前章の7割以上クリアで解放される', () => {
    recordClear('a', 1, 5);
    recordClear('b', 1, 5);
    recordClear('c', 1, 5);
    expect(isChapterUnlocked(2, ['a', 'b', 'c'])).toBe(true); // 3/3
  });
});
