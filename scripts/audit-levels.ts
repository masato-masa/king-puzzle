/**
 * 面の監査（常設）。面を足したり数値を変えたりしたら毎回走らせる。
 *
 *   npx tsx scripts/audit-levels.ts          # 全面
 *   npx tsx scripts/audit-levels.ts ch4-1    # 1 面だけ
 *
 * 見るもの:
 * - T*（最少ラウンド数）と、データに書いた tStar が一致するか
 * - 駒の大きさ（343×420 の枠＝狭いスマホで描いたときの px）。40px 未満は押しにくい（KP-6）
 * - 当てずっぽう勝率: 合法手を一様に選んで制限ターン内に勝てる割合。高いほど「考えずに解ける」面（P2）
 * - 最短解の中の強制スキップ（何もできないラウンド）
 */
import { getLegalActions } from '../src/engine/legalActions';
import { createInitialState } from '../src/engine/state';
import { playRound } from '../src/engine/turn';
import type { GameState, PlayerAction } from '../src/engine/types';
import { computeLayout, fitLayout } from '../src/ui/board/layout';
import { LEVELS } from '../src/levels/index';
import { turnLimitOf, type LevelDef } from '../src/levels/types';
import { solve } from './solveLevel';

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
function rng(seed: number): () => number {
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

function describe(action: PlayerAction): string {
  switch (action.kind) {
    case 'move':
      return `${action.pieceId}→${action.toNodeId}`;
    case 'footstep':
      return `${action.pieceId} 足踏み`;
    case 'generate':
      return `生成@${action.hutNodeId}`;
    case 'forced-skip':
      return 'スキップ';
  }
}

function main() {
  const only = process.argv[2];
  const targets = only ? LEVELS.filter((l) => l.id === only) : LEVELS;
  const rows: string[] = [];
  for (const level of targets) {
    const result = solve(level);
    const px = piecePx(level);
    const rate = randomWinRate(level);
    const flags: string[] = [];
    if (!result) flags.push('解なし');
    else if (result.tStar !== level.tStar) flags.push(`tStar ずれ(実測 ${result.tStar})`);
    if (px < MIN_PIECE_PX) flags.push('駒が小さい');
    if (result?.path.some((a) => a.kind === 'forced-skip')) flags.push('最短解にスキップ');
    rows.push(
      [
        level.id.padEnd(6),
        level.title.padEnd(12, '　'),
        `T*=${result?.tStar ?? '-'}`.padEnd(6),
        `制限=${turnLimitOf(level)}`.padEnd(6),
        `駒=${px.toFixed(0)}px`.padEnd(8),
        `当てずっぽう=${(rate * 100).toFixed(1)}%`.padEnd(14),
        flags.join(' ') || 'OK',
      ].join(' '),
    );
    if (only && result) console.log(result.path.map(describe).join(' / '));
  }
  console.log(rows.join('\n'));
}

if (typeof process !== 'undefined' && process.argv[1]?.replace(/\\/g, '/').endsWith('audit-levels.ts')) {
  main();
}
