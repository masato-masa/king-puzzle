import type { LevelDef } from './types';

export const ch19_1: LevelDef = {
  id: 'ch19-1',
  chapter: 19,
  order: 1,
  title: 'みがわりのへい',
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
  initialCoins: 2,
  attacks: [
    {
      id: 'a1',
      type: 'arrow',
      target: {
        kind: 'tracking',
        rule: 'highest-level'
      },
      period: 2
    }
  ],
  tStar: 6,
  s: 3
};

export const ch19_2: LevelDef = {
  id: 'ch19-2',
  chapter: 19,
  order: 2,
  title: 'そだてたへいでやぶる',
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
        id: 'w',
        type: 'wall',
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
      level: 1,
      nodeId: 'e'
    }
  ],
  initialCoins: 2,
  attacks: [],
  tStar: 7,
  s: 3
};

export const ch19_3: LevelDef = {
  id: 'ch19-3',
  chapter: 19,
  order: 3,
  title: 'へいもおうもそだてる',
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
        id: 'w',
        type: 'wall',
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
  initialCoins: 2,
  attacks: [],
  tStar: 8,
  s: 3
};

export const ch19_4: LevelDef = {
  id: 'ch19-4',
  chapter: 19,
  order: 4,
  title: 'まわりみちのくんれん',
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
        id: 'w',
        type: 'wall',
        level: 2
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
        b: 't'
      },
      {
        a: 't',
        b: 'a'
      },
      {
        a: 'a',
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
  initialCoins: 2,
  attacks: [],
  tStar: 8,
  s: 3
};
