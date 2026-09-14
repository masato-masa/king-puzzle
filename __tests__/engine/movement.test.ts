import { describe, expect, it } from 'vitest';

import { createInitialState } from '@/engine/state';
import { canMove } from '@/engine/movement';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'wall', level: 3 },
    { id: 'd', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
    { a: 'b', b: 'd' },
  ],
};

function setup() {
  return createInitialState({
    board,
    initialPieces: [
      { owner: 'player', isKing: true, level: 2, nodeId: 'a' },
      { owner: 'player', isKing: false, level: 5, nodeId: 'b' },
      { owner: 'enemy', isKing: true, level: 2, nodeId: 'd' },
    ],
    initialCoins: 0,
    attacks: [],
    turnLimit: 10,
  });
}

describe('canMove', () => {
  it('隣接していないノードへは移動できない', () => {
    const state = setup();
    const king = state.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(state, king, 'd')).toBe(false);
  });

  it('自分の駒が居るノードへは移動できない（条件1）', () => {
    const state = setup();
    const king = state.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(state, king, 'b')).toBe(false);
  });

  it('レベル不足の壁へは移動できない（条件2）', () => {
    const state = setup();
    const weak = state.pieces.find((p) => p.owner === 'player' && !p.isKing)!;
    // weak は Lv5 で壁 Lv3 を上回るので壊せる。レベル不足のケースを別途作る。
    const weakState = { ...state, pieces: state.pieces.map((p) => (p.id === weak.id ? { ...p, level: 1 } : p)) };
    const modifiedWeak = weakState.pieces.find((p) => p.id === weak.id)!;
    expect(canMove(weakState, modifiedWeak, 'c')).toBe(false);
  });

  it('king は壁を破れない（条件3）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b' };
    expect(canMove(state, king, 'c')).toBe(false);
  });

  it('king は同レベル以上の敵駒に突っ込めない（条件4）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b' };
    expect(canMove(state, king, 'd')).toBe(false); // 敵king Lv2、自king Lv2
  });

  it('king はレベルが上回る敵駒には突っ込める', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b', level: 3 };
    expect(canMove(state, king, 'd')).toBe(true);
  });

  it('足止め中の駒は移動できない（条件5）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, snared: 1 };
    expect(canMove(state, king, 'b')).toBe(false);
  });

  it('封鎖されたノードには入れない（条件6）', () => {
    const state = { ...setup() };
    const blocked = { ...state, blockades: { b: 2 } };
    const king = blocked.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(blocked, king, 'b')).toBe(false);
  });

  it('king 以外は同レベル以上の敵駒にも突っ込める（削る手）', () => {
    const state = setup();
    const weak = { ...state.pieces.find((p) => p.owner === 'player' && !p.isKing)!, nodeId: 'b', level: 1 };
    // 隣に敵は居ないので b -> d は隣接していない。経路を用意し直す。
    const boardWithDirect: Board = { ...board, edges: [...board.edges, { a: 'b', b: 'd' }] };
    const s2 = { ...state, board: boardWithDirect };
    expect(canMove(s2, weak, 'd')).toBe(true); // 敵king Lv2 >= 自駒Lv1 だが king ではないので許可
  });
});
