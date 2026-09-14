import type { LevelDef } from './types';

export const ch1_1: LevelDef = {
  id: 'ch1-1',
  chapter: 1,
  order: 1,
  title: 'はじめての一手',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n4' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 3, // scripts/solveLevel.ts で実測済み
  s: 4,
};
