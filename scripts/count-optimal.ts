/**
 * 最短解の本数を数える（常設）。同じ盤面に合流する手順はまとめて数え、最短手数 T* で勝つ手順が何通りあるかを出す。
 * 1 本なら「唯一解」。2 本以上なら手順は違っても狙いは同じかどうかを人が見る。
 *   import { countOptimal } from './count-optimal';
 */
import { getLegalActions } from '../src/engine/legalActions';
import { createInitialState, serializeState } from '../src/engine/state';
import { playRound } from '../src/engine/turn';
import type { GameState } from '../src/engine/types';
import type { LevelDef } from '../src/levels/types';

export function countOptimal(level: LevelDef, maxDepth = 14): { tStar: number; ways: number } | null {
  const init = createInitialState({ board: level.board, initialPieces: level.initialPieces, initialCoins: level.initialCoins, attacks: level.attacks, turnLimit: maxDepth });
  let layer = new Map<string, { state: GameState; ways: number }>([[serializeState(init), { state: init, ways: 1 }]]);
  const seen = new Set(layer.keys());
  for (let depth = 1; depth <= maxDepth; depth++) {
    const next = new Map<string, { state: GameState; ways: number }>();
    let wins = 0;
    for (const { state, ways } of layer.values()) {
      for (const action of getLegalActions(state)) {
        const r = playRound(state, action);
        if (r.status === 'won') { wins += ways; continue; }
        if (r.status !== 'playing') continue;
        const key = serializeState(r);
        const hit = next.get(key);
        if (hit) hit.ways += ways;
        else if (!seen.has(key)) next.set(key, { state: r, ways });
      }
    }
    if (wins > 0) return { tStar: depth, ways: wins };
    for (const k of next.keys()) seen.add(k);
    if (next.size === 0) return null;
    layer = next;
  }
  return null;
}
