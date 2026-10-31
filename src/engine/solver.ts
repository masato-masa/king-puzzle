import { getLegalActions } from './legalActions';
import { createInitialState, serializeState } from './state';
import { playRound } from './turn';
import type { GameState, PlayerAction } from './types';
import type { LevelDef } from '@/levels/types';

export interface SolveResult {
  tStar: number;
  path: PlayerAction[];
}

/**
 * 幅優先で最少ラウンド数（T*）を求める。章1〜3は状態空間が小さいのでBFSで十分
 * （IDA*＋置換表は状態空間が増える章4以降でフェーズ4にて導入する）。
 * turnLimit はソルバー用に十分大きい値（maxDepth）を使う。レベル定義自身の
 * tStar+s をここで使うと、実測前の仮の tStar が小さすぎた場合に本当の解を
 * 時間切れとして刈ってしまう（鶏と卵の問題）ため。
 */
export function solve(level: LevelDef, maxDepth = 40): SolveResult | null {
  const init = createInitialState({
    board: level.board,
    initialPieces: level.initialPieces,
    initialCoins: level.initialCoins,
    attacks: level.attacks,
    turnLimit: maxDepth,
  });

  let frontier: { state: GameState; path: PlayerAction[] }[] = [{ state: init, path: [] }];
  const visited = new Set<string>([serializeState(init)]);

  for (let depth = 0; depth < maxDepth; depth++) {
    const next: typeof frontier = [];
    for (const { state, path } of frontier) {
      for (const action of getLegalActions(state)) {
        const result = playRound(state, action);
        if (result.status === 'won') {
          return { tStar: depth + 1, path: [...path, action] };
        }
        if (result.status !== 'playing') continue;
        const key = serializeState(result);
        if (visited.has(key)) continue;
        visited.add(key);
        next.push({ state: result, path: [...path, action] });
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}
