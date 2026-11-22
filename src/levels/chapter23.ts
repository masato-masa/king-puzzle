import type { LevelDef } from './types';

export const ch23_1: LevelDef = {
  id: 'ch23-1',
  chapter: 23,
  order: 1,
  title: 'みはりとへい',
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
        id: 'g',
        type: 'hut',
        level: 0,
        hutOwner: 'enemy'
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
        a: 'a',
        b: 'g'
      },
      {
        a: 'g',
        b: 'e'
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
  initialCoins: 2,
  attacks: [
    {
      id: 'g1',
      type: 'spawn',
      target: {
        kind: 'node',
        nodeId: 'g'
      },
      period: 2,
      initial: 1
    }
  ],
  tStar: 6,
  s: 3
};

export const ch23_2: LevelDef = {
  id: 'ch23-2',
  chapter: 23,
  order: 2,
  title: 'さきにおくる',
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
        id: 'g',
        type: 'hut',
        level: 0,
        hutOwner: 'enemy'
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
        a: 'a',
        b: 'g'
      },
      {
        a: 'g',
        b: 'e'
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
      level: 2,
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
      id: 'g1',
      type: 'spawn',
      target: {
        kind: 'node',
        nodeId: 'g'
      },
      period: 4,
      initial: 2
    }
  ],
  tStar: 7,
  s: 3
};

export const ch23_3: LevelDef = {
  id: 'ch23-3',
  chapter: 23,
  order: 3,
  title: 'じゅんばんのみはり',
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
        id: 'g',
        type: 'hut',
        level: 0,
        hutOwner: 'enemy'
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 't',
        type: 'training',
        level: 3
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
        a: 'a',
        b: 'g'
      },
      {
        a: 'g',
        b: 'e'
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
    }
  ],
  initialCoins: 4,
  attacks: [
    {
      id: 'g1',
      type: 'spawn',
      target: {
        kind: 'node',
        nodeId: 'g'
      },
      period: 3,
      initial: 1
    }
  ],
  tStar: 8,
  s: 3
};

export const ch23_4: LevelDef = {
  id: 'ch23-4',
  chapter: 23,
  order: 4,
  title: 'おうがふたやく',
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
        id: 'g',
        type: 'hut',
        level: 0,
        hutOwner: 'enemy'
      },
      {
        id: 'a',
        type: 'road',
        level: 0
      },
      {
        id: 't',
        type: 'training',
        level: 3
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
        a: 'a',
        b: 'g'
      },
      {
        a: 'g',
        b: 'e'
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
      level: 2,
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
      id: 'g1',
      type: 'spawn',
      target: {
        kind: 'node',
        nodeId: 'g'
      },
      period: 3,
      initial: 2
    }
  ],
  tStar: 9,
  s: 3
};
