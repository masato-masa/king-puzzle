import { describe, expect, it } from 'vitest';

import { LEVELS } from '@/levels/index';
import type { LevelDef } from '@/levels/types';

const levels: LevelDef[] = LEVELS;

describe('level schema', () => {
  it.each(levels)('$id: king が両陣営に1つずつ居る', (level) => {
    const kings = level.initialPieces.filter((p) => p.isKing);
    expect(kings.filter((p) => p.owner === 'player')).toHaveLength(1);
    expect(kings.filter((p) => p.owner === 'enemy')).toHaveLength(1);
  });

  it.each(levels)('$id: edges が nodes に閉じている', (level) => {
    const nodeIds = new Set(level.board.nodes.map((n) => n.id));
    for (const edge of level.board.edges) {
      expect(nodeIds.has(edge.a)).toBe(true);
      expect(nodeIds.has(edge.b)).toBe(true);
    }
  });

  it.each(levels)('$id: 初期駒の位置が重複していない', (level) => {
    const nodeIds = level.initialPieces.map((p) => p.nodeId);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it.each(levels)('$id: 攻撃の対象ノードが実在する（node指定のみ）', (level) => {
    const nodeIds = new Set(level.board.nodes.map((n) => n.id));
    for (const attack of level.attacks) {
      if (attack.target.kind === 'node') {
        expect(nodeIds.has(attack.target.nodeId)).toBe(true);
      }
    }
  });
});
