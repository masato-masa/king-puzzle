import type { LevelDef } from './types';

export const ch14_1: LevelDef = {
  id: 'ch14-1',
  chapter: 14,
  order: 1,
  title: 'むきがかわる',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'a1', type: 'road', level: 0 },
      { id: 'a2', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 'b2', type: 'road', level: 0 },
      { id: 'b1', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
      { id: 't', type: 'training', level: 3 },
    ],
    edges: [
      { a: 'k', b: 'a1' },
      { a: 'a1', b: 'a2' },
      { a: 'a2', b: 'c' },
      { a: 'c', b: 'b2' },
      { a: 'b2', b: 'b1' },
      { a: 'b1', b: 'k' },
      { a: 'c', b: 'e' },
      { a: 'k', b: 't' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 1, nodeId: 'a2', behavior: 'march' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' },
  ],
  initialCoins: 0,
  attacks: [
    { id: 'b1', type: 'blockade', target: { kind: 'node', nodeId: 'a1' }, period: 3, initial: 1, duration: 1 }
  ],
  tStar: 7, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch14_2: LevelDef = {
  id: 'ch14-2',
  chapter: 14,
  order: 2,
  title: 'うたれながらそだてる',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 't', type: 'training', level: 3 },
      { id: 'r', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
      { id: 'm', type: 'mine', level: 1 },
    ],
    edges: [
      { a: 'k', b: 't' },
      { a: 't', b: 'r' },
      { a: 'r', b: 'e' },
      { a: 'k', b: 'm' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'e' },
  ],
  initialCoins: 6,
  attacks: [
    { id: 'a1', type: 'arrow', target: { kind: 'tracking', rule: 'king' }, period: 2 }
  ],
  tStar: 8, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch14_3: LevelDef = {
  id: 'ch14-3',
  chapter: 14,
  order: 3,
  title: 'はさみうち',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'a', type: 'road', level: 0 },
      { id: 'b', type: 'road', level: 0 },
      { id: 'la', type: 'road', level: 0 },
      { id: 'lb', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 't', type: 'training', level: 3 },
    ],
    edges: [
      { a: 'la', b: 'a' },
      { a: 'a', b: 'k' },
      { a: 'k', b: 'b' },
      { a: 'b', b: 'lb' },
      { a: 'k', b: 'c' },
      { a: 'c', b: 'e' },
      { a: 'k', b: 'h' },
      { a: 'c', b: 't' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 2, nodeId: 'la', behavior: 'march' },
    { owner: 'enemy', isKing: false, level: 1, nodeId: 'lb', behavior: 'march' },
    { owner: 'enemy', isKing: true, level: 3, nodeId: 'e' },
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch14_4: LevelDef = {
  id: 'ch14-4',
  chapter: 14,
  order: 4,
  title: 'ひきつけて、くぐる',
  board: {
    nodes: [
      { id: 'k', type: 'road', level: 0 },
      { id: 'c', type: 'road', level: 0 },
      { id: 't', type: 'training', level: 3 },
      { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
      { id: 'w', type: 'wall', level: 1 },
      { id: 'm', type: 'road', level: 0 },
      { id: 'e', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'k', b: 't' },
      { a: 'k', b: 'c' },
      { a: 'c', b: 'h' },
      { a: 'c', b: 'w' },
      { a: 'w', b: 'm' },
      { a: 'm', b: 'e' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'k' },
    { owner: 'enemy', isKing: false, level: 2, nodeId: 'm', behavior: 'march' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'e' },
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 9, // scripts/solveLevel.ts で実測済み
  s: 3,
};
