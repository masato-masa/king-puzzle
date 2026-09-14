import { neighbors } from './board';
import { PIECE_GENERATION_COST } from './costs';
import { canMove } from './movement';
import type { GameState, PlayerAction } from './types';

export function getLegalActions(state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = [];

  for (const piece of state.pieces) {
    if (piece.owner !== 'player' || piece.snared > 0) continue;
    actions.push({ kind: 'footstep', pieceId: piece.id });
    for (const toNodeId of neighbors(state.board, piece.nodeId)) {
      if (canMove(state, piece, toNodeId)) {
        actions.push({ kind: 'move', pieceId: piece.id, toNodeId });
      }
    }
  }

  for (const node of state.board.nodes) {
    if (node.type !== 'hut' || node.hutOwner !== 'player') continue;
    if (state.pieces.some((p) => p.nodeId === node.id)) continue;
    if (state.coins < PIECE_GENERATION_COST) continue;
    actions.push({ kind: 'generate', hutNodeId: node.id });
  }

  return actions.length > 0 ? actions : [{ kind: 'forced-skip' }];
}
