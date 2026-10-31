import { describe, expect, it } from 'vitest';

import { LEVELS, chapters, getLevel, getNextLevel } from '@/levels/index';

describe('levels index', () => {
  it('ID が重複せず、章・order の順に並んでいる', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = LEVELS.map((l) => l.chapter * 100 + l.order);
    expect([...keys].sort((a, b) => a - b)).toEqual(keys);
    for (const l of LEVELS) expect(l.id).toBe(`ch${l.chapter}-${l.order}`);
  });

  it('getLevel はIDで引ける', () => {
    expect(getLevel('ch2-1')?.chapter).toBe(2);
  });

  it('getNextLevel は次のレベルを返し、最後は undefined', () => {
    expect(getNextLevel('ch1-1')?.id).toBe('ch1-2');
    expect(getNextLevel(LEVELS[LEVELS.length - 1].id)).toBeUndefined();
  });

  it('chapters は章番号順、章内は order 順でグループ化する', () => {
    const groups = chapters();
    expect(groups.map((g) => g.chapter)).toEqual([...new Set(LEVELS.map((l) => l.chapter))]);
    expect(groups[0].levels.map((l) => l.id)).toEqual(['ch1-1', 'ch1-2']);
  });
});
