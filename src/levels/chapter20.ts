import type { LevelDef } from './types';

export const ch20_1: LevelDef = {
  id: 'ch20-1',
  chapter: 20,
  order: 1,
  title: 'じゃまなへい',
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
      level: 3,
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
      level: 2,
      nodeId: 'a'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 6,
  s: 3
};

export const ch20_2: LevelDef = {
  id: 'ch20-2',
  chapter: 20,
  order: 2,
  title: 'へいでたおす',
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
        a: 'h',
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
      level: 1,
      nodeId: 'e'
    },
    {
      owner: 'enemy',
      isKing: false,
      level: 3,
      nodeId: 'a'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 7,
  s: 3
};

export const ch20_3: LevelDef = {
  id: 'ch20-3',
  chapter: 20,
  order: 3,
  title: 'まわりみち',
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
        b: 'e'
      },
      {
        a: 'k',
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
      nodeId: 'a'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 7,
  s: 3
};

export const ch20_4: LevelDef = {
  id: 'ch20-4',
  chapter: 20,
  order: 4,
  title: 'じゅんばんにつかう',
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
        a: 'h',
        b: 't'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'e'
      },
      {
        a: 'k',
        b: 't'
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
      level: 3,
      nodeId: 'a'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 9,
  s: 3
};
