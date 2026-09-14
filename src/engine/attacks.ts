import { shortestDistance } from './board';
import type { AttackDef, GameState, TrackingRule } from './types';

function wallNodeIds(state: GameState): Set<string> {
  return new Set(state.board.nodes.filter((n) => n.type === 'wall').map((n) => n.id));
}

export function resolveTrackingTarget(state: GameState, rule: TrackingRule): string | null {
  const playerPieces = state.pieces.filter((p) => p.owner === 'player');
  if (playerPieces.length === 0) return null;

  if (rule === 'king') {
    const king = playerPieces.find((p) => p.isKing);
    return king ? king.nodeId : null;
  }

  if (rule === 'highest-level') {
    const maxLevel = Math.max(...playerPieces.map((p) => p.level));
    const candidates = playerPieces
      .filter((p) => p.level === maxLevel)
      .map((p) => p.nodeId)
      .sort();
    return candidates[0];
  }

  // nearest-to-enemy
  const enemyKing = state.pieces.find((p) => p.owner === 'enemy' && p.isKing);
  if (!enemyKing) return null;
  const blocked = wallNodeIds(state);
  let best: { nodeId: string; dist: number } | null = null;
  for (const p of playerPieces) {
    const dist = shortestDistance(state.board, p.nodeId, enemyKing.nodeId, blocked);
    if (dist === null) continue;
    if (!best || dist < best.dist || (dist === best.dist && p.nodeId < best.nodeId)) {
      best = { nodeId: p.nodeId, dist };
    }
  }
  return best ? best.nodeId : null;
}

function resolveTarget(state: GameState, attack: AttackDef): string | null {
  return attack.target.kind === 'node' ? attack.target.nodeId : resolveTrackingTarget(state, attack.target.rule);
}

export interface AttackPhaseResult {
  state: GameState;
  freshSnaredPieceIds: Set<string>;
  freshBlockadeNodeIds: Set<string>;
}

/**
 * 相手のターン開始時に呼ぶ（§7 step3）。カウントを1減らし、
 * 0になった攻撃は「対象を先に全部決めてから、配列順に適用する」（§8）。
 */
export function applyAttackPhase(state: GameState): AttackPhaseResult {
  const decremented = state.attackStates.map((s) => ({ remaining: s.remaining - 1 }));

  const firing: { index: number; nodeId: string | null }[] = [];
  decremented.forEach((s, index) => {
    if (s.remaining <= 0) {
      firing.push({ index, nodeId: resolveTarget(state, state.attacks[index]) });
    }
  });

  let pieces = [...state.pieces];
  const blockades = { ...state.blockades };
  const freshSnaredPieceIds = new Set<string>();
  const freshBlockadeNodeIds = new Set<string>();

  for (const { index, nodeId } of firing) {
    if (nodeId === null) continue;
    const attack = state.attacks[index];

    if (attack.type === 'blockade') {
      blockades[nodeId] = attack.duration ?? 1;
      freshBlockadeNodeIds.add(nodeId);
      continue;
    }

    const target = pieces.find((p) => p.owner === 'player' && p.nodeId === nodeId);
    if (!target) continue;

    if (attack.type === 'arrow') {
      pieces =
        target.level <= 1
          ? pieces.filter((p) => p.id !== target.id)
          : pieces.map((p) => (p.id === target.id ? { ...p, level: p.level - 1 } : p));
    } else if (attack.type === 'cannon') {
      pieces = pieces.filter((p) => p.id !== target.id);
    } else if (attack.type === 'snare') {
      pieces = pieces.map((p) => (p.id === target.id ? { ...p, snared: attack.duration ?? 1 } : p));
      freshSnaredPieceIds.add(target.id);
    }
  }

  const attackStates = decremented.map((s, index) =>
    s.remaining <= 0 ? { remaining: state.attacks[index].period } : s
  );

  return { state: { ...state, pieces, blockades, attackStates }, freshSnaredPieceIds, freshBlockadeNodeIds };
}
