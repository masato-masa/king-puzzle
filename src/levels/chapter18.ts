import type { LevelDef } from './types';

export const ch18_1: LevelDef = {
  id: 'ch18-1',
  chapter: 18,
  order: 1,
  title: 'そだてる',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'f',
        type: 'training',
        level: 1
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 'b',
        type: 'road',
        level: 0
      },
      {
        id: 'e',
        type: 'road',
        level: 0
      }
    ],
    edges: [
      {
        a: 'k',
        b: 'f'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      }
    ]
  },
  initialPieces: [
    {
      owner: 'player',
      isKing: true,
      level: 1,
      nodeId: 'k'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 6,
  s: 3
};

export const ch18_2: LevelDef = {
  id: 'ch18-2',
  chapter: 18,
  order: 2,
  title: 'うまをそだてる',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 's',
        type: 'stable',
        level: 1
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 'b',
        type: 'road',
        level: 0
      },
      {
        id: 'c',
        type: 'road',
        level: 0
      },
      {
        id: 'e',
        type: 'road',
        level: 0
      }
    ],
    edges: [
      {
        a: 'k',
        b: 's'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'c'
      },
      {
        a: 'c',
        b: 'e'
      }
    ]
  },
  initialPieces: [
    {
      owner: 'player',
      isKing: true,
      level: 2,
      nodeId: 'k'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 6,
  attacks: [
    {
      id: 's1',
      type: 'snare',
      target: {
        kind: 'node',
        nodeId: 'b'
      },
      period: 1
    }
  ],
  tStar: 5,
  s: 3
};

export const ch18_3: LevelDef = {
  id: 'ch18-3',
  chapter: 18,
  order: 3,
  title: 'ふたつそだてる',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 't',
        type: 'training',
        level: 1
      },
      {
        id: 's',
        type: 'stable',
        level: 1
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 'b',
        type: 'road',
        level: 0
      },
      {
        id: 'c',
        type: 'road',
        level: 0
      },
      {
        id: 'e',
        type: 'road',
        level: 0
      }
    ],
    edges: [
      {
        a: 'k',
        b: 't'
      },
      {
        a: 'k',
        b: 's'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'c'
      },
      {
        a: 'c',
        b: 'e'
      }
    ]
  },
  initialPieces: [
    {
      owner: 'player',
      isKing: true,
      level: 1,
      nodeId: 'k'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 12,
  attacks: [
    {
      id: 's1',
      type: 'snare',
      target: {
        kind: 'node',
        nodeId: 'b'
      },
      period: 1
    }
  ],
  tStar: 7,
  s: 3
};

export const ch18_4: LevelDef = {
  id: 'ch18-4',
  chapter: 18,
  order: 4,
  title: 'かせいでそだてる',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'm',
        type: 'mine',
        level: 1
      },
      {
        id: 't',
        type: 'training',
        level: 1
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 'b',
        type: 'road',
        level: 0
      },
      {
        id: 'e',
        type: 'road',
        level: 0
      }
    ],
    edges: [
      {
        a: 'k',
        b: 'm'
      },
      {
        a: 'k',
        b: 't'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      }
    ]
  },
  initialPieces: [
    {
      owner: 'player',
      isKing: true,
      level: 1,
      nodeId: 'k'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 4,
  attacks: [],
  tStar: 8,
  s: 3
};
