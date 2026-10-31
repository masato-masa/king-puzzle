/**
 * むげんの監査（常設）。生成器のパラメータを変えたら毎回走らせる。
 *
 *   npx tsx scripts/audit-endless.ts            # 1〜100 面
 *   npx tsx scripts/audit-endless.ts 1 30       # 範囲を指定
 *   npx tsx scripts/audit-endless.ts 1 100 -v   # 1 面ずつ出す
 *
 * 見るもの: 生成時間（平均・最大）、どの段で採れたか（3 段目＝本編の面そのまま＝失敗）、T* の分布、
 * 当てずっぽう勝率（2000 回で測り直す）、骨格にした面の偏り（骨格ごとの回数・1〜10 面に出た章・同じ骨格の連続）。
 */
import { generateEndless, targetRange } from '../src/levels/endless';
import { LEVELS } from '../src/levels/index';
import { piecePx, randomWinRate } from '../src/levels/metrics';

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const verbose = process.argv.includes('-v');
const from = Number(args[0] ?? 1);
const to = Number(args[1] ?? 100);

const times: number[] = [];
const stages = [0, 0, 0, 0];
const tStars = new Map<number, number>();
const bases = new Map<string, number>();
const rates: number[] = [];
let outOfRange = 0;
let minPx = Infinity;
const earlyChapters = new Map<number, number>();
let sameAsPrev = 0;
let prevBase = '';
const chapterOf = (id: string) => LEVELS.find((l) => l.id === id)!.chapter;

for (let n = from; n <= to; n++) {
  const t0 = performance.now();
  const r = generateEndless(n);
  const ms = performance.now() - t0;
  times.push(ms);
  stages[r.stage]++;
  tStars.set(r.level.tStar, (tStars.get(r.level.tStar) ?? 0) + 1);
  bases.set(r.baseId, (bases.get(r.baseId) ?? 0) + 1);
  if (n <= 10) earlyChapters.set(chapterOf(r.baseId), (earlyChapters.get(chapterOf(r.baseId)) ?? 0) + 1);
  if (r.baseId === prevBase) sameAsPrev++;
  prevBase = r.baseId;
  const rate = randomWinRate(r.level, 2000, n);
  rates.push(rate);
  const { lo, hi } = targetRange(n);
  if (r.level.tStar < lo || r.level.tStar > hi) outOfRange++;
  const px = piecePx(r.level);
  minPx = Math.min(minPx, px);
  if (verbose) {
    console.log(
      `${String(n).padStart(3)} 段${r.stage} 試行${String(r.attempts).padStart(3)} ${ms.toFixed(0).padStart(5)}ms T*=${r.level.tStar}（狙い ${lo}〜${hi}） 当てずっぽう=${(rate * 100).toFixed(1)}% 駒=${px.toFixed(0)}px 骨格=${r.baseId}`,
    );
  }
}

const sorted = [...times].sort((a, b) => a - b);
const avg = times.reduce((a, b) => a + b, 0) / times.length;
const count = times.length;
console.log(`\n面 ${from}〜${to}（${count} 面）`);
console.log(`生成時間: 平均 ${avg.toFixed(0)}ms / 中央 ${sorted[Math.floor(count / 2)].toFixed(0)}ms / 最大 ${sorted[count - 1].toFixed(0)}ms`);
console.log(`採れた段: 0=${stages[0]} 1=${stages[1]} 2=${stages[2]} 最終段（本編そのまま）=${stages[3]}`);
console.log(`T* が狙いの範囲外: ${outOfRange}`);
console.log(`T* の分布: ${[...tStars.entries()].sort((a, b) => a[0] - b[0]).map(([t, c]) => `${t}手=${c}`).join(' ')}`);
const rs = [...rates].sort((a, b) => a - b);
console.log(`当てずっぽう勝率（2000 回）: 中央 ${(rs[Math.floor(count / 2)] * 100).toFixed(1)}% / 最大 ${(rs[count - 1] * 100).toFixed(1)}%`);
console.log(`駒の最小: ${minPx.toFixed(0)}px`);
console.log(`骨格: ${[...bases.entries()].sort((a, b) => b[1] - a[1]).map(([id, c]) => `${id}=${c}`).join(' ')}`);
console.log(`骨格の種類: ${bases.size} / 最多 ${Math.max(...bases.values())} 面 / 直前と同じ骨格: ${sameAsPrev} 回`);
console.log(`1〜10 面に出た章: ${[...earlyChapters.entries()].sort((a, b) => a[0] - b[0]).map(([c, k]) => `章${c}=${k}`).join(' ')}`);
