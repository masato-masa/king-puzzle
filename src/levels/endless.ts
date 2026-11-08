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

/** 入り口の 2 面（ch1-1・ch2-1）は当てずっぽうで勝てる面なので骨格にしない。 */
const POOL = LEVELS.filter((l) => l.id !== 'ch1-1' && l.id !== 'ch2-1');

/** n 面目で「もう出てよい」章の目安。1 面目は 2 章、5 面ごとに 1 章ずつ進む（KP-15）。 */
export function reachChapter(n: number): number {
  return 2 + (n - 1) / 5;
}

/** 同じ骨格が続かないように、直近に使った骨格の重みを下げる。何面さかのぼるか。 */
const RECENT = 6;

/**
 * 骨格にする面の重み。条件で締め出さず、重みで寄せる（CLAUDE.md）。
 * - 章: 目安より先の章ほど急に出にくく（まだ教えていない仕掛けを序盤に出さない。P4）、
 *   目安から 4 章以上遅れた章はゆるやかに出にくくなる（後半に入門の面ばかりにならない）
 * - 最短手数: 狙いに近いほど少し出やすい。揺らしで手数は動くので弱めにかける（偏り P11 の原因だった）
 * - 直近: 直前の骨格は 0.02 倍、3 面以内は 0.1 倍、6 面以内は 0.4 倍
 */
function baseWeight(level: LevelDef, n: number, recent: string[], used = 0): number {
  const { lo, hi } = targetRange(n);
  const center = (lo + hi) / 2;
  const closeness = Math.exp(-Math.abs(level.tStar - center) / 3);
  const reach = reachChapter(n);
  const ahead = Math.max(0, level.chapter - reach);
  const behind = Math.max(0, reach - level.chapter - 4);
  const chapterWeight = Math.exp(-ahead / 0.5) * Math.exp(-behind / 4);
  const at = recent.lastIndexOf(level.id);
  const age = at === -1 ? Infinity : recent.length - at;
  const recency = age <= 1 ? 0.02 : age <= 3 ? 0.1 : age <= RECENT ? 0.4 : 1;
  // これまでに使った回数が多い骨格ほど出にくく（偏りをならす。使うたびに 1/(1+0.15×回数) 倍）
  // 同じ章の骨格が増えすぎないように、章ごとの使用回数でも下げる（章 14 の 4 面が 39% を占めた KP-21）
  const balance = (1 / (1 + 0.15 * used)) * (1 / (1 + 0.05 * (chapterUsed.get(level.chapter) ?? 0)));
  return closeness * chapterWeight * recency * balance;
}

/** 面の番号ごとに決めた骨格の列。直近の骨格に依存するので 1 から順に作って覚えておく（決定的）。 */
const plannedBases: string[] = [];
/** 骨格ごとの、これまでに決めた回数（plannedBases の集計）。 */
const usedCount = new Map<string, number>();
/** 章ごとの、これまでに決めた回数。 */
const chapterUsed = new Map<number, number>();

/** n 面目の骨格（最も厳しい段で使う）。種は番号だけで決まり、生成の成否には左右されない。 */
export function plannedBase(n: number): LevelDef {
  for (let k = plannedBases.length + 1; k <= n; k++) {
    const rand = rng(seedOf(k) ^ 0x5eed);
    const recent = plannedBases.slice(Math.max(0, k - 1 - RECENT), k - 1);
    const id = pickWeighted(rand, POOL, (l) => baseWeight(l, k, recent, usedCount.get(l.id) ?? 0)).id;
    plannedBases.push(id);
    usedCount.set(id, (usedCount.get(id) ?? 0) + 1);
    const ch = POOL.find((l) => l.id === id)!.chapter;
    chapterUsed.set(ch, (chapterUsed.get(ch) ?? 0) + 1);
  }
  return POOL.find((l) => l.id === plannedBases[n - 1])!;
}

