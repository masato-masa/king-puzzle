import type { LevelDef } from './types';

export const ch21_1: LevelDef = {
  id: 'ch21-1',
  chapter: 21,
  order: 1,
  title: 'そだってからあう',
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
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 1,
      nodeId: 'b',
      behavior: 'march'
    }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 6,
  s: 3
};

export const ch21_2: LevelDef = {
  id: 'ch21-2',
  chapter: 21,
  order: 2,
  title: 'ゆきとおり',
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
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 1,
      nodeId: 'b',
      behavior: 'march'
    }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 7,
  s: 3
};

export const ch21_3: LevelDef = {
  id: 'ch21-3',
  chapter: 21,
  order: 3,
  title: 'いすわるへいとうま',
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
        id: 's',
        type: 'stable',
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
  tStar: 7,
  s: 3
};

export const ch21_4: LevelDef = {
  id: 'ch21-4',
  chapter: 21,
  order: 4,
  title: 'ふたりのしんぐんへい',
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
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 1,
      nodeId: 'b',
      behavior: 'march'
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 1,
      nodeId: 'a',
      behavior: 'march'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 9,
  s: 3
};
