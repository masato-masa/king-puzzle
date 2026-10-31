/** 面の良し悪しを測る道具。監査スクリプト（scripts/audit-levels.ts）と、むげんの生成器（endless.ts）が使う。 */
import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import { playRound } from '@/engine/turn';
import type { GameState } from '@/engine/types';
import { computeLayout, fitLayout } from '@/ui/board/layout';

import { turnLimitOf, type LevelDef } from './types';

export const NARROW_BOX = { width: 343, height: 420 };
export const NODE_PX = 56;
export const MIN_PIECE_PX = 40;

export function piecePx(level: LevelDef): number {
  const root = level.initialPieces.find((p) => p.owner === 'player' && p.isKing)!.nodeId;
  const fitted = fitLayout(computeLayout(level.board, root), NARROW_BOX.width, NARROW_BOX.height);
  return NODE_PX * fitted.scale;
}

function initialState(level: LevelDef): GameState {
  return createInitialState({
    board: level.board,
    initialPieces: level.initialPieces,
    initialCoins: level.initialCoins,
    attacks: level.attacks,
    turnLimit: turnLimitOf(level),
  });
}

/** 決定的な乱数（mulberry32）。監査の数字が毎回同じになるように。 */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomWinRate(level: LevelDef, trials = 2000, seed = 1): number {
  const rand = rng(seed);
  let wins = 0;
  for (let i = 0; i < trials; i++) {
    let state = initialState(level);
    while (state.status === 'playing') {
      const actions = getLegalActions(state);
      state = playRound(state, actions[Math.floor(rand() * actions.length)]);
    }
    if (state.status === 'won') wins++;
  }
  return wins / trials;
}
