import { describe, expect, it } from 'vitest';

import { getNode, isImpassable, neighbors, shortestDistance } from '@/engine/board';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'wall', level: 2 },
    { id: 'd', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
    { a: 'c', b: 'd' },
    { a: 'b', b: 'd' },
  ],
};

describe('board', () => {
  it('getNode は存在するノードを返す', () => {
    expect(getNode(board, 'a').type).toBe('road');
  });

  it('getNode は存在しないノードで例外を投げる', () => {
    expect(() => getNode(board, 'zzz')).toThrow();
  });

  it('neighbors は両方向のエッジを見る', () => {
    expect(neighbors(board, 'b').sort()).toEqual(['a', 'c', 'd']);
  });

  it('未破壊の壁は通れないノードとして扱う', () => {
    expect(isImpassable(getNode(board, 'c'), new Set())).toBe(true);
    expect(isImpassable(getNode(board, 'a'), new Set())).toBe(false);
  });

  it('shortestDistance は壁を迂回する', () => {
    // a-b-c-d は壁で塞がるが、a-b-d は通れる
    expect(shortestDistance(board, 'a', 'd', new Set())).toBe(2);
  });

  it('shortestDistance は封鎖ノードも迂回する', () => {
    expect(shortestDistance(board, 'a', 'd', new Set(['b']))).toBeNull();
  });

  it('到達できないときは null', () => {
    const isolated: Board = {
      nodes: [
        { id: 'x', type: 'road', level: 0 },
        { id: 'y', type: 'road', level: 0 },
      ],
      edges: [],
    };
    expect(shortestDistance(isolated, 'x', 'y', new Set())).toBeNull();
  });
});
