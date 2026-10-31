import type { LevelDef } from './types';

export const ch5_1: LevelDef = {
  id: 'ch5-1',
  chapter: 5,
  order: 1,
  title: 'こやでよぶ',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'wall', level: 1 },
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
  initialCoins: 2,
  attacks: [],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch5_2: LevelDef = {
  id: 'ch5-2',
  chapter: 5,
  order: 2,
  title: 'あいうちでいい',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 3 },
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
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'n4' },
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 4, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch5_3: LevelDef = {
  id: 'ch5-3',
  chapter: 5,
  order: 3,
  title: 'かべのむこう',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 2 },
      { id: 'n4', type: 'wall', level: 2 },
      { id: 'n5', type: 'wall', level: 2 },
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
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n6' },
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 11, // scripts/solveLevel.ts で実測済み
  s: 3,
};