function recentBases(n: number): string[] {
  if (n > 1) plannedBase(n - 1);
  return plannedBases.slice(Math.max(0, n - 1 - RECENT), n - 1);
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
/** 施設を本編で初めて教える章（仕様書 §13 の順）。 */
const INTRO_CHAPTER: Record<NodeType, number> = { road: 1, training: 3, wall: 4, hut: 5, mine: 6, stable: 13 };

/** 足す施設の種類を、番号の目安の章で重みづけして選ぶ。まだ教えていない施設は出にくい（KP-15）。 */
function pickFacility(rand: Rand, types: NodeType[], reach: number): NodeType {
  return pickWeighted(rand, types, (t) => Math.exp(-Math.max(0, INTRO_CHAPTER[t] - reach) / 0.25));
}

const MUTATIONS: ((lv: LevelDef, rand: Rand, reach: number) => boolean)[] = [
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
    const nodes = lv.board.nodes.filter((x) => x.type === 'wall' || x.type === 'mine' || x.type === 'training' || x.type === 'stable');
    if (nodes.length === 0) return false;
    const node = pick(rand, nodes);
    const next = clamp(node.level + jitter(rand), 1, node.type === 'stable' ? 3 : 5);
    if (next === node.level) return false;
    node.level = next;
    return true;
  },
  // 敵の兵（王でない敵）のレベル。進軍型・居すわり型の強さが変わる
  (lv, rand) => {
    const foes = lv.initialPieces.filter((p) => p.owner === 'enemy' && !p.isKing);
    if (foes.length === 0) return false;
    const p = pick(rand, foes);
    const next = clamp(p.level + jitter(rand), 1, 5);
    if (next === p.level) return false;
    p.level = next;
    return true;
  },
  // 敵の兵を、空いている道へ置き直す
  (lv, rand) => {
    const foes = lv.initialPieces.filter((p) => p.owner === 'enemy' && !p.isKing);
    if (foes.length === 0) return false;
    const taken = occupied(lv);
    const free = lv.board.nodes.filter((x) => !taken.has(x.id) && x.type === 'road');
    if (free.length === 0) return false;
    pick(rand, foes).nodeId = pick(rand, free).id;
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
  (lv, rand, reach) => {
    const taken = occupied(lv);
    const free = lv.board.nodes.filter((x) => !taken.has(x.id) && x.type === 'road');
    if (free.length === 0) return false;
    const node = pick(rand, free);
    const type = pickFacility(rand, ['training', 'mine', 'wall', 'hut'], reach);
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
  (lv, rand, reach) => {
    if (lv.board.nodes.length >= 9) return false;
    const at = pick(rand, lv.board.nodes);
    const id = `x${lv.board.nodes.length + 1}`;
    const type = pickFacility(rand, ['road', 'training', 'mine', 'hut'], reach);
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
  lv.initialPieces.forEach((p: InitialPieceSetup) => {
    p.nodeId = to(p.nodeId);
    if (p.target) p.target = to(p.target);
  });
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

/** 決めておいた骨格で試す回数。これを過ぎたら骨格を重みで選び直す（条件は緩めない）。 */
const PLANNED_TRIES = 16;

/** 段ごとに使う予算の割合。 */
const STAGE_SHARE = [0.6, 0.25, 0.15];

function finish(lv: LevelDef, n: number, tStar: number): LevelDef {
  return { ...lv, id: `endless-${n}`, chapter: 0, order: n, title: `むげん ${n}`, tStar, s: ENDLESS_S };
}

/** 1 つの候補を作る。 */
function candidate(rand: Rand, base: LevelDef, reach: number, lo: number): { lv: LevelDef; base: LevelDef } | null {
  const lv = cloneLevel(base);
  const before = fingerprint(lv);
  // 骨格の最短手数が狙いより短いときは、揺らしを重ねて手数を伸ばす（入門の骨格も後半に出る）
  const gap = Math.max(0, lo - base.tStar);
  const count = 1 + Math.floor(rand() * 3) + Math.min(gap, 3);
  let applied = 0;
  for (let tries = 0; applied < count && tries < count * 4; tries++) {
    if (pick(rand, MUTATIONS)(lv, rand, reach)) applied++;
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
  const planned = plannedBase(n);
  // 選び直すときは、決めておいた骨格（うまくいかなかった方）も直近扱いにする
  const recent = [...recentBases(n), planned.id];
  const stages = stagesFor(n);
  let attempts = 0;
  for (let si = 0; si < stages.length; si++) {
    const share = Math.round(budget * STAGE_SHARE[si]);
    for (let k = 0; k < share; k++) {
      attempts++;
      // はじめは決めておいた骨格を揺らす。その骨格では狙いの手数に届かないときは、骨格も選び直す
      const base = attempts <= PLANNED_TRIES ? planned : pickWeighted(rand, POOL, (l) => baseWeight(l, n, recent, usedCount.get(l.id) ?? 0));
      const c = candidate(rand, base, reachChapter(n), stages[si].lo);
      if (!c) continue;
      const tStar = accept(c.lv, stages[si], seedOf(n) ^ attempts);
      if (tStar !== null) {
        return { level: finish(c.lv, n, tStar), stage: si as 0 | 1 | 2, attempts, baseId: c.base.id };
      }
    }
  }
  // 最終段: 本編の面をそのまま出す。本編の面は監査テストで解けることを確かめてある
  const base = budget > 0 ? pickWeighted(rand, POOL, (l) => baseWeight(l, n, recent, usedCount.get(l.id) ?? 0)) : planned;
  return { level: finish(cloneLevel(base), n, base.tStar), stage: 3, attempts, baseId: base.id };
}
