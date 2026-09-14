import type { LevelDef } from './types';

export const ch3_1: LevelDef = {
  id: 'ch3-1',
  chapter: 3,
  order: 1,
  title: 'ふみしめて、そだてる',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n3' },
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 3, // 仮値。Task 13 で実測して更新する
  s: 4,
};
