import type { LevelDef } from './types';

export const ch15_1: LevelDef = {
  id: 'ch15-1',
  chapter: 15,
  order: 1,
  title: 'おとりをそだてる',
  board: {
    nodes: [
      {
        id: 'd',
        type: 'road',
        level: 0
      },
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
        id: 'n1',
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
        a: 'd',
        b: 'k'
      },
      {
        a: 'k',
        b: 't'
      },
      {
        a: 't',
        b: 'n1'
      },
      {
        a: 'n1',
        b: 'e'
      }
    ]
  },
  initialPieces: [
    {
      owner: 'player',
      isKing: false,
      level: 2,
      nodeId: 'd'
    },
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
        kind: 'tracking',
        rule: 'highest-level'
      },
      period: 2,
      initial: 2,
      duration: 2
    }
  ],
  tStar: 9,
  s: 3
};

export const ch15_2: LevelDef = {
  id: 'ch15-2',
  chapter: 15,
  order: 2,
  title: 'だれがうたれる',
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
      owner: 'player',
      isKing: false,
      level: 2,
      nodeId: 'a'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 3,
      nodeId: 'e'
    }
  ],
  initialCoins: 4,
  attacks: [
    {
      id: 'c1',
      type: 'cannon',
      target: {
        kind: 'tracking',
        rule: 'highest-level'
      },
      period: 4,
      initial: 3
    }
  ],
  tStar: 7,
  s: 3
};

export const ch15_3: LevelDef = {
  id: 'ch15-3',
  chapter: 15,
  order: 3,
  title: 'みちをあけさせる',
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
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 'm',
        type: 'mine',
        level: 1
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
      },
      {
        id: 't',
        type: 'training',
        level: 2
      }
    ],
    edges: [
      {
        a: 'k',
        b: 'h'
      },
      {
        a: 'k',
        b: 'a'
      },
      {
        a: 'a',
        b: 'm'
      },
      {
        a: 'k',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      },
      {
        a: 'b',
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
      isKing: false,
      level: 2,
      nodeId: 'b',
      behavior: 'occupy',
      target: 'm'
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
  tStar: 7,
  s: 3
};

export const ch15_4: LevelDef = {
  id: 'ch15-4',
  chapter: 15,
  order: 4,
  title: 'まちぶせ',
  board: {
    nodes: [
      {
        id: 'k',
        type: 'road',
        level: 0
      },
      {
        id: 'a1',
        type: 'road',
        level: 0
      },
      {
        id: 'a2',
        type: 'road',
        level: 0
      },
      {
        id: 'c',
        type: 'road',
        level: 0
      },
      {
        id: 'b2',
        type: 'road',
        level: 0
      },
      {
        id: 'b1',
        type: 'road',
        level: 0
      },
      {
        id: 'e',
        type: 'road',
        level: 0
      },
      {
        id: 't',
        type: 'training',
        level: 3
      }
    ],
    edges: [
      {
        a: 'k',
        b: 'a1'
      },
      {
        a: 'a1',
        b: 'a2'
      },
      {
        a: 'a2',
        b: 'c'
      },
      {
        a: 'c',
        b: 'b2'
      },
      {
        a: 'b2',
        b: 'b1'
      },
      {
        a: 'b1',
        b: 'k'
      },
      {
        a: 'c',
        b: 'e'
      },
      {
        a: 'b1',
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
      isKing: false,
      level: 2,
      nodeId: 'c',
      behavior: 'occupy',
      target: 't'
    },
    {
      owner: 'enemy',
      isKing: true,
      level: 2,
      nodeId: 'e'
    }
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 9,
  s: 3
};

