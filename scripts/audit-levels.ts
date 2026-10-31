/**
 * 面の監査（常設）。面を足したり数値を変えたりしたら毎回走らせる。
 *
 *   npx tsx scripts/audit-levels.ts          # 全面
 *   npx tsx scripts/audit-levels.ts ch4-1    # 1 面だけ
 *
 * 見るもの:
 * - T*（最少ラウンド数）と、データに書いた tStar が一致するか
 * - 駒の大きさ（343×420 の枠＝狭いスマホで描いたときの px）。40px 未満は押しにくい（KP-6）
 * - 当てずっぽう勝率: 合法手を一様に選んで制限ターン内に勝てる割合。高いほど「考えずに解ける」面（P2）
 * - 最短解の中の強制スキップ（何もできないラウンド）
 */
import type { PlayerAction } from '../src/engine/types';
import { LEVELS } from '../src/levels/index';
import { MIN_PIECE_PX, piecePx, randomWinRate } from '../src/levels/metrics';
import { turnLimitOf } from '../src/levels/types';
import { solve } from './solveLevel';

export { MIN_PIECE_PX, NARROW_BOX, NODE_PX, piecePx, randomWinRate } from '../src/levels/metrics';

function describe(action: PlayerAction): string {
  switch (action.kind) {
    case 'move':
      return `${action.pieceId}→${action.toNodeId}`;
    case 'footstep':
      return `${action.pieceId} 足踏み`;
    case 'generate':
      return `生成@${action.hutNodeId}`;
    case 'forced-skip':
      return 'スキップ';
  }
}

function main() {
  const only = process.argv[2];
  const targets = only ? LEVELS.filter((l) => l.id === only) : LEVELS;
  const rows: string[] = [];
  for (const level of targets) {
    const result = solve(level);
    const px = piecePx(level);
    const rate = randomWinRate(level);
    const flags: string[] = [];
    if (!result) flags.push('解なし');
    else if (result.tStar !== level.tStar) flags.push(`tStar ずれ(実測 ${result.tStar})`);
    if (px < MIN_PIECE_PX) flags.push('駒が小さい');
    if (result?.path.some((a) => a.kind === 'forced-skip')) flags.push('最短解にスキップ');
    rows.push(
      [
        level.id.padEnd(6),
        level.title.padEnd(12, '　'),
        `T*=${result?.tStar ?? '-'}`.padEnd(6),
        `制限=${turnLimitOf(level)}`.padEnd(6),
        `駒=${px.toFixed(0)}px`.padEnd(8),
        `当てずっぽう=${(rate * 100).toFixed(1)}%`.padEnd(14),
        flags.join(' ') || 'OK',
      ].join(' '),
    );
    if (only && result) console.log(result.path.map(describe).join(' / '));
  }
  console.log(rows.join('\n'));
}

if (typeof process !== 'undefined' && process.argv[1]?.replace(/\\/g, '/').endsWith('audit-levels.ts')) {
  main();
}
