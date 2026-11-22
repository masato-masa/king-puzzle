import type { LevelDef } from './types';

export const ch22_1: LevelDef = {
  id: 'ch22-1',
  chapter: 22,
  order: 1,
  title: 'へいだけでかつ',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'h',
        type: 'hut',
        level: 0,
        hutOwner: 'player'
      },
      {
        id: 'w',
        type: 'wall',
        level: 1
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
        a: 'h',
        b: 'w'
      },
      {
        a: 'w',
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
  tStar: 5,
  s: 3
};

export const ch22_2: LevelDef = {
  id: 'ch22-2',
  chapter: 22,
  order: 2,
  title: 'そだててぶつける',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'h',
        type: 'hut',
        level: 0,
        hutOwner: 'player'
      },
      {
        id: 't',
        type: 'training',
        level: 2
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
        a: 'h',
        b: 'a'
      },
      {
        a: 'k',
        b: 't'
      },
      {
        a: 't',
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
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 5,
  s: 3
};

export const ch22_3: LevelDef = {
  id: 'ch22-3',
  chapter: 22,
  order: 3,
  title: 'とおいてき',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'h',
        type: 'hut',
        level: 0,
        hutOwner: 'player'
      },
      {
        id: 't',
        type: 'training',
        level: 2
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
        b: 'h'
      },
      {
        a: 'h',
        b: 'a'
      },
      {
        a: 'k',
        b: 't'
      },
      {
        a: 't',
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
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 6,
  s: 3
};

export const ch22_4: LevelDef = {
  id: 'ch22-4',
  chapter: 22,
  order: 4,
  title: 'ふたりのやくわり',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'h',
        type: 'hut',
        level: 0,
        hutOwner: 'player'
      },
      {
        id: 't',
        type: 'training',
        level: 2
      },
      {
        id: 'w',
        type: 'wall',
        level: 1
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
        a: 'h',
        b: 'w'
      },
      {
        a: 'k',
        b: 't'
      },
      {
        a: 't',
        b: 'w'
      },
      {
        a: 'w',
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
  initialCoins: 4,
  attacks: [],
  tStar: 7,
  s: 3
};
