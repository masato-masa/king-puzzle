import { getNode, isImpassable, neighbors } from './board';
import { resolveCombat } from './combat';
import type { GameState, Piece } from './types';

/** 動く敵の兵の行き先。march は自分の王の今いる場所、occupy は決められた施設。 */
function goalOf(state: GameState, piece: Piece): string | null {
  if (piece.behavior === 'occupy') return piece.target ?? null;
  if (piece.behavior === 'march') return state.pieces.find((p) => p.owner === 'player' && p.isKing)?.nodeId ?? null;
  return null;
}

function blockedSet(state: GameState): Set<string> {
  return new Set(Object.entries(state.blockades).filter(([, r]) => r > 0).map(([id]) => id));
}

/**
 * 行き先へ向かう次の 1 歩（§8 進軍型の経路の決め方）。
 * 未破壊の壁と封鎖は通れない。最短経路が複数あれば、次のノードの ID が昇順で先のもの。
 * 駒は経路の邪魔にならない（ぶつかったら戦闘か、味方なら止まる）。
 */
export function nextStep(state: GameState, piece: Piece): string | null {
  const goal = goalOf(state, piece);
  if (!goal || goal === piece.nodeId) return null;
  const blocked = blockedSet(state);
  // 行き先から逆向きに距離を測る。行き先そのもの（王がいる道など）は通れるものとして始める
  const dist = new Map<string, number>([[goal, 0]]);
  const queue = [goal];
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    for (const nb of neighbors(state.board, cur)) {
      if (dist.has(nb)) continue;
      if (nb !== piece.nodeId && isImpassable(getNode(state.board, nb), blocked)) continue;
      dist.set(nb, dist.get(cur)! + 1);
      queue.push(nb);
    }
  }
  const here = dist.get(piece.nodeId);
  if (here === undefined) return null;
  const options = neighbors(state.board, piece.nodeId)
    .filter((nb) => dist.get(nb) === here - 1)
    .sort();
  return options[0] ?? null;
}

/**
 * 敵の兵を動かす（§7 step4）。ID の順に 1 体ずつ、速さのぶん進む。
 * 自分の駒にぶつかれば戦闘（敵が仕掛ける側）、敵の駒にぶつかればその場に留まる。
 * このラウンドに生まれたばかりの兵は動かない（生まれた場所を 1 ラウンド見せるため）。
 */
export function applyEnemyMovePhase(state: GameState, freshIds: ReadonlySet<string> = new Set()): GameState {
  let pieces = state.pieces;
  const movers = pieces
    .filter((p) => p.owner === 'enemy' && !p.isKing && p.behavior && !freshIds.has(p.id))
    .map((p) => p.id)
    .sort();
  for (const id of movers) {
    for (let hop = 0; hop < 3; hop++) {
      const me = pieces.find((p) => p.id === id);
      if (!me || hop >= me.speed) break;
      const to = nextStep({ ...state, pieces }, me);
      if (!to) break;
      const occupant = pieces.find((p) => p.nodeId === to);
      if (occupant?.owner === 'enemy') break;
      if (occupant) {
        const r = resolveCombat(me.level, occupant.level);
        if (r.winner === 'mutual') pieces = pieces.filter((p) => p.id !== me.id && p.id !== occupant.id);
        else if (r.winner === 'attacker')
          pieces = pieces
            .filter((p) => p.id !== occupant.id)
            .map((p) => (p.id === me.id ? { ...p, level: r.survivorLevel, nodeId: to } : p));
        else
          pieces = pieces
            .filter((p) => p.id !== me.id)
            .map((p) => (p.id === occupant.id ? { ...p, level: r.survivorLevel } : p));
        break;
      }
      pieces = pieces.map((p) => (p.id === id ? { ...p, nodeId: to } : p));
    }
  }
  return { ...state, pieces };
}

/** 盤に出す予告: 動く敵の兵が次に入るノード（いまの盤面で計算する）。 */
export function enemyMovePreview(state: GameState): { pieceId: string; nodeId: string }[] {
  return state.pieces
    .filter((p) => p.owner === 'enemy' && !p.isKing && p.behavior)
    .flatMap((p) => {
      const to = nextStep(state, p);
      return to ? [{ pieceId: p.id, nodeId: to }] : [];
    });
}
