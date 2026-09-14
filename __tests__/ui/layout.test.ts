import { describe, expect, it } from 'vitest';

import { computeLayout } from '@/ui/board/layout';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
  ],
};

describe('computeLayout', () => {
  it('root からの距離が離れるほど x が大きくなる', () => {
    const positions = computeLayout(board, 'a');
    expect(positions.a.x).toBeLessThan(positions.b.x);
    expect(positions.b.x).toBeLessThan(positions.c.x);
  });

  it('すべてのノードに座標が付く', () => {
    const positions = computeLayout(board, 'a');
    expect(Object.keys(positions).sort()).toEqual(['a', 'b', 'c']);
  });

  it('同じ盤面・同じ root なら毎回同じ座標になる（決定的）', () => {
    expect(computeLayout(board, 'a')).toEqual(computeLayout(board, 'a'));
  });
});
