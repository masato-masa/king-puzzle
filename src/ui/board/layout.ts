import { neighbors } from '@/engine/board';
import type { Board } from '@/engine/types';

export interface NodePosition {
  x: number;
  y: number;
}

const COL_GAP = 115;
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

/** 盤の端の余白（ノードの中心から外側へ）。駒の絵がはみ出さない幅。 */
const MARGIN = 60;

export interface FittedLayout {
  /** 縦向きに並べ直したか（root が下、遠いノードほど上）。 */
  vertical: boolean;
  /** 座標 1 単位あたりの px。1 を超えない（設計の大きさより大きくしない）。 */
  scale: number;
  minX: number;
  minY: number;
  /** 座標の単位での盤の幅と高さ（余白込み）。 */
  width: number;
  height: number;
  positions: Record<string, NodePosition>;
}

/**
 * 盤を置ける枠（px）に合わせて、横向きと縦向きのうち大きく描ける方を選び、
 * 座標・ノード・駒をまとめて同じ倍率で縮める。
 * 座標だけ縮めてノードを固定の大きさにすると、広い盤でノードどうしが重なる（KP-1）。
 * 同じ倍率で縮めれば、ノードの間隔と大きさの比は設計どおりのまま保たれる。
 */
export function fitLayout(
  positions: Record<string, NodePosition>,
  boxWidth: number,
  boxHeight: number,
): FittedLayout {
  const fit = (pos: Record<string, NodePosition>, vertical: boolean): FittedLayout => {
    const xs = Object.values(pos).map((p) => p.x);
    const ys = Object.values(pos).map((p) => p.y);
    const minX = Math.min(...xs) - MARGIN;
    const minY = Math.min(...ys) - MARGIN;
    const width = Math.max(...xs) + MARGIN - minX;
    const height = Math.max(...ys) + MARGIN - minY;
    const scale = Math.min(1, boxWidth / width, boxHeight / height);
    return { vertical, scale, minX, minY, width, height, positions: pos };
  };
  const rotated: Record<string, NodePosition> = {};
  for (const [id, p] of Object.entries(positions)) rotated[id] = { x: p.y, y: -p.x };
  const horizontal = fit(positions, false);
  const vertical = fit(rotated, true);
  // 同じ大きさで描けるなら、今までどおり横に並べる。
  return vertical.scale > horizontal.scale + 1e-9 ? vertical : horizontal;
}
