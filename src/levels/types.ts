import type { AttackDef, Board, InitialPieceSetup } from '@/engine/types';

export interface LevelDef {
  id: string;
  chapter: number;
  order: number;
  title: string;
  board: Board;
  initialPieces: InitialPieceSetup[];
  initialCoins: number;
  attacks: AttackDef[];
  /** 作問時にソルバーで求めた最少ラウンド数。推測で書かない。 */
  tStar: number;
  /** ターン制限の余裕（難易度）。 */
  s: number;
}

export function turnLimitOf(level: LevelDef): number {
  return level.tStar + level.s;
}
