import { beforeEach, describe, expect, it } from 'vitest';

import { hashFor, parseRoute } from '@/core/router';
import { clearEndlessProgress, getEndlessProgress, recordEndlessClear } from '@/storage/endless';

describe('むげんの進み具合', () => {
  beforeEach(() => clearEndlessProgress());

  it('はじめは 1 面目から', () => {
    expect(getEndlessProgress()).toEqual({ next: 1, best: {} });
  });

  it('クリアすると次の番号へ進み、前の面を遊び直しても戻らない', () => {
    recordEndlessClear(1, 2);
    recordEndlessClear(2, 3);
    recordEndlessClear(1, 3);
    expect(getEndlessProgress()).toEqual({ next: 3, best: { 1: 3, 2: 3 } });
  });

  it('★は良い方を残す', () => {
    recordEndlessClear(5, 3);
    recordEndlessClear(5, 1);
    expect(getEndlessProgress().best[5]).toBe(3);
  });
});

describe('むげんの道順', () => {
  it('#/endless/15 を読み書きできる', () => {
    expect(parseRoute('#/endless/15')).toEqual({ name: 'endless', n: 15 });
    expect(hashFor({ name: 'endless', n: 15 })).toBe('#/endless/15');
  });

  it('おかしな番号はホームへ', () => {
    expect(parseRoute('#/endless/0')).toEqual({ name: 'home' });
    expect(parseRoute('#/endless/abc')).toEqual({ name: 'home' });
  });
});
