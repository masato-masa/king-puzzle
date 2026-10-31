import type { LevelDef } from './types';

export const ch10_1: LevelDef = {
  id: 'ch10-1',
  chapter: 10,
  order: 1,
  title: 'てきじんのくんれんじょう',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 2 },
      { id: 'n4', type: 'wall', level: 2 },
      { id: 'n5', type: 'training', level: 4 },
      { id: 'n6', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n3' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
      { a: 'n5', b: 'n6' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'n6' },
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 2,
};
