import { describe, expect, it } from 'vitest';

import { applyAttackPhase, resolveTrackingTarget } from '@/engine/attacks';
import { createInitialState } from '@/engine/state';
import type { AttackDef, Board } from '@/engine/types';

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

describe('resolveTrackingTarget', () => {
  it('king ルールは自分のkingの現在地を返す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'king')).toBe('b');
  });

  it('highest-level ルールは同率ならノードID昇順', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'c' },
        { owner: 'player', isKing: false, level: 3, nodeId: 'a' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'highest-level')).toBe('a');
  });

  it('nearest-to-enemy ルールは敵kingに一番近い自駒を返す', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'a' },
        { owner: 'player', isKing: false, level: 1, nodeId: 'b' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'c' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'nearest-to-enemy')).toBe('b');
  });
});

describe('applyAttackPhase', () => {
  const arrow: AttackDef = { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'b' }, period: 3 };

  it('カウントが0になった攻撃を発火し、period に戻す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces[0].level).toBe(2);
    expect(result.state.attackStates).toEqual([{ remaining: 3 }]);
  });

  it('弓は Lv1 の駒を消す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(0);
  });

  it('大砲はレベルに関わらず消す', () => {
    const cannon: AttackDef = { id: 'c1', type: 'cannon', target: { kind: 'node', nodeId: 'b' }, period: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 9, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [cannon],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(0);
  });

  it('足止めは対象を snared にし、今ラウンドは減算対象から除く', () => {
    const snare: AttackDef = { id: 's1', type: 'snare', target: { kind: 'node', nodeId: 'b' }, period: 4, duration: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [snare],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces[0].snared).toBe(2);
    expect(result.freshSnaredPieceIds.has(result.state.pieces[0].id)).toBe(true);
  });

  it('封鎖は駒が居なくても効き、ノードIDを記録する', () => {
    const blockade: AttackDef = {
      id: 'bl1',
      type: 'blockade',
      target: { kind: 'node', nodeId: 'c' },
      period: 3,
      duration: 2,
    };
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [blockade],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.blockades.c).toBe(2);
    expect(result.freshBlockadeNodeIds.has('c')).toBe(true);
  });

  it('対象ノードに敵駒が居ても何も起きない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'enemy', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(1);
  });

  it('発火していない攻撃はカウントを1減らすだけ', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const result = applyAttackPhase(state); // remaining は period=3 で始まる
    expect(result.state.attackStates).toEqual([{ remaining: 2 }]);
  });
});
