import { describe, expect, it } from 'vitest';

import { applyEnemyMovePhase, enemyMovePreview, nextStep } from '@/engine/enemies';
import { getLegalActions } from '@/engine/legalActions';
import { reachableNodes } from '@/engine/movement';
import { createInitialState } from '@/engine/state';
import { playRound } from '@/engine/turn';
import type { AttackDef, BoardNode, InitialPieceSetup } from '@/engine/types';

/** 'a-b-c d-b' のように辺を書き、'c:w3' のようにノードの種類を書く小さな盤。 */
function make(nodes: string, edges: string, pieces: InitialPieceSetup[], attacks: AttackDef[] = [], coins = 0) {
  const ns: BoardNode[] = nodes.split(' ').map((spec) => {
    const [id, t] = spec.split(':');
    if (!t) return { id, type: 'road', level: 0 };
    if (t === 'e') return { id, type: 'hut', level: 0, hutOwner: 'enemy' };
    const type = ({ w: 'wall', t: 'training', s: 'stable' } as const)[t[0] as 'w' | 't' | 's'];
    return { id, type, level: Number(t.slice(1)) };
  });
  const es = edges.split(' ').flatMap((chain) => {
    const p = chain.split('-');
    return p.slice(1).map((b, i) => ({ a: p[i], b }));
  });
  return createInitialState({ board: { nodes: ns, edges: es }, initialPieces: pieces, initialCoins: coins, attacks, turnLimit: 20 });
}

const king = (nodeId: string, level = 2): InitialPieceSetup => ({ owner: 'player', isKing: true, level, nodeId });
const enemyKing = (nodeId: string, level = 1): InitialPieceSetup => ({ owner: 'enemy', isKing: true, level, nodeId });

describe('敵の兵（§8）', () => {
  it('進軍型は自分の王へ最短で進み、同じ長さなら次のノードの ID が小さい方へ', () => {
    const s = make('k a1 a2 c b2 b1', 'k-a1-a2-c-b2-b1-k', [king('k'), { owner: 'enemy', isKing: false, level: 1, nodeId: 'c', behavior: 'march' }]);
    const m = s.pieces.find((p) => p.behavior)!;
    expect(nextStep(s, m)).toBe('a2');
    expect(applyEnemyMovePhase(s).pieces.find((p) => p.id === m.id)!.nodeId).toBe('a2');
    expect(enemyMovePreview(s)).toEqual([{ pieceId: m.id, nodeId: 'a2' }]);
  });

  it('壁は通らない', () => {
    const s = make('k w:w2 c a b', 'k-w-c c-a-b-k', [king('k'), { owner: 'enemy', isKing: false, level: 1, nodeId: 'c', behavior: 'march' }]);
    expect(nextStep(s, s.pieces[1])).toBe('a');
  });

  it('自分の駒にぶつかると戦闘になり、王が負ければ負け', () => {
    const s = make('k c e', 'k-c-e', [king('k', 2), { owner: 'enemy', isKing: false, level: 3, nodeId: 'c', behavior: 'march' }, enemyKing('e')]);
    const next = playRound(s, { kind: 'footstep', pieceId: s.pieces[0].id });
    expect(next.status).toBe('lost-king');
    const enemy = next.pieces.find((p) => p.behavior)!;
    expect(enemy.level).toBe(1);
    expect(enemy.nodeId).toBe('k');
  });

  it('居すわり型は目当ての施設に着いたら動かない', () => {
    const s = make('k n t:t3 o', 'k-n-t-o', [king('k'), { owner: 'enemy', isKing: false, level: 1, nodeId: 'o', behavior: 'occupy', target: 't' }]);
    const once = applyEnemyMovePhase(s);
    expect(once.pieces[1].nodeId).toBe('t');
    expect(applyEnemyMovePhase(once).pieces[1].nodeId).toBe('t');
  });

  it('敵の小屋は空いていれば兵を生み、生まれたラウンドは動かない。塞げば生まない', () => {
    const spawn: AttackDef = { id: 'g1', type: 'spawn', target: { kind: 'node', nodeId: 'g' }, period: 2, initial: 1 };
    const s = make('k n g:e', 'k-n-g', [king('k', 3)], [spawn]);
    const r1 = playRound(s, { kind: 'footstep', pieceId: s.pieces[0].id });
    const born = r1.pieces.find((p) => p.owner === 'enemy')!;
    expect(born).toMatchObject({ nodeId: 'g', level: 1, behavior: 'march' });
    const r2 = playRound(r1, { kind: 'footstep', pieceId: s.pieces[0].id });
    expect(r2.pieces.find((p) => p.id === born.id)!.nodeId).toBe('n');

    const blocked = make('k g:e', 'k-g', [king('g', 3)], [spawn]);
    const b1 = playRound(blocked, { kind: 'footstep', pieceId: blocked.pieces[0].id });
    expect(b1.pieces.filter((p) => p.owner === 'enemy')).toHaveLength(0);
  });
});

describe('馬小屋と速さ（§5 speed）', () => {
  it('乗ってターンを終えると速さが馬小屋のレベルまで 1 ずつ上がる', () => {
    let s = make('s:s2 a', 's-a', [king('s')]);
    s = playRound(s, { kind: 'footstep', pieceId: s.pieces[0].id });
    expect(s.pieces[0].speed).toBe(2);
    s = playRound(s, { kind: 'footstep', pieceId: s.pieces[0].id });
    expect(s.pieces[0].speed).toBe(2);
  });

  it('足踏みで馬小屋のレベルが上がる（Lv2→3 は 8 コイン、上限 Lv3）', () => {
    let s = make('s:s2', 's-s', [king('s')], [], 10);
    s = { ...s, board: { ...s.board, edges: [] } };
    s = playRound(s, { kind: 'footstep', pieceId: s.pieces[0].id });
    expect(s.board.nodes[0].level).toBe(3);
    expect(s.coins).toBe(2);
  });

  it('速さ 2 なら空いたマスを通り抜けて 2 マス先へ。駒・壁・封鎖は通り抜けられない', () => {
    const s = make('k a b w:w1 c', 'k-a-b k-w-c', [king('k')]);
    const fast = { ...s, pieces: [{ ...s.pieces[0], speed: 2 }] };
    expect(reachableNodes(fast, fast.pieces[0]).sort()).toEqual(['a', 'b']);
    const withPiece = make('k a b', 'k-a-b', [{ owner: 'player', isKing: false, level: 1, nodeId: 'a' }, king('k')]);
    const k2 = { ...withPiece.pieces[1], speed: 2 };
    expect(reachableNodes({ ...withPiece, pieces: [withPiece.pieces[0], k2] }, k2)).toEqual([]);
    const blockaded = { ...fast, blockades: { a: 1 } };
    expect(reachableNodes(blockaded, blockaded.pieces[0])).toEqual([]);
  });

  it('速さ 2 の移動は合法手に入り、2 マス先の敵の王を倒せる', () => {
    const s = make('k a e', 'k-a-e', [king('k'), enemyKing('e')]);
    const fast = { ...s, pieces: s.pieces.map((p) => (p.owner === 'player' ? { ...p, speed: 2 } : p)) };
    const move = getLegalActions(fast).find((a) => a.kind === 'move' && a.toNodeId === 'e')!;
    expect(playRound(fast, move).status).toBe('won');
  });
});
