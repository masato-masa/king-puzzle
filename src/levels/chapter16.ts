import type { LevelDef } from './types';

export const ch16_1: LevelDef = {
  id: 'ch16-1',
  chapter: 16,
  order: 1,
  title: 'ふたつとび',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 's', type: 'stable', level: 2 },
      { id: 'm', type: 'mine', level: 1 },
      { id: 'x', type: 'road', level: 0 },
      { id: 'c1', type: 'road', level: 0 },
      { id: 'c2', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 's' },
      { a: 'k', b: 'm' },
      { a: 'k', b: 'x' },
      { a: 'x', b: 'c1' },
      { a: 'c1', b: 'c2' },
      { a: 'c2', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' }
  ],
  initialCoins: 0,
  attacks: [
    { id: 'c1', type: 'cannon', target: { kind: 'node', nodeId: 'c1' }, period: 1 },
    { id: 'c2', type: 'cannon', target: { kind: 'node', nodeId: 'c2' }, period: 1 }
  ],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch16_2: LevelDef = {
  id: 'ch16-2',
  chapter: 16,
  order: 2,
  title: 'ひくいかべ',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'w1', type: 'wall', level: 1 },
      { id: 'w2', type: 'wall', level: 2 },
      { id: 't', type: 'training', level: 2 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'h' },
      { a: 'k', b: 't' },
      { a: 'k', b: 'w1' },
      { a: 'w1', b: 'e' },
      { a: 'k', b: 'w2' },
      { a: 'w2', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' }
  ],
  initialCoins: 8,
  attacks: [],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch16_3: LevelDef = {
  id: 'ch16-3',
  chapter: 16,
  order: 3,
  title: 'ふたつのくんれんじょう',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 't1', type: 'training', level: 2 },
      { id: 't2', type: 'training', level: 3 },
      { id: 'a', type: 'road', level: 0 },
      { id: 'b', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'h' },
      { a: 'k', b: 't1' },
      { a: 'k', b: 't2' },
      { a: 'k', b: 'a' },
      { a: 'a', b: 'b' },
      { a: 'b', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'e' }
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3
};

export const ch16_4: LevelDef = {
  id: 'ch16-4',
  chapter: 16,
  order: 4,
  title: 'ゆみとたいほう',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 't', type: 'training', level: 3 },
      { id: 'a', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 }
    ],
    edges: [
      { a: 'k', b: 'h' },
      { a: 'k', b: 't' },
      { a: 't', b: 'a' },
      { a: 'a', b: 'e' }
    ]
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' }
  ],
  initialCoins: 2,
  attacks: [
    { id: 'a1', type: 'arrow', target: { kind: 'tracking', rule: 'king' }, period: 3 },
    { id: 'c1', type: 'cannon', target: { kind: 'tracking', rule: 'highest-level' }, period: 5, initial: 4 }
  ],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3
};
