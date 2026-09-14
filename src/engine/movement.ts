import { getNode, neighbors } from './board';
import type { GameState, Piece } from './types';

export function canMove(state: GameState, piece: Piece, toNodeId: string): boolean {
  if (piece.snared > 0) return false;
  if (!neighbors(state.board, piece.nodeId).includes(toNodeId)) return false;

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
