import type { AttackDef, Board, GameState, InitialPieceSetup } from './types';

export interface CreateStateInput {
  board: Board;
  initialPieces: InitialPieceSetup[];
  initialCoins: number;
  attacks: AttackDef[];
  turnLimit: number;
}

export function createInitialState(input: CreateStateInput): GameState {
  const board: Board = {
    nodes: input.board.nodes.map((n) => ({ ...n })),
    edges: input.board.edges.map((e) => ({ ...e })),
  };
  const pieces = input.initialPieces.map((p, i) => ({
    id: `${p.owner}-${p.isKing ? 'king' : i}`,
    owner: p.owner,
    isKing: p.isKing,
    level: p.level,
    speed: 1,
    snared: 0,
    nodeId: p.nodeId,
  }));
  return {
    round: 1,
    board,
    pieces,
    coins: input.initialCoins,
    blockades: {},
    attacks: input.attacks,
    attackStates: input.attacks.map((a) => ({ remaining: a.initial ?? a.period })),
    status: 'playing',
    turnLimit: input.turnLimit,
    nextPieceId: 0,
  };
}

export function serializeState(state: GameState): string {
  const pieces = [...state.pieces]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => `${p.id}:${p.owner}:${p.isKing ? 1 : 0}:${p.level}:${p.speed}:${p.snared}:${p.nodeId}`)
    .join(',');
  const nodes = [...state.board.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((n) => `${n.id}:${n.type}:${n.level}`)
    .join(',');
  const blockades = Object.keys(state.blockades)
    .sort()
    .map((k) => `${k}:${state.blockades[k]}`)
    .join(',');
  const attacks = state.attackStates.map((a) => a.remaining).join(',');
  return `${pieces}|${nodes}|${blockades}|${attacks}|${state.coins}`;
}
