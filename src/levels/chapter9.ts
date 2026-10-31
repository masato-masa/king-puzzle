import type { LevelDef } from './types';

export const ch9_1: LevelDef = {
  id: 'ch9-1',
  chapter: 9,
  order: 1,
  title: 'とおせんぼ',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'road', level: 0 },
      { id: 'n5', type: 'road', level: 0 },
      { id: 'n6', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
      { a: 'n2', b: 'n5' },
      { a: 'n5', b: 'n6' },
      { a: 'n6', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n4' },
  ],
  initialCoins: 0,
  attacks: [
    { id: 'b1', type: 'blockade', target: { kind: 'node', nodeId: 'n3' }, period: 3, initial: 1, duration: 2 },
  ],
  tStar: 4, // scripts/solveLevel.ts で実測済み
  s: 3,
};

export const ch9_2: LevelDef = {
  id: 'ch9-2',
  chapter: 9,
  order: 2,
  title: 'あしどめ',
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
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n5' },
  ],
  initialCoins: 2,
  attacks: [
    { id: 's1', type: 'snare', target: { kind: 'node', nodeId: 'n4' }, period: 3, initial: 3, duration: 2 },
  ],
  tStar: 5, // scripts/solveLevel.ts で実測済み
  s: 3,
};
