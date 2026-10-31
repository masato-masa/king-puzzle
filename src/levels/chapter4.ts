import type { LevelDef } from './types';

export const ch4_1: LevelDef = {
  id: 'ch4-1',
  chapter: 4,
  order: 1,
  title: 'かべをこわす',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'wall', level: 2 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'player', isKing: false, level: 2, nodeId: 'n2' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n5' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 2,
};

export const ch4_2: LevelDef = {
  id: 'ch4-2',
  chapter: 4,
  order: 2,
  title: 'じゅんばん',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'training', level: 3 },
      { id: 'n4', type: 'wall', level: 2 },
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
    { owner: 'player', isKing: false, level: 1, nodeId: 'n2' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n5' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 2,
};

export const ch4_3: LevelDef = {
  id: 'ch4-3',
  chapter: 4,
  order: 3,
  title: 'ふたつのかべ',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'training', level: 2 },
      { id: 'n5', type: 'wall', level: 2 },
      { id: 'n6', type: 'wall', level: 2 },
      { id: 'n7', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n4' },
      { a: 'n2', b: 'n4' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
      { a: 'n5', b: 'n6' },
      { a: 'n6', b: 'n7' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'player', isKing: false, level: 1, nodeId: 'n2' },
    { owner: 'player', isKing: false, level: 1, nodeId: 'n3' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n7' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 2,
};
