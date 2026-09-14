import { describe, expect, it } from 'vitest';

import { resolveCombat } from '@/engine/combat';

describe('resolveCombat', () => {
  it('攻撃側が高ければ勝ち、レベル差だけ残る', () => {
    expect(resolveCombat(3, 2)).toEqual({ winner: 'attacker', survivorLevel: 1 });
  });

  it('防御側が高ければ防御側が勝ち、レベル差だけ残る', () => {
    expect(resolveCombat(2, 5)).toEqual({ winner: 'defender', survivorLevel: 3 });
  });

  it('同レベルなら相打ち', () => {
    expect(resolveCombat(4, 4)).toEqual({ winner: 'mutual' });
  });
});
