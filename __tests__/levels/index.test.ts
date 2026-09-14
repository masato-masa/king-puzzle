import { describe, expect, it } from 'vitest';

import { LEVELS, chapters, getLevel, getNextLevel } from '@/levels/index';

describe('levels index', () => {
  it('3レベルすべて登録されている', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['ch1-1', 'ch2-1', 'ch3-1']);
  });

  it('getLevel はIDで引ける', () => {
    expect(getLevel('ch2-1')?.chapter).toBe(2);
  });

  it('getNextLevel は次のレベルを返し、最後は undefined', () => {
    expect(getNextLevel('ch1-1')?.id).toBe('ch2-1');
    expect(getNextLevel('ch3-1')).toBeUndefined();
  });

  it('chapters は章番号順、章内は order 順でグループ化する', () => {
    const groups = chapters();
    expect(groups.map((g) => g.chapter)).toEqual([1, 2, 3]);
    expect(groups[0].levels.map((l) => l.id)).toEqual(['ch1-1']);
  });
});
