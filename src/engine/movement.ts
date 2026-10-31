import { getNode, neighbors } from './board';
import type { GameState, Piece } from './types';

/** そのノードで止まれるか（行き先としての条件）。 */
function canEnd(state: GameState, piece: Piece, toNodeId: string): boolean {
  if ((state.blockades[toNodeId] ?? 0) > 0) return false;

  const toNode = getNode(state.board, toNodeId);
  const occupant = state.pieces.find((p) => p.nodeId === toNodeId);

  if (occupant) {
    if (occupant.owner === piece.owner) return false;
    if (piece.isKing && occupant.level >= piece.level) return false;
    return true;
  }

  if (toNode.type === 'wall') {
    if (piece.isKing) return false;
    if (piece.level < toNode.level) return false;
  }

  return true;
}

/** そのノードを通り抜けられるか（速さ 2 以上で、途中に通るノードの条件）。空いていて、壁でも封鎖でもないこと。 */
function canPass(state: GameState, nodeId: string): boolean {
  if ((state.blockades[nodeId] ?? 0) > 0) return false;
  if (getNode(state.board, nodeId).type === 'wall') return false;
  return !state.pieces.some((p) => p.nodeId === nodeId);
}

/**
 * 1 回の移動で行けるノード。速さ N の駒は、空いたノードを通り抜けて N 歩先まで進める（§5 speed、馬小屋）。
 * 戦闘・壁の破壊は行き先でだけ起きる。
 */
export function reachableNodes(state: GameState, piece: Piece): string[] {
  if (piece.snared > 0) return [];
  const targets = new Set<string>();
  const seen = new Set<string>([piece.nodeId]);
  let frontier = [piece.nodeId];
  for (let step = 1; step <= Math.max(1, piece.speed); step++) {
    const next: string[] = [];
    for (const from of frontier) {
      for (const to of neighbors(state.board, from)) {
        if (to === piece.nodeId) continue;
        if (canEnd(state, piece, to)) targets.add(to);
        if (!seen.has(to) && canPass(state, to)) {
          seen.add(to);
          next.push(to);
        }
      }
    }
    frontier = next;
  }
  return [...targets];
}

export function canMove(state: GameState, piece: Piece, toNodeId: string): boolean {
  return reachableNodes(state, piece).includes(toNodeId);
}
