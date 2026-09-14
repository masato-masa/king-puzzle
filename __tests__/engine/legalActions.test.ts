import { describe, expect, it } from 'vitest';

import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const lineBoard: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'h' },
  ],
};

describe('getLegalActions', () => {
  it('選べる駒があれば footstep と移動を含む', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions).toContainEqual({ kind: 'footstep', pieceId: state.pieces[0].id });
    expect(actions).toContainEqual({ kind: 'move', pieceId: state.pieces[0].id, toNodeId: 'b' });
  });

  it('コインがあれば自分の空の小屋への生成を含む', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 2,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions).toContainEqual({ kind: 'generate', hutNodeId: 'h' });
  });

  it('コインが足りなければ生成を含まない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 1,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions.some((a) => a.kind === 'generate')).toBe(false);
  });

  it('選べる駒が無く生成もできなければ強制スキップだけになる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 1 })) };
    expect(getLegalActions(snared)).toEqual([{ kind: 'forced-skip' }]);
  });

  it('足止め中の駒は選択肢に出ない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const kingId = state.pieces.find((p) => p.owner === 'player')!.id;
    const snared = { ...state, pieces: state.pieces.map((p) => (p.id === kingId ? { ...p, snared: 1 } : p)) };
    const actions = getLegalActions(snared);
    expect(actions.some((a) => 'pieceId' in a && a.pieceId === kingId)).toBe(false);
  });
});
