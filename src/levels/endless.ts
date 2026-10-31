/**
 * むげん（面の番号から作る面）。
 *
 * 手作りの本編の面を骨格にして、数値（レベル・コイン・攻撃の間隔）と配置（王の位置・施設）を揺らし、
 * ソルバーで「解ける・最短手数が番号に合う・当てずっぽうでは勝てない・駒が押せる大きさ」を満たすものだけを採る。
 * 白紙から作ると配置のまとまりが無い面になりやすい（Knowledge/game-fun/research-2026-11-01-daily-puzzle.md）ので、
 * 本編の「気づき」の形を残したまま数字と場所を変える。
 *
 * 乱数の種は面の番号だけから決める。同じ番号からは必ず同じ面が出る。
 * 条件を緩める梯子を持ち、最終段は本編の面をそのまま出す（必ず成功する）。
 */
import { solve } from '@/engine/solver';
import type { AttackDef, BoardNode, InitialPieceSetup, NodeType } from '@/engine/types';

import { LEVELS } from './index';
import { MIN_PIECE_PX, piecePx, randomWinRate, rng } from './metrics';
import type { LevelDef } from './types';

/** ターン制限の余裕。本編と同じ。 */
const ENDLESS_S = 3;
/** 1 面を作るのに試す候補の数（既定）。 */
export const DEFAULT_BUDGET = 80;
/** 当てずっぽう勝率を測る回数。本編の監査（2000 回）より少ないが、選別には足りる。 */
const RANDOM_TRIALS = 300;

export interface EndlessResult {
  level: LevelDef;
  /** 何段目の条件で採れたか。0 が最も厳しい。3 は本編の面をそのまま出した。 */
  stage: 0 | 1 | 2 | 3;
  /** 試した候補の数。 */
  attempts: number;
  /** 骨格にした本編の面。 */
  baseId: string;
}

/** 番号に応じた最短手数の範囲。少しずつ長くなり、7〜9 で頭打ち。 */
export function targetRange(n: number): { lo: number; hi: number } {
  const lo = Math.min(3 + Math.floor((n - 1) / 12), 7);
  return { lo, hi: lo + 2 };
}

/** 当てずっぽう勝率の上限。入り口はやさしく、すぐに「考えないと勝てない」へ。 */
export function maxRandomRate(n: number): number {
  if (n <= 3) return 0.25;
  if (n <= 15) return 0.1;
  return 0.05;
}

