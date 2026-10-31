import type { LevelDef } from './types';

export const ch11_1: LevelDef = {
  id: 'ch11-1',
  chapter: 11,
  order: 1,
  title: 'みがわり',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'road', level: 0 },
      { id: 'a1', type: 'hut', level: 0, hutOwner: 'player' },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n4', b: 'n5' },
      { a: 'a1', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 3, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n5' },
  ],
  initialCoins: 4,
  attacks: [
    { id: 'c1', type: 'cannon', target: { kind: 'tracking', rule: 'nearest-to-enemy' }, period: 2 },
  ],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch11_2: LevelDef = {
  id: 'ch11-2',
  chapter: 11,
  order: 2,
  title: 'つよいほうがねらわれる',
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
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'n5' },
  ],
  initialCoins: 4,
  attacks: [
    { id: 'a1', type: 'arrow', target: { kind: 'tracking', rule: 'highest-level' }, period: 2 },
  ],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 3,
};
