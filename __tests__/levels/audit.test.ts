import { describe, expect, it } from 'vitest';

import { LEVELS } from '@/levels/index';
import { MIN_PIECE_PX, piecePx } from '../../scripts/audit-levels';
import { solve } from '../../scripts/solveLevel';

describe('全面の監査', () => {
  it.each(LEVELS)('$id: ソルバーで解け、tStar が実測と一致し、最短解に強制スキップが無い', (level) => {
    const result = solve(level);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBe(level.tStar);
    expect(result!.path.some((a) => a.kind === 'forced-skip')).toBe(false);
  });

  // KP-6: 盤の広さは「狭いスマホ（343×420 の枠）で駒が 40px 以上」に収める。面作りの基準。
  it.each(LEVELS)('$id: 狭いスマホでも駒が 40px 以上', (level) => {
    expect(piecePx(level)).toBeGreaterThanOrEqual(MIN_PIECE_PX);
  });
});
