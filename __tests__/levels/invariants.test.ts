import { describe, expect, it } from 'vitest';

import { invariantViolations } from '@/levels/invariants';
import { LEVELS } from '@/levels/index';
import type { LevelDef } from '@/levels/types';

const base = LEVELS.find((l) => l.id === 'ch21-4')!;

/** 不変条件のチェック自体が働くことの確かめ（章 21-4 の再発防止）。 */
describe('面の不変条件', () => {
  it('敵の王と兵が同じマスにいると見つかる', () => {
    const bad: LevelDef = {
      ...base,
      initialPieces: [...base.initialPieces, { owner: 'enemy', isKing: false, level: 1, nodeId: 'e', behavior: 'march' }],
    };
    expect(invariantViolations(bad).some((m) => m.includes('ノード e に駒が'))).toBe(true);
  });
  it('壁の上に駒がいると見つかる', () => {
    const lv = LEVELS.find((l) => l.board.nodes.some((n) => n.type === 'wall'))!;
    const wall = lv.board.nodes.find((n) => n.type === 'wall')!;
    const bad: LevelDef = { ...lv, initialPieces: [...lv.initialPieces, { owner: 'enemy', isKing: false, level: 1, nodeId: wall.id }] };
    expect(invariantViolations(bad).some((m) => m.includes('壁'))).toBe(true);
  });
  it('実在しないノードへの攻撃が見つかる', () => {
    const bad: LevelDef = { ...base, attacks: [{ id: 'x', type: 'cannon', target: { kind: 'node', nodeId: 'zzz' }, period: 2 }] };
    expect(invariantViolations(bad).some((m) => m.includes('zzz'))).toBe(true);
  });
});
