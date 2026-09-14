import type { Board, BoardNode } from './types';

export function getNode(board: Board, nodeId: string): BoardNode {
  const node = board.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`node not found: ${nodeId}`);
  return node;
}

export function neighbors(board: Board, nodeId: string): string[] {
  const result: string[] = [];
  for (const edge of board.edges) {
    if (edge.a === nodeId) result.push(edge.b);
    else if (edge.b === nodeId) result.push(edge.a);
  }
  return result;
}

/** 未破壊の壁は通れない辺として扱う（§8）。距離計算・敵の経路探索の両方で使う。 */
export function isImpassable(node: BoardNode, blockedNodeIds: ReadonlySet<string>): boolean {
  return node.type === 'wall' || blockedNodeIds.has(node.id);
}

function bfsDistances(board: Board, sourceId: string, blockedNodeIds: ReadonlySet<string>): Map<string, number> {
  const dist = new Map<string, number>([[sourceId, 0]]);
  const queue = [sourceId];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    for (const next of neighbors(board, current)) {
      if (dist.has(next)) continue;
      const node = getNode(board, next);
      if (isImpassable(node, blockedNodeIds)) continue;
      dist.set(next, dist.get(current)! + 1);
      queue.push(next);
    }
  }
  return dist;
}

export function shortestDistance(
  board: Board,
  fromId: string,
  toId: string,
  blockedNodeIds: ReadonlySet<string>
): number | null {
  const dist = bfsDistances(board, fromId, blockedNodeIds);
  return dist.has(toId) ? dist.get(toId)! : null;
}
