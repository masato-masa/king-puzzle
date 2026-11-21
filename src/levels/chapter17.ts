import type { LevelDef } from './types';

export const ch17_1: LevelDef = {
  id: 'ch17-1',
  chapter: 17,
  order: 1,
  title: 'わなをとびこえる',
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
      id: 's1',
      type: 'snare',
      target: {
        kind: 'node',
        nodeId: 'a'
      },
      period: 1
    },
    {
      id: 's2',
      type: 'snare',
      target: {
        kind: 'node',
        nodeId: 'c'
      },
      period: 1
    }
  ],
  tStar: 6,
  s: 3
};

export const ch17_2: LevelDef = {
  id: 'ch17-2',
  chapter: 17,
  order: 2,
  title: 'ふさがるみち',
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
      id: 'b1',
      type: 'blockade',
      target: {
        kind: 'node',
        nodeId: 'b'
      },
      period: 4,
      initial: 1,
      duration: 2
    }
  ],
  tStar: 7,
  s: 3
};

export const ch17_3: LevelDef = {
  id: 'ch17-3',
  chapter: 17,
  order: 3,
  title: 'むかえうつ',
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
      level: 3,
      nodeId: 'b',
      behavior: 'march'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 8,
  s: 3
};

export const ch17_4: LevelDef = {
  id: 'ch17-4',
  chapter: 17,
  order: 4,
  title: 'ふたりでやぶる',
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
        id: 'm',
        type: 'mine',
        level: 1
      },
      {
        id: 'w1',
        type: 'wall',
        level: 1
      },
      {
        id: 'w2',
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
        b: 'm'
      },
      {
        a: 'k',
        b: 'h'
      },
      {
        a: 'h',
        b: 'w1'
      },
      {
        a: 'w1',
        b: 'w2'
      },
      {
        a: 'w2',
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
  initialCoins: 4,
  attacks: [],
  tStar: 9,
  s: 3
};
