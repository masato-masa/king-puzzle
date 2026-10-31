/**
 * 面の下書き用の短い書き方（常設）。下書きを書いてソルバーと監査で測り、良ければ src/levels/ に清書する。
 *
 *   import { L, A, report } from './draft-level';
 *   report(L('ch4-1', 'かべをこわす', 'n1 n2 n3:w2 n4 n5', 'n1-n2-n3-n4-n5', 'K2@n1 S2@n2 E1@n5', 0, 2));
 *
 * ノード: 'id'（道）/ 'id:t2'（訓練場 Lv2）/ 'id:m1'（採掘場）/ 'id:w2'（壁）/ 'id:h'（自分の小屋）
 * 辺: 'n1-n2-n3' のようにつなげて書く（空白で区切って何本でも）
 * 駒: 'K2@n1'（自分の王 Lv2）/ 'S1@n2'（自分の兵）/ 'E3@n5'（相手の王）/ 'X2@n4'（相手の兵）
 */
import type { AttackDef, AttackType, BoardNode, InitialPieceSetup, TrackingRule } from '../src/engine/types';
import type { LevelDef } from '../src/levels/types';
import { piecePx, randomWinRate } from './audit-levels';
import { solve } from './solveLevel';

export function L(
  id: string,
  title: string,
  nodes: string,
  edges: string,
  pieces: string,
  coins: number,
  s: number,
  attacks: AttackDef[] = [],
): LevelDef {
  const ns: BoardNode[] = nodes
    .split(/\s+/)
    .filter(Boolean)
    .map((spec) => {
      const [nid, t] = spec.split(':');
      if (!t) return { id: nid, type: 'road', level: 0 };
      if (t === 'h') return { id: nid, type: 'hut', level: 0, hutOwner: 'player' };
      const type = ({ t: 'training', m: 'mine', w: 'wall' } as const)[t[0] as 't' | 'm' | 'w'];
      return { id: nid, type, level: Number(t.slice(1)) };
    });
  const es = edges
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((chain) => {
      const parts = chain.split('-');
      return parts.slice(1).map((b, i) => ({ a: parts[i], b }));
    });
  const ps: InitialPieceSetup[] = pieces
    .split(/\s+/)
    .filter(Boolean)
    .map((spec) => {
      const [head, nodeId] = spec.split('@');
      const kind = head[0];
      return {
        owner: kind === 'E' || kind === 'X' ? 'enemy' : 'player',
        isKing: kind === 'K' || kind === 'E',
        level: Number(head.slice(1)),
        nodeId,
      };
    });
  const [chapter, order] = id.slice(2).split('-').map(Number);
  return { id, chapter, order, title, board: { nodes: ns, edges: es }, initialPieces: ps, initialCoins: coins, attacks, tStar: 0, s };
}

/** 決まったノードを狙う攻撃。 */
export function A(id: string, type: AttackType, nodeId: string, period: number, initial?: number, duration?: number): AttackDef {
  return { id, type, target: { kind: 'node', nodeId }, period, initial, duration };
}

/** 追尾する攻撃（その時点の対象を狙う）。 */
export function TR(id: string, type: AttackType, rule: TrackingRule, period: number, initial?: number, duration?: number): AttackDef {
  return { id, type, target: { kind: 'tracking', rule }, period, initial, duration };
}

/** 最短手数・駒の大きさ・当てずっぽう勝率と、最短解の手順を出す。 */
export function report(level: LevelDef): void {
  const r = solve(level, 30);
  const rate = r ? randomWinRate({ ...level, tStar: r.tStar }, 1500) : 0;
  const path = r?.path
    .map((a) => {
      const who = (id: string) => id.replace('player-', '');
      if (a.kind === 'move') return `${who(a.pieceId)}→${a.toNodeId}`;
      if (a.kind === 'footstep') return `${who(a.pieceId)}踏`;
      if (a.kind === 'generate') return `買@${a.hutNodeId}`;
      return 'skip';
    })
    .join(' ');
  console.log(
    `${level.id} ${level.title} T*=${r?.tStar ?? '解なし'} 駒=${piecePx(level).toFixed(0)}px 当てずっぽう=${(rate * 100).toFixed(1)}%\n   ${path ?? ''}`,
  );
}
