import type { LevelDef } from './types';

export const ch8_1: LevelDef = {
  id: 'ch8-1',
  chapter: 8,
  order: 1,
  title: 'やのリズム',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
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
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n5' },
  ],
  initialCoins: 0,
  attacks: [
    { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'n3' }, period: 2 },
  ],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch8_2: LevelDef = {
  id: 'ch8-2',
  chapter: 8,
  order: 2,
  title: 'いちどひく',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 3 },
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
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n4' },
  ],
  initialCoins: 0,
  attacks: [
    { id: 'a1', type: 'cannon', target: { kind: 'node', nodeId: 'n2' }, period: 3, initial: 2 },
  ],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch8_3: LevelDef = {
  id: 'ch8-3',
  chapter: 8,
  order: 3,
  title: 'やのしたのくんれん',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n3', type: 'training', level: 2 },
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
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'n5' },
  ],
  initialCoins: 6,
  attacks: [
    { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'n4' }, period: 2 },
  ],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 3,
};
