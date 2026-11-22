import type { LevelDef } from './types';

/**
 * 面の不変条件。破れていたら理由の文を返す（空なら健全）。
 * 章 21-4 で「敵の王と敵の兵が同じマス」に置かれた面が公開されたため（解けるのでソルバーでは気づけない）、
 * 面を足すたびにテストと監査（scripts/audit-levels.ts）の両方で確かめる。
 */
export function invariantViolations(level: LevelDef): string[] {
  const out: string[] = [];
  const nodes = new Map(level.board.nodes.map((n) => [n.id, n]));
  if (nodes.size !== level.board.nodes.length) out.push('ノード ID が重複している');

  const at = new Map<string, number>();
  for (const p of level.initialPieces) {
    at.set(p.nodeId, (at.get(p.nodeId) ?? 0) + 1);
    const node = nodes.get(p.nodeId);
    if (!node) {
      out.push(`駒が存在しないノード ${p.nodeId} にいる`);
      continue;
    }
    if (node.type === 'wall') out.push(`駒が壁のノード ${p.nodeId} に重なっている`);
    if (p.behavior && (p.owner !== 'enemy' || p.isKing)) out.push(`behavior は敵の兵だけ（${p.nodeId}）`);
    if (p.behavior === 'occupy') {
      const target = p.target ? nodes.get(p.target) : undefined;
      if (!target) out.push(`居座る兵の行き先 ${p.target} が存在しない`);
      else if (target.type === 'road' || target.type === 'wall') out.push(`居座る兵の行き先 ${p.target} が施設ではない`);
    }
  }
  for (const [id, n] of at) if (n > 1) out.push(`ノード ${id} に駒が ${n} 個ある（敵味方を問わず重ならない）`);

  for (const a of level.attacks) {
    if (a.type === 'spawn') {
      if (a.target.kind !== 'node') out.push('spawn は node 指定のみ');
      else {
        const hut = nodes.get(a.target.nodeId);
        if (!hut || hut.type !== 'hut' || hut.hutOwner !== 'enemy') out.push(`spawn の対象 ${a.target.nodeId} が敵の小屋ではない`);
      }
    } else if (a.target.kind === 'node') {
      const t = nodes.get(a.target.nodeId);
      if (!t) out.push(`攻撃 ${a.id} の対象 ${a.target.nodeId} が存在しない`);
      else if (t.type === 'wall') out.push(`攻撃 ${a.id} の対象が壁 ${t.id}`);
    }
    if (a.period < 1) out.push(`攻撃 ${a.id} の周期が 1 未満`);
  }
  const ids = level.attacks.map((a) => a.id);
  if (new Set(ids).size !== ids.length) out.push('攻撃 ID が重複している');

  // 辺でつながっているか（壁も通れる前提のグラフ。孤立したノードがあると、飾りか配置ミス）
  const adj = new Map<string, string[]>();
  for (const e of level.board.edges) {
    (adj.get(e.a) ?? adj.set(e.a, []).get(e.a)!).push(e.b);
    (adj.get(e.b) ?? adj.set(e.b, []).get(e.b)!).push(e.a);
  }
  const start = level.initialPieces.find((p) => p.isKing && p.owner === 'player')?.nodeId;
  if (start) {
    const seen = new Set([start]);
    const q = [start];
    while (q.length) for (const nx of adj.get(q.shift()!) ?? []) if (!seen.has(nx)) (seen.add(nx), q.push(nx));
    const lost = [...nodes.keys()].filter((id) => !seen.has(id));
    if (lost.length) out.push(`王から辺でたどれないノードがある: ${lost.join(',')}`);
  }
  if (!(level.tStar > 0) || !(level.s > 0)) out.push('tStar・s が正でない');
  return out;
}
