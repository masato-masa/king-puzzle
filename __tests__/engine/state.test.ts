import { describe, expect, it } from 'vitest';

import { createInitialState, serializeState } from '@/engine/state';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'n1', type: 'road', level: 0 },
    { id: 'n2', type: 'road', level: 0 },
  ],
  edges: [{ a: 'n1', b: 'n2' }],
};

describe('createInitialState', () => {
  it('king を含む駒を配置し、round=1・status=playing で始まる', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'n2' },
      ],
      initialCoins: 3,
      attacks: [],
      turnLimit: 10,
    });

    expect(state.round).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.coins).toBe(3);
    expect(state.pieces).toHaveLength(2);
    expect(state.pieces.find((p) => p.owner === 'player')?.level).toBe(2);
  });

  it('attackStates の初期カウントは initial（省略時は period）', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [
        { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'n1' }, period: 4 },
        { id: 'a2', type: 'cannon', target: { kind: 'node', nodeId: 'n2' }, period: 4, initial: 1 },
      ],
      turnLimit: 10,
    });

    expect(state.attackStates).toEqual([{ remaining: 4 }, { remaining: 1 }]);
  });

  it('盤面を書き換えても入力の board は変わらない（防御的コピー）', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    state.board.nodes[0].level = 99;
    expect(board.nodes[0].level).toBe(0);
  });
});

describe('serializeState', () => {
  it('駒の並び順が違っても同じ内容なら同じキーになる', () => {
    const s1 = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'n2' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const s2 = { ...s1, pieces: [...s1.pieces].reverse() };
    expect(serializeState(s1)).toBe(serializeState(s2));
  });

  it('コインが違えば別のキーになる', () => {
    const base = { board, initialPieces: [], attacks: [], turnLimit: 10 };
    const s1 = createInitialState({ ...base, initialCoins: 0 });
    const s2 = createInitialState({ ...base, initialCoins: 1 });
    expect(serializeState(s1)).not.toBe(serializeState(s2));
  });
});
