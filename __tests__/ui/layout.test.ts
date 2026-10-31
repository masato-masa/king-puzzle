import { describe, expect, it } from 'vitest';

import { computeLayout, fitLayout } from '@/ui/board/layout';
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

describe('fitLayout', () => {
  const line = computeLayout(board, 'a');

  it('縦長の枠では縦に並べ、root を下に置く', () => {
    const fitted = fitLayout(line, 343, 500);
    expect(fitted.vertical).toBe(true);
    expect(fitted.positions.a.y).toBeGreaterThan(fitted.positions.c.y);
  });

  it('横長の枠では横に並べたまま', () => {
    expect(fitLayout(line, 600, 200).vertical).toBe(false);
  });

  it('設計より大きくはしない', () => {
    expect(fitLayout(line, 4000, 4000).scale).toBe(1);
  });

  it('盤が枠に収まる', () => {
    const f = fitLayout(line, 200, 150);
    expect(f.width * f.scale).toBeLessThanOrEqual(200 + 1e-6);
    expect(f.height * f.scale).toBeLessThanOrEqual(150 + 1e-6);
  });
});

describe('広い盤でも駒の絵が重ならない（KP-1）', () => {
  /** rows × cols の格子の盤。 */
  const grid = (rows: number, cols: number): Board => {
    const id = (r: number, c: number) => `r${r}c${c}`;
    const nodes: Board['nodes'] = [];
    const edges: Board['edges'] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({ id: id(r, c), type: 'road', level: 0 });
        if (c > 0) edges.push({ a: id(r, c - 1), b: id(r, c) });
        if (r > 0) edges.push({ a: id(r - 1, c), b: id(r, c) });
      }
    }
    return { nodes, edges };
  };
  /** 駒の絵の幅（styles.css の .kp-piece、倍率 1 のとき）。 */
  const SPRITE = 62;

  for (const [rows, cols] of [[3, 3], [4, 5], [5, 5], [5, 7]]) {
    it(`${rows}×${cols} を 343×420 の枠に置く`, () => {
      const f = fitLayout(computeLayout(grid(rows, cols), 'r0c0'), 343, 420);
      const pts = Object.values(f.positions);
      let nearest = Infinity;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++)
          nearest = Math.min(nearest, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      expect(nearest * f.scale).toBeGreaterThanOrEqual(SPRITE * f.scale);
    });
  }
});
