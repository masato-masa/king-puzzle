import { getNode } from './board';
import { resolveCombat } from './combat';
import { PIECE_GENERATION_COST, facilityMaxLevel, upgradeCost } from './costs';
import { canMove } from './movement';
import type { FacilityType, GameState, Piece } from './types';

function requirePiece(state: GameState, pieceId: string): Piece {
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece) throw new Error(`piece not found: ${pieceId}`);
  return piece;
}

/** 移動（隣接ノードへ）。敵駒が居れば戦闘、壁なら破壊、それ以外なら移動。 */
export function applyMove(state: GameState, pieceId: string, toNodeId: string): GameState {
  const piece = requirePiece(state, pieceId);
  if (!canMove(state, piece, toNodeId)) {
    throw new Error(`illegal move: ${pieceId} -> ${toNodeId}`);
  }

  const toNode = getNode(state.board, toNodeId);
  const occupant = state.pieces.find((p) => p.nodeId === toNodeId);

  if (occupant) {
    const result = resolveCombat(piece.level, occupant.level);
    const defeatedEnemyKing = occupant.isKing && occupant.owner === 'enemy';

    if (result.winner === 'mutual') {
      const pieces = state.pieces.filter((p) => p.id !== piece.id && p.id !== occupant.id);
      return { ...state, pieces, status: defeatedEnemyKing && !piece.isKing ? 'won' : state.status };
    }
    if (result.winner === 'attacker') {
      const pieces = state.pieces
        .filter((p) => p.id !== occupant.id)
        .map((p) => (p.id === piece.id ? { ...p, level: result.survivorLevel, nodeId: toNodeId } : p));
      return { ...state, pieces, status: defeatedEnemyKing ? 'won' : state.status };
    }
    // 防御側が勝つ：攻撃側の駒が消え、防御側はレベルが下がってその場に残る
    const pieces = state.pieces
      .filter((p) => p.id !== piece.id)
      .map((p) => (p.id === occupant.id ? { ...p, level: result.survivorLevel } : p));
    return { ...state, pieces };
  }

  if (toNode.type === 'wall') {
    // 壊れた壁は以後道と同じに扱う
    const board = {
      ...state.board,
      nodes: state.board.nodes.map((n) => (n.id === toNodeId ? { ...n, type: 'road' as const, level: 0 } : n)),
    };
    const pieces = state.pieces.filter((p) => p.id !== piece.id);
    return { ...state, board, pieces };
  }

  const pieces = state.pieces.map((p) => (p.id === piece.id ? { ...p, nodeId: toNodeId } : p));
  return { ...state, pieces };
}

/** 足踏み。施設のレベルを上げられる条件を満たせば上げる。満たさなければ何も起きない（§2④）。 */
export function applyFootstep(state: GameState, pieceId: string): GameState {
  const piece = requirePiece(state, pieceId);
  if (piece.snared > 0) throw new Error(`snared piece cannot act: ${pieceId}`);
  const node = getNode(state.board, piece.nodeId);
  if (node.type !== 'mine' && node.type !== 'training') return state;

  const type = node.type as FacilityType;
  if (node.level >= facilityMaxLevel(type)) return state;
  const cost = upgradeCost(type, node.level);
  if (cost === undefined || state.coins < cost) return state;

  const board = {
    ...state.board,
    nodes: state.board.nodes.map((n) => (n.id === node.id ? { ...n, level: n.level + 1 } : n)),
  };
  return { ...state, board, coins: state.coins - cost };
}

/** 生成。自分の空の小屋に Lv1 の駒を置く。 */
export function applyGenerate(state: GameState, hutNodeId: string): GameState {
  const node = getNode(state.board, hutNodeId);
  if (node.type !== 'hut' || node.hutOwner !== 'player') {
    throw new Error(`not a player hut: ${hutNodeId}`);
  }
  if (state.pieces.some((p) => p.nodeId === hutNodeId)) {
    throw new Error(`hut occupied: ${hutNodeId}`);
  }
  if (state.coins < PIECE_GENERATION_COST) {
    throw new Error('not enough coins to generate');
  }
  const newPiece: Piece = {
    id: `player-gen-${state.nextPieceId}`,
    owner: 'player',
    isKing: false,
    level: 1,
    speed: 1,
    snared: 0,
    nodeId: hutNodeId,
  };
  return {
    ...state,
    pieces: [...state.pieces, newPiece],
    coins: state.coins - PIECE_GENERATION_COST,
    nextPieceId: state.nextPieceId + 1,
  };
}
