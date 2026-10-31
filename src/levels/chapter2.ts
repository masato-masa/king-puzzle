import type { LevelDef } from './types';

export const ch2_1: LevelDef = {
  id: 'ch2-1',
  chapter: 2,
  order: 1,
  title: 'のって、まつ',
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
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n3' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 2, // scripts/solveLevel.ts で実測済み
  s: 4,
};

export const ch2_2: LevelDef = {
  id: 'ch2-2',
  chapter: 2,
  order: 2,
  title: 'とおまわり',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'training', level: 3 },
      { id: 'n6', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n1', b: 'n5' },
      { a: 'n5', b: 'n6' },
      { a: 'n6', b: 'n3' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n4' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3,
};
