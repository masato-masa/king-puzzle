import type { LevelDef } from './types';

export const ch17_1: LevelDef = {
  id: 'ch17-1',
  chapter: 17,
  order: 1,
  title: 'たいほうのあいだ',
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
        level: 3
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
      level: 2,
      nodeId: 'e'
    }
  ],
  initialCoins: 0,
  attacks: [
    {
      id: 'c0',
      type: 'cannon',
      target: {
        kind: 'node',
        nodeId: 'b'
      },
      period: 2
    }
  ],
  tStar: 7,
  s: 3
};

export const ch17_2: LevelDef = {
  id: 'ch17-2',
  chapter: 17,
  order: 2,
  title: 'おくのたいほう',
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
        level: 3
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
      level: 2,
      nodeId: 'e'
    }
  ],
  initialCoins: 0,
  attacks: [
    {
      id: 'c0',
      type: 'cannon',
      target: {
        kind: 'node',
        nodeId: 'c'
      },
      period: 2
    }
  ],
  tStar: 8,
  s: 3
};

export const ch17_3: LevelDef = {
  id: 'ch17-3',
  chapter: 17,
  order: 3,
  title: 'いすわるへい',
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
        level: 2
      },
      {
        id: 't',
        type: 'training',
        level: 3
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
        b: 's'
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
      level: 2,
      nodeId: 'e'
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 2,
      nodeId: 'a',
      behavior: 'occupy',
      target: 't'
    }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 8,
  s: 3
};

export const ch17_4: LevelDef = {
  id: 'ch17-4',
  chapter: 17,
  order: 4,
  title: 'しんぐんのへい',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'h',
        type: 'road',
        level: 0
      },
      {
        id: 't',
        type: 'training',
        level: 3
      },
      {
        id: 'a',
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
        b: 'h'
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
      level: 2,
      nodeId: 'e'
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 2,
      nodeId: 'e',
      behavior: 'march'
    }
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 8,
  s: 3
};
