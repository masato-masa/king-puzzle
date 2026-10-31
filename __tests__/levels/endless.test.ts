import { describe, expect, it } from 'vitest';

import { solve } from '@/engine/solver';
import { generateEndless, maxRandomRate, targetRange } from '@/levels/endless';
import { LEVELS } from '@/levels/index';
import { MIN_PIECE_PX, piecePx, randomWinRate } from '@/levels/metrics';

describe('むげんの生成器', () => {
  it('同じ番号からは同じ面が出る（種は番号だけで決まる）', () => {
    expect(JSON.stringify(generateEndless(7).level)).toBe(JSON.stringify(generateEndless(7).level));
  });

  it('番号が違えば違う面が出る', () => {
    const a = JSON.stringify(generateEndless(3).level.board);
    const b = JSON.stringify(generateEndless(4).level.board);
    expect(a).not.toBe(b);
  });

  it.each([1, 2, 5, 15, 30, 60, 100])('%i 面目: 解け、T* が狙いの範囲、当てずっぽうで勝てず、駒が押せる', (n) => {
    const { level, stage } = generateEndless(n);
    expect(stage).toBe(0);
    const result = solve(level, 20);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBe(level.tStar);
    expect(result!.path.some((a) => a.kind === 'forced-skip')).toBe(false);
    const { lo, hi } = targetRange(n);
    expect(level.tStar).toBeGreaterThanOrEqual(lo);
    expect(level.tStar).toBeLessThanOrEqual(hi);
    // 生成時は 300 回で選別。別の種の 1000 回で測っても上限の 1.5 倍に収まる
    expect(randomWinRate(level, 1000, 99)).toBeLessThanOrEqual(maxRandomRate(n) * 1.5);
    expect(piecePx(level)).toBeGreaterThanOrEqual(MIN_PIECE_PX);
    expect(level.id).toBe(`endless-${n}`);
    expect(level.order).toBe(n);
  });

  it('予算 0 でも最終段（本編の面そのまま）で必ず面が出る', () => {
    for (const n of [1, 10, 50, 1000]) {
      const r = generateEndless(n, 0);
      expect(r.stage).toBe(3);
      expect(r.attempts).toBe(0);
      const base = LEVELS.find((l) => l.id === r.baseId)!;
      expect(r.level.board).toEqual(base.board);
      expect(solve(r.level, 20)!.tStar).toBe(r.level.tStar);
    }
  });

  it('予算をごく小さくしても、どこかの段で必ず面が出る', () => {
    for (let n = 1; n <= 20; n++) {
      const r = generateEndless(n, 1);
      expect(solve(r.level, 20)!.tStar).toBe(r.level.tStar);
    }
  });
});