/** 面の番号 → 乱数の種。近い番号でも種が離れるようにかき混ぜる。 */
function seedOf(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

type Rand = () => number;

const pick = <T>(rand: Rand, items: T[]): T => items[Math.floor(rand() * items.length)];

function pickWeighted<T>(rand: Rand, items: T[], weight: (item: T) => number): T {
  const ws = items.map(weight);
  const total = ws.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * 骨格にする面の重み。最短手数が狙いに近いほど、また番号のわりに先の章でないほど選ばれやすい。
 * 条件で締め出さず、重みで寄せる（CLAUDE.md）。
 */
function baseWeight(level: LevelDef, n: number): number {
  const { lo, hi } = targetRange(n);
  const center = (lo + hi) / 2;
  const closeness = Math.exp(-Math.abs(level.tStar - center) / 1.5);
  const reachChapter = 3 + Math.floor(n / 3);
  const chapterWeight = level.chapter <= reachChapter ? 1 : 0.15;
  return closeness * chapterWeight;
}

function cloneLevel(level: LevelDef): LevelDef {
  return {
    ...level,
    board: { nodes: level.board.nodes.map((x) => ({ ...x })), edges: level.board.edges.map((e) => ({ ...e })) },
    initialPieces: level.initialPieces.map((p) => ({ ...p })),
    attacks: level.attacks.map((a) => ({ ...a, target: { ...a.target } }) as AttackDef),
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const jitter = (rand: Rand) => (rand() < 0.5 ? -1 : 1);

function degree(level: LevelDef, id: string): number {
  return level.board.edges.filter((e) => e.a === id || e.b === id).length;
}

function occupied(level: LevelDef): Set<string> {
  return new Set(level.initialPieces.map((p) => p.nodeId));
}

/** 揺らし方の一覧。どれも 1 か所だけ変える。変えられなければ false。 */
const MUTATIONS: ((lv: LevelDef, rand: Rand) => boolean)[] = [
  // 駒のレベル
  (lv, rand) => {
    const p = pick(rand, lv.initialPieces);
    const next = clamp(p.level + jitter(rand), 1, 5);
    if (next === p.level) return false;
    p.level = next;
    return true;
  },
  // 施設・壁のレベル
  (lv, rand) => {
    const nodes = lv.board.nodes.filter((x) => x.type === 'wall' || x.type === 'mine' || x.type === 'training');
    if (nodes.length === 0) return false;
    const node = pick(rand, nodes);
    const next = clamp(node.level + jitter(rand), 1, 5);
    if (next === node.level) return false;
    node.level = next;
    return true;
  },
  // 最初のコイン（小屋は 2 コインなので 2 ずつ）
  (lv, rand) => {
    if (!lv.board.nodes.some((x) => x.type === 'hut' || x.type === 'mine')) return false;
    const next = clamp(lv.initialCoins + 2 * jitter(rand), 0, 8);
    if (next === lv.initialCoins) return false;
    lv.initialCoins = next;
    return true;
  },
  // 攻撃の間隔・最初の待ち
  (lv, rand) => {
    if (lv.attacks.length === 0) return false;
    const a = pick(rand, lv.attacks);
    if (rand() < 0.5) {
      const next = clamp(a.period + jitter(rand), 2, 5);
      if (next === a.period) return false;
      a.period = next;
    } else {
      const next = clamp((a.initial ?? a.period) + jitter(rand), 1, 5);
      if (next === (a.initial ?? a.period)) return false;
      a.initial = next;
    }
    return true;
  },
  // 相手の王を、空いている別の行き止まりへ
  (lv, rand) => {
    const king = lv.initialPieces.find((p) => p.owner === 'enemy' && p.isKing);
    if (!king) return false;
    const taken = occupied(lv);
    const leaves = lv.board.nodes.filter((x) => !taken.has(x.id) && x.type === 'road' && degree(lv, x.id) === 1);
    if (leaves.length === 0) return false;
    king.nodeId = pick(rand, leaves).id;
    return true;
  },
  // 自分の兵を、空いている道へ
  (lv, rand) => {
    const soldiers = lv.initialPieces.filter((p) => p.owner === 'player' && !p.isKing);
    if (soldiers.length === 0) return false;
    const taken = occupied(lv);
    const free = lv.board.nodes.filter((x) => !taken.has(x.id) && x.type === 'road');
    if (free.length === 0) return false;
    pick(rand, soldiers).nodeId = pick(rand, free).id;
    return true;
  },
  // 空いている道を施設に変える
  (lv, rand) => {
    const taken = occupied(lv);
    const free = lv.board.nodes.filter((x) => !taken.has(x.id) && x.type === 'road');
    if (free.length === 0) return false;
    const node = pick(rand, free);
    const type = pick<NodeType>(rand, ['training', 'mine', 'wall', 'hut']);
    node.type = type;
    if (type === 'hut') {
      node.level = 0;
      node.hutOwner = 'player';
    } else {
      node.level = 1 + Math.floor(rand() * 3);
    }
    return true;
  },
  // 行き止まりの枝を 1 つ足す（道・訓練場・採掘場・小屋）
  (lv, rand) => {
    if (lv.board.nodes.length >= 9) return false;
    const at = pick(rand, lv.board.nodes);
    const id = `x${lv.board.nodes.length + 1}`;
    const type = pick<NodeType>(rand, ['road', 'training', 'mine', 'hut']);
    const node: BoardNode = { id, type, level: type === 'road' || type === 'hut' ? 0 : 1 + Math.floor(rand() * 3) };
    if (type === 'hut') node.hutOwner = 'player';
    lv.board.nodes.push(node);
    lv.board.edges.push({ a: at.id, b: id });
    return true;
  },
];

/** ノードの名前を付け替える。同じ段の中の並びが変わり、盤の見た目が変わる（座標は ID の順で決まる）。 */
function relabel(lv: LevelDef, rand: Rand): void {
  const ids = lv.board.nodes.map((x) => x.id);
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const map = new Map(ids.map((id) => [id, `n${shuffled.indexOf(id) + 1}`] as const));
  const to = (id: string) => map.get(id)!;
  lv.board.nodes.forEach((x) => (x.id = to(x.id)));
  lv.board.edges.forEach((e) => {
    e.a = to(e.a);
    e.b = to(e.b);
  });
  lv.initialPieces.forEach((p: InitialPieceSetup) => (p.nodeId = to(p.nodeId)));
  lv.attacks.forEach((a) => {
    if (a.target.kind === 'node') a.target = { kind: 'node', nodeId: to(a.target.nodeId) };
  });
}

function fingerprint(lv: LevelDef): string {
  return JSON.stringify([lv.board, lv.initialPieces, lv.initialCoins, lv.attacks]);
}

interface Stage {
  lo: number;
  hi: number;
  maxRate: number;
}

function stagesFor(n: number): Stage[] {
  const { lo, hi } = targetRange(n);
  const rate = maxRandomRate(n);
  return [
    { lo, hi, maxRate: rate },
    { lo: Math.max(2, lo - 1), hi: hi + 1, maxRate: Math.min(rate * 2, 0.3) },
    { lo: 2, hi: hi + 2, maxRate: 0.35 },
  ];
}

/** 段ごとに使う予算の割合。 */
const STAGE_SHARE = [0.6, 0.25, 0.15];

function finish(lv: LevelDef, n: number, tStar: number): LevelDef {
  return { ...lv, id: `endless-${n}`, chapter: 0, order: n, title: `むげん ${n}`, tStar, s: ENDLESS_S };
}

/** 1 つの候補を作る。 */
function candidate(n: number, rand: Rand, pool: LevelDef[]): { lv: LevelDef; base: LevelDef } | null {
  const base = pickWeighted(rand, pool, (l) => baseWeight(l, n));
  const lv = cloneLevel(base);
  const before = fingerprint(lv);
  const count = 1 + Math.floor(rand() * 3);
  let applied = 0;
  for (let tries = 0; applied < count && tries < count * 4; tries++) {
    if (pick(rand, MUTATIONS)(lv, rand)) applied++;
  }
  if (fingerprint(lv) === before) return null;
  relabel(lv, rand);
  return { lv, base };
}

/** 候補が段の条件を満たすか。満たせば最短手数を返す。 */
function accept(lv: LevelDef, stage: Stage, seed: number): number | null {
  if (piecePx({ ...lv }) < MIN_PIECE_PX) return null;
  const result = solve(lv, stage.hi + 1);
  if (!result || result.tStar < stage.lo || result.tStar > stage.hi) return null;
  if (result.path.some((a) => a.kind === 'forced-skip')) return null;
  const rate = randomWinRate({ ...lv, tStar: result.tStar, s: ENDLESS_S }, RANDOM_TRIALS, seed);
  if (rate > stage.maxRate) return null;
  return result.tStar;
}

/**
 * n 面目（1 から）を作る。budget は試す候補の総数。0 にすると最終段（本編の面そのまま）だけが走る。
 */
export function generateEndless(n: number, budget = DEFAULT_BUDGET): EndlessResult {
  const rand = rng(seedOf(n));
  // 入り口の 2 面（ch1-1・ch2-1）は当てずっぽうで勝てる面なので骨格にしない
  const pool = LEVELS.filter((l) => l.chapter > 1 || l.order > 1).filter((l) => l.id !== 'ch2-1');
  const stages = stagesFor(n);
  let attempts = 0;
  for (let si = 0; si < stages.length; si++) {
    const share = Math.round(budget * STAGE_SHARE[si]);
    for (let k = 0; k < share; k++) {
      attempts++;
      const c = candidate(n, rand, pool);
      if (!c) continue;
      const tStar = accept(c.lv, stages[si], seedOf(n) ^ attempts);
      if (tStar !== null) {
        return { level: finish(c.lv, n, tStar), stage: si as 0 | 1 | 2, attempts, baseId: c.base.id };
      }
    }
  }
  // 最終段: 本編の面をそのまま出す。本編の面は監査テストで解けることを確かめてある
  const base = pickWeighted(rand, pool, (l) => baseWeight(l, n));
  return { level: finish(cloneLevel(base), n, base.tStar), stage: 3, attempts, baseId: base.id };
}
