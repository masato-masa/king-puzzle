import type { LevelDef } from './types';

export const ch13_1: LevelDef = {
  id: 'ch13-1',
  chapter: 13,
  order: 1,
  title: 'うまでまわりみち',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'w', type: 'wall', level: 5 },
      { id: 'e', type: 'road', level: 0 },
      { id: 'a1', type: 'road', level: 0 },
      { id: 'a2', type: 'road', level: 0 },
      { id: 'a3', type: 'road', level: 0 },
      { id: 'a4', type: 'road', level: 0 },
      { id: 'a5', type: 'road', level: 0 },
      { id: 's', type: 'stable', level: 2 }
    ],
    edges: [
      { a: 'k', b: 'w' },
      { a: 'w', b: 'e' },
      { a: 'k', b: 'a1' },
      { a: 'a1', b: 'a2' },
      { a: 'a2', b: 'a3' },
      { a: 'a3', b: 'a4' },
      { a: 'a4', b: 'a5' },
      { a: 'a5', b: 'e' },
      { a: 'k', b: 's' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch13_2: LevelDef = {
  id: 'ch13-2',
  chapter: 13,
  order: 2,
  title: 'とびこえる',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 's', type: 'stable', level: 2 },
      { id: 'n1', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
      { id: 'x', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'x' },
      { a: 'x', b: 'n1' },
      { a: 'n1', b: 'c' },
      { a: 'c', b: 'e' },
      { a: 'n1', b: 's' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [
    {
      id: 'c1',
      type: 'cannon',
      target: { kind: 'node', nodeId: 'c' },
      period: 1
    }
  ],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch13_3: LevelDef = {
  id: 'ch13-3',
  chapter: 13,
  order: 3,
  title: 'はやくまわりこむ',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'a1', type: 'road', level: 0 },
      { id: 'a2', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 'b2', type: 'road', level: 0 },
      { id: 'b1', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
      { id: 's', type: 'stable', level: 2 }
    ],
    edges: [
      { a: 'k', b: 'a1' },
      { a: 'a1', b: 'a2' },
      { a: 'a2', b: 'c' },
      { a: 'c', b: 'b2' },
      { a: 'b2', b: 'b1' },
      { a: 'b1', b: 'k' },
      { a: 'c', b: 'e' },
      { a: 'k', b: 's' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 3, nodeId: 'c', behavior: 'march' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 4, // scripts/solveLevel.ts で実測済み
  s: 3
};
