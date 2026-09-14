import { describe, expect, it } from 'vitest';

import { playRound } from '@/engine/turn';
import { createInitialState } from '@/engine/state';
import type { AttackDef, Board } from '@/engine/types';

describe('playRound', () => {
  it('勝利は施設発動より先に確定し、以降のステップを実行しない', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'training', level: 5 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = playRound(state, { kind: 'move', pieceId: player.id, toNodeId: 'b' });
    expect(next.status).toBe('won');
    // 訓練場の効果（施設発動）は実行されていないので、レベルは 3-1=2 のまま
    expect(next.pieces[0].level).toBe(2);
    expect(next.round).toBe(1); // 勝利時は round を進めない
  });

  it('足踏みで上げた施設レベルは同ターンの発動に乗る', () => {
    const board: Board = { nodes: [{ id: 't', type: 'training', level: 2 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 2, nodeId: 't' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces[0];
    const next = playRound(state, { kind: 'footstep', pieceId: player.id });
    // Lv2->Lv3 の足踏み（費用6）の直後、施設Lv3に対して駒Lv2<3 なので +1 されて Lv3 になる
    expect(next.board.nodes[0].level).toBe(3);
    expect(next.pieces[0].level).toBe(3);
    expect(next.coins).toBe(4);
  });

  it('攻撃のカウントは相手のターンで減り、0になれば発火する', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const arrow: AttackDef = { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'a' }, period: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    // 1手目: footstep（何も起きない）。攻撃カウントは 2->1
    const afterFirst = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(afterFirst.attackStates[0].remaining).toBe(1);
    expect(afterFirst.pieces[0].level).toBe(3);
    // 2手目: footstep。カウントが0になり発火、king Lv3->Lv2、period(2)に戻る
    const afterSecond = playRound(afterFirst, { kind: 'footstep', pieceId: afterFirst.pieces[0].id });
    expect(afterSecond.pieces[0].level).toBe(2);
    expect(afterSecond.attackStates[0].remaining).toBe(2);
  });

  it('自分のkingを失えば敗北', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const arrow: AttackDef = { id: 'a1', type: 'cannon', target: { kind: 'node', nodeId: 'a' }, period: 1 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const next = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(next.status).toBe('lost-king');
  });

  it('ラウンドが turnLimit を超えたら時間切れ', () => {
    const board: Board = { nodes: [{ id: 'a', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 1,
    });
    const next = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(next.status).toBe('lost-timeout');
  });

  it('強制スキップは何も変えずにラウンドだけ進む', () => {
    const board: Board = { nodes: [{ id: 'a', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 2 })) };
    const next = playRound(snared, { kind: 'forced-skip' });
    expect(next.round).toBe(2);
    expect(next.pieces[0].snared).toBe(1);
  });
});
