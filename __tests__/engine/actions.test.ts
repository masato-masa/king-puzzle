import { describe, expect, it } from 'vitest';

import { applyFootstep, applyGenerate, applyMove } from '@/engine/actions';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const lineBoard: Board = {
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

describe('applyMove', () => {
  it('移動先に何もなければ単に移動する', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyMove(state, state.pieces[0].id, 'b');
    expect(next.pieces[0].nodeId).toBe('b');
  });

  it('敵kingに勝つと status が won になり、以降の駒は変化しない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.status).toBe('won');
    expect(next.pieces.find((p) => p.owner === 'player')?.level).toBe(2);
    expect(next.pieces.find((p) => p.owner === 'enemy')).toBeUndefined();
  });

  it('相打ちで敵kingが消えれば勝ち、自分の駒も消える', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: false, level: 2, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 2, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.status).toBe('won');
    expect(next.pieces).toHaveLength(0);
  });

  it('負ける戦闘は自分の駒が消え、敵はレベルが下がって留まる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: false, level: 2, nodeId: 'a' },
        { owner: 'enemy', isKing: false, level: 5, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.pieces).toHaveLength(1);
    expect(next.pieces[0].owner).toBe('enemy');
    expect(next.pieces[0].level).toBe(3);
    expect(next.pieces[0].nodeId).toBe('b');
  });

  it('壁を壊すと駒は消え、ノードは道になる', () => {
    const wallBoard: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'w', type: 'wall', level: 2 },
      ],
      edges: [{ a: 'a', b: 'w' }],
    };
    const state = createInitialState({
      board: wallBoard,
      initialPieces: [{ owner: 'player', isKing: false, level: 3, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyMove(state, state.pieces[0].id, 'w');
    expect(next.pieces).toHaveLength(0);
    expect(next.board.nodes.find((n) => n.id === 'w')?.type).toBe('road');
  });

  it('合法でない移動は例外を投げる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyMove(state, state.pieces[0].id, 'c')).toThrow();
  });
});

describe('applyFootstep', () => {
  const trainingBoard: Board = {
    nodes: [{ id: 't', type: 'training', level: 2 }],
    edges: [],
  };

  it('コインが足りていれば施設のレベルが上がる', () => {
    const state = createInitialState({
      board: trainingBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.board.nodes[0].level).toBe(3);
    expect(next.coins).toBe(4); // Lv2->Lv3 は費用6
  });

  it('コインが足りなければ何も起きない', () => {
    const state = createInitialState({
      board: trainingBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.board.nodes[0].level).toBe(2);
    expect(next.coins).toBe(0);
  });

  it('道の上では何も起きない', () => {
    const roadBoard: Board = { nodes: [{ id: 'r', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board: roadBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'r' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next).toEqual(state);
  });

  it('小屋の上では何も起きない', () => {
    const hutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'player' }], edges: [] };
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'h' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.coins).toBe(10);
  });

  it('施設が最大レベルなら何も起きない', () => {
    const maxedBoard: Board = { nodes: [{ id: 't', type: 'training', level: 5 }], edges: [] };
    const state = createInitialState({
      board: maxedBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 100,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.coins).toBe(100);
    expect(next.board.nodes[0].level).toBe(5);
  });
});

describe('applyGenerate', () => {
  const hutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'player' }], edges: [] };

  it('自分の空の小屋に Lv1 の駒を生む', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyGenerate(state, 'h');
    expect(next.pieces).toHaveLength(1);
    expect(next.pieces[0]).toMatchObject({ owner: 'player', level: 1, nodeId: 'h' });
    expect(next.coins).toBe(3);
  });

  it('相手の小屋では例外を投げる', () => {
    const enemyHutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'enemy' }], edges: [] };
    const state = createInitialState({
      board: enemyHutBoard,
      initialPieces: [],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });

  it('小屋が塞がっていれば例外を投げる', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'h' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });

  it('コインが足りなければ例外を投げる', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [],
      initialCoins: 1,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });
});
