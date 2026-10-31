import type { LevelDef } from './types';

export const ch6_1: LevelDef = {
  id: 'ch6-1',
  chapter: 6,
  order: 1,
  title: 'ほって、かう',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'mine', level: 1 },
      { id: 'n3', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n4', type: 'wall', level: 1 },
      { id: 'n5', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n1', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n5' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 2,
};

export const ch6_2: LevelDef = {
  id: 'ch6-2',
  chapter: 6,
  order: 2,
  title: 'さきにとうし',
  board: {
    nodes: [
      { id: 'n1', type: 'mine', level: 1 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 2 },
      { id: 'n4', type: 'wall', level: 3 },
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
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n5' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 2,
};
