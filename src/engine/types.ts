export type Owner = 'player' | 'enemy';

export type NodeType = 'road' | 'hut' | 'wall' | 'mine' | 'training' | 'stable';

export type FacilityType = 'mine' | 'training' | 'stable';

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
  /** 敵の兵の動き方（§8）。無ければ動かない。march: 自分の王へ進む / occupy: target の施設へ進んで居座る */
  behavior?: EnemyBehavior;
  /** behavior === 'occupy' の行き先。 */
  target?: string;
}

export type EnemyBehavior = 'march' | 'occupy';

export type TrackingRule = 'nearest-to-enemy' | 'highest-level' | 'king';

export type AttackTarget = { kind: 'node'; nodeId: string } | { kind: 'tracking'; rule: TrackingRule };

/** spawn は攻撃ではなく、敵の小屋（target のノード）が空いていれば進軍する Lv1 の兵を生む（§8 敵の駒）。 */
export type AttackType = 'arrow' | 'cannon' | 'snare' | 'blockade' | 'spawn';

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
  behavior?: EnemyBehavior;
  target?: string;
}
