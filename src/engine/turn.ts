import { applyFootstep, applyGenerate, applyMove } from './actions';
import { applyAttackPhase } from './attacks';
import { applyEndOfTurnFacilityEffects } from './facilities';
import type { GameState, PlayerAction } from './types';

function applyPlayerAction(state: GameState, action: PlayerAction): GameState {
  switch (action.kind) {
    case 'move':
      return applyMove(state, action.pieceId, action.toNodeId);
    case 'footstep':
      return applyFootstep(state, action.pieceId);
    case 'generate':
      return applyGenerate(state, action.hutNodeId);
    case 'forced-skip':
      return state;
  }
}

function checkDefeat(state: GameState): GameState {
  const kingAlive = state.pieces.some((p) => p.owner === 'player' && p.isKing);
  return kingAlive ? state : { ...state, status: 'lost-king' };
}

/**
 * 1ラウンド分を進める（§7）。勝利は自分のターンで即確定し、以降を実行しない。
 * 判定の優先順位は 勝利 > 敗北 > 時間切れ（§19）。
 */
export function playRound(state: GameState, action: PlayerAction): GameState {
  // 【自分のターン】
  let next = applyPlayerAction(state, action);
  if (next.status === 'won') return next;

  next = applyEndOfTurnFacilityEffects(next, 'player');

  // 【相手のターン】
  const attackResult = applyAttackPhase(next);
  next = attackResult.state;

  next = applyEndOfTurnFacilityEffects(next, 'enemy');

  const pieces = next.pieces.map((p) =>
    p.snared > 0 && !attackResult.freshSnaredPieceIds.has(p.id) ? { ...p, snared: p.snared - 1 } : p
  );
  const blockades: Record<string, number> = {};
  for (const [nodeId, remaining] of Object.entries(next.blockades)) {
    if (attackResult.freshBlockadeNodeIds.has(nodeId)) {
      blockades[nodeId] = remaining;
      continue;
    }
    const decremented = remaining - 1;
    if (decremented > 0) blockades[nodeId] = decremented;
  }
  next = { ...next, pieces, blockades };

  next = checkDefeat(next);

  const round = next.round + 1;
  const status = next.status === 'playing' && round > next.turnLimit ? 'lost-timeout' : next.status;
  return { ...next, round, status };
}
