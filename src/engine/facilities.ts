import { getNode } from './board';
import { COIN_MAX, mineIncome } from './costs';
import type { GameState, Owner } from './types';

export function applyEndOfTurnFacilityEffects(state: GameState, owner: Owner): GameState {
  let coins = state.coins;
  const pieces = state.pieces.map((piece) => {
    if (piece.owner !== owner || piece.snared > 0) return piece;
    const node = getNode(state.board, piece.nodeId);
    if (node.type === 'training' && piece.level < node.level) {
      return { ...piece, level: piece.level + 1 };
    }
    if (node.type === 'mine' && owner === 'player') {
      coins = Math.min(coins + mineIncome(node.level), COIN_MAX);
    }
    return piece;
  });
  return { ...state, pieces, coins };
}
