import type { LevelDef } from './types';

export const ch3_1: LevelDef = {
  id: 'ch3-1',
  chapter: 3,
  order: 1,
  title: 'ふみしめて、そだてる',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n3' },
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 3, // scripts/solveLevel.ts で実測済み
  s: 4,
};

export const ch3_2: LevelDef = {
  id: 'ch3-2',
  chapter: 3,
  order: 2,
  title: 'どちらをきたえる',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'training', level: 1 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n4' },
      { a: 'n4', b: 'n5' },
      { a: 'n1', b: 'n3' },
      { a: 'n3', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'n5' },
  ],
  initialCoins: 14,
  attacks: [],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 2,
};
