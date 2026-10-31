import type { LevelDef } from './types';

export const ch12_1: LevelDef = {
  id: 'ch12-1',
  chapter: 12,
  order: 1,
  title: 'おびきだす',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'a1', type: 'road', level: 0 },
      { id: 'a2', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 'b2', type: 'road', level: 0 },
      { id: 'b1', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'a1' },
      { a: 'a1', b: 'a2' },
      { a: 'a2', b: 'c' },
      { a: 'c', b: 'b2' },
      { a: 'b2', b: 'b1' },
      { a: 'b1', b: 'k' },
      { a: 'c', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 3, nodeId: 'c', behavior: 'march' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch12_2: LevelDef = {
  id: 'ch12-2',
  chapter: 12,
  order: 2,
  title: 'さきにとる',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'n1', type: 'road', level: 0 },
      { id: 't', type: 'training', level: 3 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'o', type: 'road', level: 0 },
      { id: 'o1', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'n1' },
      { a: 'n1', b: 't' },
      { a: 't', b: 'n2' },
      { a: 'n2', b: 'e' },
      { a: 't', b: 'o1' },
      { a: 'o1', b: 'o' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 1, nodeId: 'o', behavior: 'occupy', target: 't' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 6, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch12_3: LevelDef = {
  id: 'ch12-3',
  chapter: 12,
  order: 3,
  title: 'こやをふさぐ',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'g', type: 'hut', level: 0, hutOwner: 'enemy' },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'n1' },
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'e' },
      { a: 'h', b: 'n1' },
      { a: 'n2', b: 'g' },
      { a: 'g', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 3, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' }
  ],
  initialCoins: 4,
  attacks: [
    {
      id: 'g1',
      type: 'spawn',
      target: { kind: 'node', nodeId: 'g' },
      period: 2,
      initial: 1
    },
    {
      id: 'a1',
      type: 'arrow',
      target: { kind: 'node', nodeId: 'n2' },
      period: 3
    }
  ],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3
};
