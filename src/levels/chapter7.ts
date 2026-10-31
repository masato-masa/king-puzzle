import type { LevelDef } from './types';

export const ch7_1: LevelDef = {
  id: 'ch7-1',
  chapter: 7,
  order: 1,
  title: 'けずってたおす',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 2 },
      { id: 'n4', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n3' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 4, nodeId: 'n4' },
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch7_2: LevelDef = {
  id: 'ch7-2',
  chapter: 7,
  order: 2,
  title: 'かずでおす',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 3 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n3' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 5, nodeId: 'n5' },
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 3,
};
