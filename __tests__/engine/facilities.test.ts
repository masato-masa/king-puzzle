import { describe, expect, it } from 'vitest';

import { applyEndOfTurnFacilityEffects } from '@/engine/facilities';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'train', type: 'training', level: 3 },
    { id: 'mine', type: 'mine', level: 2 },
    { id: 'road', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'train', b: 'mine' },
    { a: 'mine', b: 'road' },
  ],
};

describe('applyEndOfTurnFacilityEffects', () => {
  it('訓練場は駒のレベルを施設レベルまで+1する', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.pieces[0].level).toBe(2);
  });

  it('駒のレベルが施設レベルに達したら止まる', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.pieces[0].level).toBe(3);
  });

  it('採掘場は 2×レベル のコインを得る', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.coins).toBe(9);
  });

  it('コインは上限30を超えない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 29,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.coins).toBe(30);
  });

  it('足止めされた駒は効果を受けない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 1 })) };
    const next = applyEndOfTurnFacilityEffects(snared, 'player');
    expect(next.pieces[0].level).toBe(1);
  });

  it('敵駒が採掘場に居てもコインは誰にも入らない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'enemy', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'enemy');
    expect(next.coins).toBe(5);
  });

  it('owner が違う駒には効果を適用しない', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'train' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'road' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'enemy');
    expect(next.pieces.find((p) => p.owner === 'player')?.level).toBe(1);
  });
});
