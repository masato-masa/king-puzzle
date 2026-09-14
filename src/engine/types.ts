export type Owner = 'player' | 'enemy';

export type NodeType = 'road' | 'hut' | 'wall' | 'mine' | 'training';

export type FacilityType = 'mine' | 'training';

export interface BoardNode {
  id: string;
  type: NodeType;
  /** 施設（mine/training）または壁のレベル。road/hut では未使用（0）。 */
  level: number;
  /** type === 'hut' のときだけ意味を持つ。 */
  hutOwner?: Owner;
}

export interface BoardEdge {
  a: string;
  b: string;
}

export interface Board {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface Piece {
  id: string;
  owner: Owner;
  isKing: boolean;
  level: number;
  speed: number;
  snared: number;
  nodeId: string;
}

export type TrackingRule = 'nearest-to-enemy' | 'highest-level' | 'king';

export type AttackTarget = { kind: 'node'; nodeId: string } | { kind: 'tracking'; rule: TrackingRule };

export type AttackType = 'arrow' | 'cannon' | 'snare' | 'blockade';

export interface AttackDef {
  id: string;
  type: AttackType;
  target: AttackTarget;
  period: number;
  initial?: number;
  duration?: number;
}

export interface AttackState {
  remaining: number;
}

export type GameStatus = 'playing' | 'won' | 'lost-king' | 'lost-timeout';

export interface GameState {
  round: number;
  board: Board;
  pieces: Piece[];
  coins: number;
  blockades: Record<string, number>;
  attacks: AttackDef[];
  attackStates: AttackState[];
  status: GameStatus;
  turnLimit: number;
  nextPieceId: number;
}

export type PlayerAction =
  | { kind: 'move'; pieceId: string; toNodeId: string }
  | { kind: 'footstep'; pieceId: string }
  | { kind: 'generate'; hutNodeId: string }
  | { kind: 'forced-skip' };

export interface InitialPieceSetup {
  owner: Owner;
  isKing: boolean;
  level: number;
  nodeId: string;
}
