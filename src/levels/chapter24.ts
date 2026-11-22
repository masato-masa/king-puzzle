import type { LevelDef } from './types';

export const ch24_1: LevelDef = {
  id: 'ch24-1',
  chapter: 24,
  order: 1,
  title: 'いっぱつめまで',
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
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      },
      {
        a: 'h',
        b: 'a'
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
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 0,
  attacks: [
    {
      id: 't1',
      type: 'arrow',
      target: {
        kind: 'tracking',
        rule: 'king'
      },
      period: 3,
      initial: 3
    }
  ],
  tStar: 6,
  s: 3
};

export const ch24_2: LevelDef = {
  id: 'ch24-2',
  chapter: 24,
  order: 2,
  title: 'あいまにきたえる',
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
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      },
      {
        a: 'h',
        b: 'a'
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
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 0,
  attacks: [
    {
      id: 't1',
      type: 'arrow',
      target: {
        kind: 'tracking',
        rule: 'king'
      },
      period: 3,
      initial: 2
    }
  ],
  tStar: 7,
  s: 3
};

export const ch24_3: LevelDef = {
  id: 'ch24-3',
  chapter: 24,
  order: 3,
  title: 'へいをさきにはしらせる',
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
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      },
      {
        a: 'h',
        b: 'a'
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
    }
  ],
  initialCoins: 2,
  attacks: [
    {
      id: 't1',
      type: 'arrow',
      target: {
        kind: 'tracking',
        rule: 'king'
      },
      period: 3,
      initial: 1
    }
  ],
  tStar: 9,
  s: 3
};

export const ch24_4: LevelDef = {
  id: 'ch24-4',
  chapter: 24,
  order: 4,
  title: 'わなのさきをよむ',
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
        b: 'a'
      },
      {
        a: 'a',
        b: 'b'
      },
      {
        a: 'b',
        b: 'e'
      },
      {
        a: 'h',
        b: 'a'
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
  attacks: [
    {
      id: 't1',
      type: 'snare',
      target: {
        kind: 'tracking',
        rule: 'highest-level'
      },
      period: 3,
      initial: 2
    }
  ],
  tStar: 8,
  s: 3
};
