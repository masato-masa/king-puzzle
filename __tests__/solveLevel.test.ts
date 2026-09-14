import { describe, expect, it } from 'vitest';

import { ch1_1 } from '@/levels/chapter1';
import { ch2_1 } from '@/levels/chapter2';
import { ch3_1 } from '@/levels/chapter3';
import { solve } from '../scripts/solveLevel';

describe('solve', () => {
  it('章1: king の直進3手で勝てる', () => {
    const result = solve(ch1_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBe(ch1_1.tStar);
  });

  it('章2: 訓練場で1段だけ育てれば勝てる', () => {
    const result = solve(ch2_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBe(ch2_1.tStar);
  });

  it('章3: 足踏みで施設を上げてから育てれば勝てる', () => {
    const result = solve(ch3_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBe(ch3_1.tStar);
  });
});
