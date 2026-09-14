import { neighbors } from '@/engine/board';
import type { Board } from '@/engine/types';

export interface NodePosition {
  x: number;
  y: number;
}

const COL_GAP = 140;
const ROW_GAP = 100;

/**
 * ノード座標の計算はここに集約する（CLAUDE.md）。
 * root（自分のkingの初期ノード）からのBFS距離を横方向のレイヤーとし、
 * 各レイヤー内ではノードIDの昇順で縦に等間隔に並べる。決定的。
 */
export function computeLayout(board: Board, rootId: string): Record<string, NodePosition> {
  const layer = new Map<string, number>([[rootId, 0]]);
  const queue = [rootId];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    for (const next of neighbors(board, current).slice().sort()) {
      if (layer.has(next)) continue;
      layer.set(next, layer.get(current)! + 1);
      queue.push(next);
    }
  }
  const maxLayer = layer.size > 0 ? Math.max(...layer.values()) : 0;
  for (const node of board.nodes) {
    if (!layer.has(node.id)) layer.set(node.id, maxLayer + 1);
  }

  const byLayer = new Map<number, string[]>();
  for (const [id, l] of layer) {
    const list = byLayer.get(l) ?? [];
    list.push(id);
    byLayer.set(l, list);
  }

  const positions: Record<string, NodePosition> = {};
  for (const [l, ids] of byLayer) {
    ids.sort();
    ids.forEach((id, i) => {
      const y = (i - (ids.length - 1) / 2) * ROW_GAP;
      positions[id] = { x: l * COL_GAP, y };
    });
  }
  return positions;
}
