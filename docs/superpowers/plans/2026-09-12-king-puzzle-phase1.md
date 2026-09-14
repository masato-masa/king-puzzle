# king-puzzle フェーズ1（雛形〜章1-3公開）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** king-puzzle の engine（ルール・シミュレータ）を仕様書 §2,3,5,6,7,8 に忠実に実装し、
章1〜3の3ステージを最小UIで遊べる形にして GitHub Pages に公開する。

**Architecture:** `src/engine/` に純TypeScriptのターン制シミュレータを作る（React非依存）。
`src/levels/` にステージ定義、`scripts/solveLevel.ts` に BFS ソルバー（作問ツール側、`T*` を実測する）、
`src/ui/` に最小限のクリック操作のボード画面を作る。Vite + React 19 + TypeScript、
`shared-ui/` の共通CSS・アイコンを取り込む。GitHub Pages（`gh-pages` ブランチへ orphan commit）で公開する。

**Tech Stack:** Vite 6 / React 19 / TypeScript 5 / Vitest 3 (jsdom) / tsx（Nodeスクリプト実行）/ gh CLI

**Spec:** `docs/superpowers/specs/2026-09-12-king-puzzle-design.md`
（敵モデルの背景は `docs/superpowers/specs/2026-09-12-enemy-models.md`）

## Global Constraints

- 画面内の文言・見出しはすべて日本語（CLAUDE.md）。
- `src/engine/` は React を import しない。純粋関数、`GameState` を書き換えず新しい状態を返す（undo をタダで成立させるため）。
- 施設は自分のターン終了時にそこに居る**足止めされていない**駒にだけ効く（§2③・§7）。
- 足踏みは「選べる駒であれば常に選べる」。条件を満たさなければ何も起きない（§2④）。No-opは合法な結果であってエラーではない。
- king は自分と同レベル以上の敵駒（敵kingを含む）には移動で突っ込めない（§5 条件4）。壁も king は破れない（条件3）。
- 勝利判定は自分のターンの移動直後に確定し、それ以降のステップ（施設発動含む）を実行しない（§7・§19）。
- 攻撃・封鎖の `duration` は付与されたラウンドでは減算しない（§7 step6・§19）。
- コインの上限は30、駒の生成費は2、施設の最大レベルは5（訓練場・採掘場。馬小屋はフェーズ4で追加）（§6）。
- 確認ダイアログを出さない（§14）。ただしフェーズ1は**クリックで選択→クリックで確定**の簡易操作とし、
  ドラッグ・7px閾値・バネアニメーション・WebAudio・vibrate は §14 の本則だがフェーズ5で追加する
  （後述「フェーズ1のスコープ外」）。これは仕様からの逸脱ではなく、意図した段階公開である。
- 敵駒（占拠型・進軍型、§8）と馬小屋/速度（§13、複数ホップの細則が §20 で未決）はフェーズ1に含めない。
  周期攻撃・追尾攻撃（§8 のうち敵駒を除く部分）は含める。
- `T*` は必ずソルバーで実測してから `LevelDef.tStar` に書く。推測で数値を書かない（CLAUDE.md「断言する前に測る」）。
- GitHub: `gh` で `masato-masa/king-puzzle` を新規作成し、`animal-puzzle` と同じ gh-pages orphan commit 方式で公開する。

## フェーズ1のスコープ外（次フェーズで対応・仕様違反ではない）

| 項目 | 理由 |
|---|---|
| 章4〜13の面、馬小屋・敵駒・壁以外の全要素の組み合わせ | フェーズ4で章ごとに追加 |
| フルドラッグ操作・バネアニメーション・WebAudio効果音・vibrate | フェーズ5の仕上げ。フェーズ1はクリック選択で機能を検証する |
| アート（生成AI素材の切り出し） | フェーズ5 |
| IDA*＋置換表ソルバー | 章1〜3は状態空間が小さく BFS で十分。状態空間が増える章4以降でフェーズ4にて置き換える |
| 開発者メニューの詳細（レベルジャンプ等） | 「きろくをけす」だけ最小実装し、他はフェーズ5 |
| §9 の許容度（難易度）自動測定ツール | 作問ツール側の機能。フェーズ1は3面とも `S=4` 固定の手作業設計なので不要。章が増え作問量が増えるフェーズ4で追加する |
| 中断した盤面の毎ターン自動保存（§15） | フェーズ1の面は3〜4手で終わるため影響が小さい。★とクリア記録（`src/storage/progress.ts`）は実装する。章が長くなるフェーズ4で追加する |
| `scripts/audit-levels.mjs`（§17 の常設監査ツール） | 面数が3つの段階では費用対効果が薄い。`__tests__/levels/schema.test.ts` で構造検査の最小版だけ先に用意する。面が増えるフェーズ4で本格導入する |

---

### Task 0: プロジェクト雛形と開発サーバ

**Files:**
- Create: `C:\claude\king-puzzle\package.json`
- Create: `C:\claude\king-puzzle\tsconfig.json`
- Create: `C:\claude\king-puzzle\vite.config.ts`
- Create: `C:\claude\king-puzzle\index.html`
- Create: `C:\claude\king-puzzle\src\main.tsx`
- Create: `C:\claude\king-puzzle\src\App.tsx`（仮実装。Task 23 で最終形に差し替える）
- Create: `C:\claude\king-puzzle\src\vite-env.d.ts`
- Create: `C:\claude\king-puzzle\.gitignore`
- Create: `C:\claude\king-puzzle\public\favicon.svg`

**Interfaces:**
- Produces: `npm run dev` / `npm run build` / `npm run test` / `npm run typecheck` / `npm run deploy` の各コマンド。
  以降のすべてのタスクはこの雛形の上に積む。

- [ ] **Step 1: package.json を書く**

```json
{
  "name": "king-puzzle",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5190 --strictPort",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 5190 --strictPort",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "solve": "tsx scripts/solveLevel.ts",
    "deploy": "npm run build && node scripts/deploy.mjs"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.20.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.2.7"
  }
}
```

- [ ] **Step 2: tsconfig.json を書く**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals", "node"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "__tests__/**/*.ts", "scripts/**/*.ts", "vite.config.ts"]
}
```

- [ ] **Step 3: vite.config.ts を書く**

```ts
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// GitHub Pages はリポジトリ名のサブパスで配信される。ここを変えるとビルド後の
// アセット参照が全部壊れるので、リポジトリ名と必ず一致させること。
export default defineConfig({
  base: '/king-puzzle/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: index.html を書く**

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#F6F5EF" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <title>king-puzzle</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: public/favicon.svg を書く（簡易な城アイコン）**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="4" y="10" width="16" height="10" fill="#9179d1" />
  <path d="M4 10 L4 6 L7 6 L7 4 L9 4 L9 6 L12 6 L12 4 L14 4 L14 6 L17 6 L17 4 L20 4 L20 10 Z" fill="#735056" />
</svg>
```

- [ ] **Step 6: src/vite-env.d.ts を書く**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: 仮の main.tsx / App.tsx を書く（あとで Task 23 が置き換える）**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx`:
```tsx
export function App() {
  return <p>king-puzzle: 準備中</p>;
}
```

- [ ] **Step 8: .gitignore を書く**

```
# 依存
node_modules/

# ビルド成果物
dist/

# ログ
npm-debug.*
yarn-debug.*
yarn-error.*

# OS
.DS_Store
*.pem

# ローカルの環境変数
.env*.local

# TypeScript
*.tsbuildinfo
```

- [ ] **Step 9: 依存インストールと動作確認**

Run: `cd C:\claude\king-puzzle && npm install`
Expected: 依存が解決されエラーなく終わる。

Run: `npm run dev` を `run_in_background: true` で起動し、`http://localhost:5190/` をブラウザツールで開いて
「king-puzzle: 準備中」が表示されることを確認する。確認後サーバは止めない（後のタスクで使い続ける）。

- [ ] **Step 10: git 初期化とコミット**

```bash
git init -q
git add package.json tsconfig.json vite.config.ts index.html public src .gitignore
git commit -m "chore: scaffold king-puzzle (Vite + React + TS)"
```

---

### Task 1: shared-ui 統合

**Files:**
- Modify: `C:\claude\shared-ui\sync.mjs`
- Create (生成物、sync.mjs が書く): `C:\claude\king-puzzle\src\ui\shared\tokens.css`
- Create (生成物): `C:\claude\king-puzzle\src\ui\shared\chrome.css`
- Create (生成物): `C:\claude\king-puzzle\src\ui\shared\tool-icons.tsx`

**Interfaces:**
- Produces: `src/ui/shared/tokens.css`（CSS変数）、`chrome.css`（`.header` `.header-row` `.icon-btn` `.status-bar` 等のクラス）、
  `tool-icons.tsx` の `UndoToolIcon()` コンポーネント（Task 20 で使う）。

- [ ] **Step 1: sync.mjs の配り先に king-puzzle を追加する**

`C:\claude\shared-ui\sync.mjs` の `TARGETS` 配列に追加:

```js
const TARGETS = [
  join(root, 'test', 'src', 'ui', 'shared'),
  join(root, 'animal-puzzle', 'src', 'ui', 'shared'),
  join(root, 'cat-maze', 'src', 'styles', 'shared'),
  join(root, 'king-puzzle', 'src', 'ui', 'shared'),
];
```

`ICON_TARGETS` 配列に追加:

```js
const ICON_TARGETS = [
  [join(root, 'test', 'src', 'ui', 'shared', 'tool-icons.tsx'), emitTsx],
  [join(root, 'animal-puzzle', 'src', 'ui', 'shared', 'tool-icons.tsx'), emitTsx],
  [join(root, 'cat-maze', 'src', 'ui', 'shared', 'tool-icons.ts'), emitTs],
  [join(root, 'king-puzzle', 'src', 'ui', 'shared', 'tool-icons.tsx'), emitTsx],
  [
    join(root, 'math-puzzle', 'number_puzzle', 'lib', 'widgets', 'tool_icons.dart'),
    emitDart,
  ],
];
```

- [ ] **Step 2: 配って確認する**

Run: `node C:\claude\shared-ui\sync.mjs`
Expected: `→ C:\claude\king-puzzle\src\ui\shared\tokens.css` などが出力される。

Run: `node C:\claude\shared-ui\sync.mjs --check`
Expected: `すべて一致している。`

- [ ] **Step 3: コミット**

```bash
git add src/ui/shared
git commit -m "chore: sync shared-ui assets"
```

（`shared-ui/sync.mjs` 自体は king-puzzle の git 管理外なのでここではコミットしない。）

---

### Task 2: engine の型と定数

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\types.ts`
- Create: `C:\claude\king-puzzle\src\engine\costs.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\costs.test.ts`

**Interfaces:**
- Produces:
  - 型: `Owner`, `NodeType`, `FacilityType`, `BoardNode`, `BoardEdge`, `Board`, `Piece`, `TrackingRule`,
    `AttackTarget`, `AttackType`, `AttackDef`, `AttackState`, `GameStatus`, `GameState`, `PlayerAction`,
    `InitialPieceSetup`
  - 定数/関数: `FACILITY_MAX_LEVEL`, `COIN_MAX`, `PIECE_GENERATION_COST`,
    `upgradeCost(type: FacilityType, currentLevel: number): number | undefined`,
    `facilityMaxLevel(type: FacilityType): number`, `mineIncome(level: number): number`

- [ ] **Step 1: types.ts を書く**

```ts
export type Owner = 'player' | 'enemy';

export type NodeType = 'road' | 'hut' | 'wall' | 'mine' | 'training';

export type FacilityType = 'mine' | 'training';

export interface BoardNode {
  id: string;
  type: NodeType;
  /** 施設（mine/training）または壁のレベル。road/hut では未使用（0）。 */
  level: number;
  /** type === 'hut' のときだけ意味を持つ。 */
  hutOwner?: Owner;
}

export interface BoardEdge {
  a: string;
  b: string;
}

export interface Board {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface Piece {
  id: string;
  owner: Owner;
  isKing: boolean;
  level: number;
  speed: number;
  snared: number;
  nodeId: string;
}

export type TrackingRule = 'nearest-to-enemy' | 'highest-level' | 'king';

export type AttackTarget = { kind: 'node'; nodeId: string } | { kind: 'tracking'; rule: TrackingRule };

export type AttackType = 'arrow' | 'cannon' | 'snare' | 'blockade';

export interface AttackDef {
  id: string;
  type: AttackType;
  target: AttackTarget;
  period: number;
  initial?: number;
  duration?: number;
}

export interface AttackState {
  remaining: number;
}

export type GameStatus = 'playing' | 'won' | 'lost-king' | 'lost-timeout';

export interface GameState {
  round: number;
  board: Board;
  pieces: Piece[];
  coins: number;
  blockades: Record<string, number>;
  attacks: AttackDef[];
  attackStates: AttackState[];
  status: GameStatus;
  turnLimit: number;
  nextPieceId: number;
}

export type PlayerAction =
  | { kind: 'move'; pieceId: string; toNodeId: string }
  | { kind: 'footstep'; pieceId: string }
  | { kind: 'generate'; hutNodeId: string }
  | { kind: 'forced-skip' };

export interface InitialPieceSetup {
  owner: Owner;
  isKing: boolean;
  level: number;
  nodeId: string;
}
```

- [ ] **Step 2: costs.test.ts を書く（先にテスト）**

```ts
import { describe, expect, it } from 'vitest';

import { facilityMaxLevel, mineIncome, upgradeCost } from '@/engine/costs';

describe('costs', () => {
  it('mine の Lv2 へのアップグレード費用は 4', () => {
    expect(upgradeCost('mine', 1)).toBe(4);
  });

  it('training の Lv5 へのアップグレード費用は 10', () => {
    expect(upgradeCost('training', 4)).toBe(10);
  });

  it('最大レベルを超える費用は undefined', () => {
    expect(upgradeCost('mine', 5)).toBeUndefined();
  });

  it('施設の最大レベルは 5', () => {
    expect(facilityMaxLevel('mine')).toBe(5);
    expect(facilityMaxLevel('training')).toBe(5);
  });

  it('採掘場の収入は 2 × レベル', () => {
    expect(mineIncome(3)).toBe(6);
  });
});
```

- [ ] **Step 3: テストが失敗することを確認**

Run: `npm run test -- costs`
Expected: `Cannot find module '@/engine/costs'` で FAIL。

- [ ] **Step 4: costs.ts を書く**

```ts
import type { FacilityType } from './types';

export const FACILITY_MAX_LEVEL = 5;
export const COIN_MAX = 30;
export const PIECE_GENERATION_COST = 2;

const UPGRADE_COST: Record<FacilityType, Record<number, number>> = {
  mine: { 2: 4, 3: 5, 4: 7, 5: 9 },
  training: { 2: 5, 3: 6, 4: 8, 5: 10 },
};

/** currentLevel から +1 する費用。上限に達していれば undefined。 */
export function upgradeCost(type: FacilityType, currentLevel: number): number | undefined {
  return UPGRADE_COST[type][currentLevel + 1];
}

export function facilityMaxLevel(_type: FacilityType): number {
  return FACILITY_MAX_LEVEL;
}

export function mineIncome(level: number): number {
  return 2 * level;
}
```

- [ ] **Step 5: テストを通す**

Run: `npm run test -- costs`
Expected: 5件 PASS。

- [ ] **Step 6: コミット**

```bash
git add src/engine/types.ts src/engine/costs.ts __tests__/engine/costs.test.ts
git commit -m "feat(engine): add core types and facility costs"
```

---

### Task 3: 盤面グラフのヘルパー

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\board.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\board.test.ts`

**Interfaces:**
- Consumes: `Board`, `BoardNode` (Task 2)
- Produces: `getNode(board, nodeId): BoardNode`（無ければ throw）、`neighbors(board, nodeId): string[]`,
  `isImpassable(node, blockedNodeIds: ReadonlySet<string>): boolean`,
  `shortestDistance(board, fromId, toId, blockedNodeIds): number | null`

- [ ] **Step 1: board.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { getNode, isImpassable, neighbors, shortestDistance } from '@/engine/board';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'wall', level: 2 },
    { id: 'd', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
    { a: 'c', b: 'd' },
    { a: 'b', b: 'd' },
  ],
};

describe('board', () => {
  it('getNode は存在するノードを返す', () => {
    expect(getNode(board, 'a').type).toBe('road');
  });

  it('getNode は存在しないノードで例外を投げる', () => {
    expect(() => getNode(board, 'zzz')).toThrow();
  });

  it('neighbors は両方向のエッジを見る', () => {
    expect(neighbors(board, 'b').sort()).toEqual(['a', 'c', 'd']);
  });

  it('未破壊の壁は通れないノードとして扱う', () => {
    expect(isImpassable(getNode(board, 'c'), new Set())).toBe(true);
    expect(isImpassable(getNode(board, 'a'), new Set())).toBe(false);
  });

  it('shortestDistance は壁を迂回する', () => {
    // a-b-c-d は壁で塞がるが、a-b-d は通れる
    expect(shortestDistance(board, 'a', 'd', new Set())).toBe(2);
  });

  it('shortestDistance は封鎖ノードも迂回する', () => {
    expect(shortestDistance(board, 'a', 'd', new Set(['b']))).toBeNull();
  });

  it('到達できないときは null', () => {
    const isolated: Board = {
      nodes: [
        { id: 'x', type: 'road', level: 0 },
        { id: 'y', type: 'road', level: 0 },
      ],
      edges: [],
    };
    expect(shortestDistance(isolated, 'x', 'y', new Set())).toBeNull();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- board`
Expected: FAIL（モジュールが無い）。

- [ ] **Step 3: board.ts を書く**

```ts
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
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- board`
Expected: 7件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/board.ts __tests__/engine/board.test.ts
git commit -m "feat(engine): add board graph helpers"
```

---

### Task 4: 初期状態の生成とシリアライズ

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\state.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\state.test.ts`

**Interfaces:**
- Consumes: `Board`, `AttackDef`, `InitialPieceSetup`, `GameState` (Task 2)
- Produces:
  - `interface CreateStateInput { board: Board; initialPieces: InitialPieceSetup[]; initialCoins: number; attacks: AttackDef[]; turnLimit: number }`
  - `createInitialState(input: CreateStateInput): GameState`
  - `serializeState(state: GameState): string`（ソルバーの visited セットで使う。round・turnLimit は含めない）

- [ ] **Step 1: state.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { createInitialState, serializeState } from '@/engine/state';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'n1', type: 'road', level: 0 },
    { id: 'n2', type: 'road', level: 0 },
  ],
  edges: [{ a: 'n1', b: 'n2' }],
};

describe('createInitialState', () => {
  it('king を含む駒を配置し、round=1・status=playing で始まる', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'n2' },
      ],
      initialCoins: 3,
      attacks: [],
      turnLimit: 10,
    });

    expect(state.round).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.coins).toBe(3);
    expect(state.pieces).toHaveLength(2);
    expect(state.pieces.find((p) => p.owner === 'player')?.level).toBe(2);
  });

  it('attackStates の初期カウントは initial（省略時は period）', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [
        { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'n1' }, period: 4 },
        { id: 'a2', type: 'cannon', target: { kind: 'node', nodeId: 'n2' }, period: 4, initial: 1 },
      ],
      turnLimit: 10,
    });

    expect(state.attackStates).toEqual([{ remaining: 4 }, { remaining: 1 }]);
  });

  it('盤面を書き換えても入力の board は変わらない（防御的コピー）', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    state.board.nodes[0].level = 99;
    expect(board.nodes[0].level).toBe(0);
  });
});

describe('serializeState', () => {
  it('駒の並び順が違っても同じ内容なら同じキーになる', () => {
    const s1 = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'n2' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const s2 = { ...s1, pieces: [...s1.pieces].reverse() };
    expect(serializeState(s1)).toBe(serializeState(s2));
  });

  it('コインが違えば別のキーになる', () => {
    const base = { board, initialPieces: [], attacks: [], turnLimit: 10 };
    const s1 = createInitialState({ ...base, initialCoins: 0 });
    const s2 = createInitialState({ ...base, initialCoins: 1 });
    expect(serializeState(s1)).not.toBe(serializeState(s2));
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- state`
Expected: FAIL。

- [ ] **Step 3: state.ts を書く**

```ts
import type { AttackDef, Board, GameState, InitialPieceSetup } from './types';

export interface CreateStateInput {
  board: Board;
  initialPieces: InitialPieceSetup[];
  initialCoins: number;
  attacks: AttackDef[];
  turnLimit: number;
}

export function createInitialState(input: CreateStateInput): GameState {
  const board: Board = {
    nodes: input.board.nodes.map((n) => ({ ...n })),
    edges: input.board.edges.map((e) => ({ ...e })),
  };
  const pieces = input.initialPieces.map((p, i) => ({
    id: `${p.owner}-${p.isKing ? 'king' : i}`,
    owner: p.owner,
    isKing: p.isKing,
    level: p.level,
    speed: 1,
    snared: 0,
    nodeId: p.nodeId,
  }));
  return {
    round: 1,
    board,
    pieces,
    coins: input.initialCoins,
    blockades: {},
    attacks: input.attacks,
    attackStates: input.attacks.map((a) => ({ remaining: a.initial ?? a.period })),
    status: 'playing',
    turnLimit: input.turnLimit,
    nextPieceId: 0,
  };
}

export function serializeState(state: GameState): string {
  const pieces = [...state.pieces]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => `${p.id}:${p.owner}:${p.isKing ? 1 : 0}:${p.level}:${p.speed}:${p.snared}:${p.nodeId}`)
    .join(',');
  const nodes = [...state.board.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((n) => `${n.id}:${n.type}:${n.level}`)
    .join(',');
  const blockades = Object.keys(state.blockades)
    .sort()
    .map((k) => `${k}:${state.blockades[k]}`)
    .join(',');
  const attacks = state.attackStates.map((a) => a.remaining).join(',');
  return `${pieces}|${nodes}|${blockades}|${attacks}|${state.coins}`;
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- state`
Expected: 5件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/state.ts __tests__/engine/state.test.ts
git commit -m "feat(engine): add initial state factory and serializer"
```

---

### Task 5: 移動の合法性（§5）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\movement.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\movement.test.ts`

**Interfaces:**
- Consumes: `getNode`, `neighbors` (Task 3), `GameState`, `Piece` (Task 2)
- Produces: `canMove(state: GameState, piece: Piece, toNodeId: string): boolean`

- [ ] **Step 1: movement.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { createInitialState } from '@/engine/state';
import { canMove } from '@/engine/movement';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'wall', level: 3 },
    { id: 'd', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
    { a: 'b', b: 'd' },
  ],
};

function setup() {
  return createInitialState({
    board,
    initialPieces: [
      { owner: 'player', isKing: true, level: 2, nodeId: 'a' },
      { owner: 'player', isKing: false, level: 5, nodeId: 'b' },
      { owner: 'enemy', isKing: true, level: 2, nodeId: 'd' },
    ],
    initialCoins: 0,
    attacks: [],
    turnLimit: 10,
  });
}

describe('canMove', () => {
  it('隣接していないノードへは移動できない', () => {
    const state = setup();
    const king = state.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(state, king, 'd')).toBe(false);
  });

  it('自分の駒が居るノードへは移動できない（条件1）', () => {
    const state = setup();
    const king = state.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(state, king, 'b')).toBe(false);
  });

  it('レベル不足の壁へは移動できない（条件2）', () => {
    const state = setup();
    const weak = state.pieces.find((p) => p.owner === 'player' && !p.isKing)!;
    // weak は Lv5 で壁 Lv3 を上回るので壊せる。レベル不足のケースを別途作る。
    const weakState = { ...state, pieces: state.pieces.map((p) => (p.id === weak.id ? { ...p, level: 1 } : p)) };
    const modifiedWeak = weakState.pieces.find((p) => p.id === weak.id)!;
    expect(canMove(weakState, modifiedWeak, 'c')).toBe(false);
  });

  it('king は壁を破れない（条件3）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b' };
    expect(canMove(state, king, 'c')).toBe(false);
  });

  it('king は同レベル以上の敵駒に突っ込めない（条件4）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b' };
    expect(canMove(state, king, 'd')).toBe(false); // 敵king Lv2、自king Lv2
  });

  it('king はレベルが上回る敵駒には突っ込める', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, nodeId: 'b', level: 3 };
    expect(canMove(state, king, 'd')).toBe(true);
  });

  it('足止め中の駒は移動できない（条件5）', () => {
    const state = setup();
    const king = { ...state.pieces.find((p) => p.owner === 'player' && p.isKing)!, snared: 1 };
    expect(canMove(state, king, 'b')).toBe(false);
  });

  it('封鎖されたノードには入れない（条件6）', () => {
    const state = { ...setup() };
    const blocked = { ...state, blockades: { b: 2 } };
    const king = blocked.pieces.find((p) => p.owner === 'player' && p.isKing)!;
    expect(canMove(blocked, king, 'b')).toBe(false);
  });

  it('king 以外は同レベル以上の敵駒にも突っ込める（削る手）', () => {
    const state = setup();
    const weak = { ...state.pieces.find((p) => p.owner === 'player' && !p.isKing)!, nodeId: 'b', level: 1 };
    // 隣に敵は居ないので b -> d は隣接していない。経路を用意し直す。
    const boardWithDirect: Board = { ...board, edges: [...board.edges, { a: 'b', b: 'd' }] };
    const s2 = { ...state, board: boardWithDirect };
    expect(canMove(s2, weak, 'd')).toBe(true); // 敵king Lv2 >= 自駒Lv1 だが king ではないので許可
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- movement`
Expected: FAIL。

- [ ] **Step 3: movement.ts を書く**

```ts
import { getNode, neighbors } from './board';
import type { GameState, Piece } from './types';

export function canMove(state: GameState, piece: Piece, toNodeId: string): boolean {
  if (piece.snared > 0) return false;
  if (!neighbors(state.board, piece.nodeId).includes(toNodeId)) return false;

  if ((state.blockades[toNodeId] ?? 0) > 0) return false;

  const toNode = getNode(state.board, toNodeId);
  const occupant = state.pieces.find((p) => p.nodeId === toNodeId);

  if (occupant) {
    if (occupant.owner === piece.owner) return false;
    if (piece.isKing && occupant.level >= piece.level) return false;
    return true;
  }

  if (toNode.type === 'wall') {
    if (piece.isKing) return false;
    if (piece.level < toNode.level) return false;
  }

  return true;
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- movement`
Expected: 9件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/movement.ts __tests__/engine/movement.test.ts
git commit -m "feat(engine): implement movement legality (spec section 5)"
```

---

### Task 6: 戦闘解決（§5）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\combat.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\combat.test.ts`

**Interfaces:**
- Produces:
  - `type CombatResult = { winner: 'attacker'; survivorLevel: number } | { winner: 'defender'; survivorLevel: number } | { winner: 'mutual' }`
  - `resolveCombat(attackerLevel: number, defenderLevel: number): CombatResult`

- [ ] **Step 1: combat.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { resolveCombat } from '@/engine/combat';

describe('resolveCombat', () => {
  it('攻撃側が高ければ勝ち、レベル差だけ残る', () => {
    expect(resolveCombat(3, 2)).toEqual({ winner: 'attacker', survivorLevel: 1 });
  });

  it('防御側が高ければ防御側が勝ち、レベル差だけ残る', () => {
    expect(resolveCombat(2, 5)).toEqual({ winner: 'defender', survivorLevel: 3 });
  });

  it('同レベルなら相打ち', () => {
    expect(resolveCombat(4, 4)).toEqual({ winner: 'mutual' });
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- combat`
Expected: FAIL。

- [ ] **Step 3: combat.ts を書く**

```ts
export type CombatResult =
  | { winner: 'attacker'; survivorLevel: number }
  | { winner: 'defender'; survivorLevel: number }
  | { winner: 'mutual' };

/** レベルの高いほうが勝ち、敗者は消える。勝者は敗者のレベルぶんレベルが下がる（§5）。 */
export function resolveCombat(attackerLevel: number, defenderLevel: number): CombatResult {
  if (attackerLevel === defenderLevel) return { winner: 'mutual' };
  if (attackerLevel > defenderLevel) {
    return { winner: 'attacker', survivorLevel: attackerLevel - defenderLevel };
  }
  return { winner: 'defender', survivorLevel: defenderLevel - attackerLevel };
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- combat`
Expected: 3件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/combat.ts __tests__/engine/combat.test.ts
git commit -m "feat(engine): implement combat resolution (spec section 5)"
```

---

### Task 7: 施設のターン終了時効果（§6・§7 step2/5）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\facilities.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\facilities.test.ts`

**Interfaces:**
- Consumes: `getNode` (Task 3), `mineIncome` (Task 2), `GameState`, `Owner` (Task 2)
- Produces: `applyEndOfTurnFacilityEffects(state: GameState, owner: Owner): GameState`

- [ ] **Step 1: facilities.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { applyEndOfTurnFacilityEffects } from '@/engine/facilities';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'train', type: 'training', level: 3 },
    { id: 'mine', type: 'mine', level: 2 },
    { id: 'road', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'train', b: 'mine' },
    { a: 'mine', b: 'road' },
  ],
};

describe('applyEndOfTurnFacilityEffects', () => {
  it('訓練場は駒のレベルを施設レベルまで+1する', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.pieces[0].level).toBe(2);
  });

  it('駒のレベルが施設レベルに達したら止まる', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.pieces[0].level).toBe(3);
  });

  it('採掘場は 2×レベル のコインを得る', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.coins).toBe(9);
  });

  it('コインは上限30を超えない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 29,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'player');
    expect(next.coins).toBe(30);
  });

  it('足止めされた駒は効果を受けない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'train' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 1 })) };
    const next = applyEndOfTurnFacilityEffects(snared, 'player');
    expect(next.pieces[0].level).toBe(1);
  });

  it('敵駒が採掘場に居てもコインは誰にも入らない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'enemy', isKing: true, level: 1, nodeId: 'mine' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'enemy');
    expect(next.coins).toBe(5);
  });

  it('owner が違う駒には効果を適用しない', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'train' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'road' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyEndOfTurnFacilityEffects(state, 'enemy');
    expect(next.pieces.find((p) => p.owner === 'player')?.level).toBe(1);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- facilities`
Expected: FAIL。

- [ ] **Step 3: facilities.ts を書く**

```ts
import { getNode } from './board';
import { COIN_MAX, mineIncome } from './costs';
import type { GameState, Owner } from './types';

export function applyEndOfTurnFacilityEffects(state: GameState, owner: Owner): GameState {
  let coins = state.coins;
  const pieces = state.pieces.map((piece) => {
    if (piece.owner !== owner || piece.snared > 0) return piece;
    const node = getNode(state.board, piece.nodeId);
    if (node.type === 'training' && piece.level < node.level) {
      return { ...piece, level: piece.level + 1 };
    }
    if (node.type === 'mine' && owner === 'player') {
      coins = Math.min(coins + mineIncome(node.level), COIN_MAX);
    }
    return piece;
  });
  return { ...state, pieces, coins };
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- facilities`
Expected: 7件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/facilities.ts __tests__/engine/facilities.test.ts
git commit -m "feat(engine): implement end-of-turn facility effects (spec section 6/7)"
```

---

### Task 8: プレイヤーの行動（移動・足踏み・生成）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\actions.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\actions.test.ts`

**Interfaces:**
- Consumes: `getNode` (Task 3), `resolveCombat` (Task 6), `canMove` (Task 5), `upgradeCost`/`facilityMaxLevel`/`PIECE_GENERATION_COST` (Task 2)
- Produces:
  - `applyMove(state: GameState, pieceId: string, toNodeId: string): GameState`
  - `applyFootstep(state: GameState, pieceId: string): GameState`
  - `applyGenerate(state: GameState, hutNodeId: string): GameState`
  - 不正な呼び出し（合法手でない move/generate）は `Error` を投げる。footstep の「効果が無い」は仕様上の正常系なので投げない。

- [ ] **Step 1: actions.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { applyFootstep, applyGenerate, applyMove } from '@/engine/actions';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const lineBoard: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
  ],
};

describe('applyMove', () => {
  it('移動先に何もなければ単に移動する', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyMove(state, state.pieces[0].id, 'b');
    expect(next.pieces[0].nodeId).toBe('b');
  });

  it('敵kingに勝つと status が won になり、以降の駒は変化しない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.status).toBe('won');
    expect(next.pieces.find((p) => p.owner === 'player')?.level).toBe(2);
    expect(next.pieces.find((p) => p.owner === 'enemy')).toBeUndefined();
  });

  it('相打ちで敵kingが消えれば勝ち、自分の駒も消える', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: false, level: 2, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 2, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.status).toBe('won');
    expect(next.pieces).toHaveLength(0);
  });

  it('負ける戦闘は自分の駒が消え、敵はレベルが下がって留まる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: false, level: 2, nodeId: 'a' },
        { owner: 'enemy', isKing: false, level: 5, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = applyMove(state, player.id, 'b');
    expect(next.pieces).toHaveLength(1);
    expect(next.pieces[0].owner).toBe('enemy');
    expect(next.pieces[0].level).toBe(3);
    expect(next.pieces[0].nodeId).toBe('b');
  });

  it('壁を壊すと駒は消え、ノードは道になる', () => {
    const wallBoard: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'w', type: 'wall', level: 2 },
      ],
      edges: [{ a: 'a', b: 'w' }],
    };
    const state = createInitialState({
      board: wallBoard,
      initialPieces: [{ owner: 'player', isKing: false, level: 3, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyMove(state, state.pieces[0].id, 'w');
    expect(next.pieces).toHaveLength(0);
    expect(next.board.nodes.find((n) => n.id === 'w')?.type).toBe('road');
  });

  it('合法でない移動は例外を投げる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyMove(state, state.pieces[0].id, 'c')).toThrow();
  });
});

describe('applyFootstep', () => {
  const trainingBoard: Board = {
    nodes: [{ id: 't', type: 'training', level: 2 }],
    edges: [],
  };

  it('コインが足りていれば施設のレベルが上がる', () => {
    const state = createInitialState({
      board: trainingBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.board.nodes[0].level).toBe(3);
    expect(next.coins).toBe(4); // Lv2->Lv3 は費用6
  });

  it('コインが足りなければ何も起きない', () => {
    const state = createInitialState({
      board: trainingBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.board.nodes[0].level).toBe(2);
    expect(next.coins).toBe(0);
  });

  it('道の上では何も起きない', () => {
    const roadBoard: Board = { nodes: [{ id: 'r', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board: roadBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'r' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next).toEqual(state);
  });

  it('小屋の上では何も起きない', () => {
    const hutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'player' }], edges: [] };
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'h' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.coins).toBe(10);
  });

  it('施設が最大レベルなら何も起きない', () => {
    const maxedBoard: Board = { nodes: [{ id: 't', type: 'training', level: 5 }], edges: [] };
    const state = createInitialState({
      board: maxedBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 't' }],
      initialCoins: 100,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyFootstep(state, state.pieces[0].id);
    expect(next.coins).toBe(100);
    expect(next.board.nodes[0].level).toBe(5);
  });
});

describe('applyGenerate', () => {
  const hutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'player' }], edges: [] };

  it('自分の空の小屋に Lv1 の駒を生む', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    const next = applyGenerate(state, 'h');
    expect(next.pieces).toHaveLength(1);
    expect(next.pieces[0]).toMatchObject({ owner: 'player', level: 1, nodeId: 'h' });
    expect(next.coins).toBe(3);
  });

  it('相手の小屋では例外を投げる', () => {
    const enemyHutBoard: Board = { nodes: [{ id: 'h', type: 'hut', level: 0, hutOwner: 'enemy' }], edges: [] };
    const state = createInitialState({
      board: enemyHutBoard,
      initialPieces: [],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });

  it('小屋が塞がっていれば例外を投げる', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'h' }],
      initialCoins: 5,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });

  it('コインが足りなければ例外を投げる', () => {
    const state = createInitialState({
      board: hutBoard,
      initialPieces: [],
      initialCoins: 1,
      attacks: [],
      turnLimit: 10,
    });
    expect(() => applyGenerate(state, 'h')).toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- actions`
Expected: FAIL。

- [ ] **Step 3: actions.ts を書く**

```ts
import { getNode } from './board';
import { resolveCombat } from './combat';
import { PIECE_GENERATION_COST, facilityMaxLevel, upgradeCost } from './costs';
import { canMove } from './movement';
import type { FacilityType, GameState, Piece } from './types';

function requirePiece(state: GameState, pieceId: string): Piece {
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece) throw new Error(`piece not found: ${pieceId}`);
  return piece;
}

/** 移動（隣接ノードへ）。敵駒が居れば戦闘、壁なら破壊、それ以外なら移動。 */
export function applyMove(state: GameState, pieceId: string, toNodeId: string): GameState {
  const piece = requirePiece(state, pieceId);
  if (!canMove(state, piece, toNodeId)) {
    throw new Error(`illegal move: ${pieceId} -> ${toNodeId}`);
  }

  const toNode = getNode(state.board, toNodeId);
  const occupant = state.pieces.find((p) => p.nodeId === toNodeId);

  if (occupant) {
    const result = resolveCombat(piece.level, occupant.level);
    const defeatedEnemyKing = occupant.isKing && occupant.owner === 'enemy';

    if (result.winner === 'mutual') {
      const pieces = state.pieces.filter((p) => p.id !== piece.id && p.id !== occupant.id);
      return { ...state, pieces, status: defeatedEnemyKing ? 'won' : state.status };
    }
    if (result.winner === 'attacker') {
      const pieces = state.pieces
        .filter((p) => p.id !== occupant.id)
        .map((p) => (p.id === piece.id ? { ...p, level: result.survivorLevel, nodeId: toNodeId } : p));
      return { ...state, pieces, status: defeatedEnemyKing ? 'won' : state.status };
    }
    // 防御側が勝つ：攻撃側の駒が消え、防御側はレベルが下がってその場に残る
    const pieces = state.pieces
      .filter((p) => p.id !== piece.id)
      .map((p) => (p.id === occupant.id ? { ...p, level: result.survivorLevel } : p));
    return { ...state, pieces };
  }

  if (toNode.type === 'wall') {
    // 壊れた壁は以後道と同じに扱う
    const board = {
      ...state.board,
      nodes: state.board.nodes.map((n) => (n.id === toNodeId ? { ...n, type: 'road' as const, level: 0 } : n)),
    };
    const pieces = state.pieces.filter((p) => p.id !== piece.id);
    return { ...state, board, pieces };
  }

  const pieces = state.pieces.map((p) => (p.id === piece.id ? { ...p, nodeId: toNodeId } : p));
  return { ...state, pieces };
}

/** 足踏み。施設のレベルを上げられる条件を満たせば上げる。満たさなければ何も起きない（§2④）。 */
export function applyFootstep(state: GameState, pieceId: string): GameState {
  const piece = requirePiece(state, pieceId);
  if (piece.snared > 0) throw new Error(`snared piece cannot act: ${pieceId}`);
  const node = getNode(state.board, piece.nodeId);
  if (node.type !== 'mine' && node.type !== 'training') return state;

  const type = node.type as FacilityType;
  if (node.level >= facilityMaxLevel(type)) return state;
  const cost = upgradeCost(type, node.level);
  if (cost === undefined || state.coins < cost) return state;

  const board = {
    ...state.board,
    nodes: state.board.nodes.map((n) => (n.id === node.id ? { ...n, level: n.level + 1 } : n)),
  };
  return { ...state, board, coins: state.coins - cost };
}

/** 生成。自分の空の小屋に Lv1 の駒を置く。 */
export function applyGenerate(state: GameState, hutNodeId: string): GameState {
  const node = getNode(state.board, hutNodeId);
  if (node.type !== 'hut' || node.hutOwner !== 'player') {
    throw new Error(`not a player hut: ${hutNodeId}`);
  }
  if (state.pieces.some((p) => p.nodeId === hutNodeId)) {
    throw new Error(`hut occupied: ${hutNodeId}`);
  }
  if (state.coins < PIECE_GENERATION_COST) {
    throw new Error('not enough coins to generate');
  }
  const newPiece: Piece = {
    id: `player-gen-${state.nextPieceId}`,
    owner: 'player',
    isKing: false,
    level: 1,
    speed: 1,
    snared: 0,
    nodeId: hutNodeId,
  };
  return {
    ...state,
    pieces: [...state.pieces, newPiece],
    coins: state.coins - PIECE_GENERATION_COST,
    nextPieceId: state.nextPieceId + 1,
  };
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- actions`
Expected: 全件 PASS（15件）。

- [ ] **Step 5: コミット**

```bash
git add src/engine/actions.ts __tests__/engine/actions.test.ts
git commit -m "feat(engine): implement move/footstep/generate actions"
```

---

### Task 9: 合法手の列挙と強制スキップ（§2④・§7）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\legalActions.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\legalActions.test.ts`

**Interfaces:**
- Consumes: `canMove` (Task 5), `neighbors` (Task 3), `PIECE_GENERATION_COST` (Task 2)
- Produces: `getLegalActions(state: GameState): PlayerAction[]`（空にならず、常に最低1つ。何も無ければ `[{kind:'forced-skip'}]`）

- [ ] **Step 1: legalActions.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import type { Board } from '@/engine/types';

const lineBoard: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'h', type: 'hut', level: 0, hutOwner: 'player' },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'h' },
  ],
};

describe('getLegalActions', () => {
  it('選べる駒があれば footstep と移動を含む', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions).toContainEqual({ kind: 'footstep', pieceId: state.pieces[0].id });
    expect(actions).toContainEqual({ kind: 'move', pieceId: state.pieces[0].id, toNodeId: 'b' });
  });

  it('コインがあれば自分の空の小屋への生成を含む', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 2,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions).toContainEqual({ kind: 'generate', hutNodeId: 'h' });
  });

  it('コインが足りなければ生成を含まない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 1,
      attacks: [],
      turnLimit: 10,
    });
    const actions = getLegalActions(state);
    expect(actions.some((a) => a.kind === 'generate')).toBe(false);
  });

  it('選べる駒が無く生成もできなければ強制スキップだけになる', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 1 })) };
    expect(getLegalActions(snared)).toEqual([{ kind: 'forced-skip' }]);
  });

  it('足止め中の駒は選択肢に出ない', () => {
    const state = createInitialState({
      board: lineBoard,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const kingId = state.pieces.find((p) => p.owner === 'player')!.id;
    const snared = { ...state, pieces: state.pieces.map((p) => (p.id === kingId ? { ...p, snared: 1 } : p)) };
    const actions = getLegalActions(snared);
    expect(actions.some((a) => 'pieceId' in a && a.pieceId === kingId)).toBe(false);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- legalActions`
Expected: FAIL。

- [ ] **Step 3: legalActions.ts を書く**

```ts
import { neighbors } from './board';
import { PIECE_GENERATION_COST } from './costs';
import { canMove } from './movement';
import type { GameState, PlayerAction } from './types';

export function getLegalActions(state: GameState): PlayerAction[] {
  const actions: PlayerAction[] = [];

  for (const piece of state.pieces) {
    if (piece.owner !== 'player' || piece.snared > 0) continue;
    actions.push({ kind: 'footstep', pieceId: piece.id });
    for (const toNodeId of neighbors(state.board, piece.nodeId)) {
      if (canMove(state, piece, toNodeId)) {
        actions.push({ kind: 'move', pieceId: piece.id, toNodeId });
      }
    }
  }

  for (const node of state.board.nodes) {
    if (node.type !== 'hut' || node.hutOwner !== 'player') continue;
    if (state.pieces.some((p) => p.nodeId === node.id)) continue;
    if (state.coins < PIECE_GENERATION_COST) continue;
    actions.push({ kind: 'generate', hutNodeId: node.id });
  }

  return actions.length > 0 ? actions : [{ kind: 'forced-skip' }];
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- legalActions`
Expected: 5件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/engine/legalActions.ts __tests__/engine/legalActions.test.ts
git commit -m "feat(engine): enumerate legal actions with forced-skip fallback"
```

---

### Task 10: 敵の攻撃（周期・追尾、§8）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\attacks.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\attacks.test.ts`

**Interfaces:**
- Consumes: `shortestDistance` (Task 3), `GameState`, `AttackDef`, `TrackingRule` (Task 2)
- Produces:
  - `resolveTrackingTarget(state: GameState, rule: TrackingRule): string | null`
  - `interface AttackPhaseResult { state: GameState; freshSnaredPieceIds: Set<string>; freshBlockadeNodeIds: Set<string> }`
  - `applyAttackPhase(state: GameState): AttackPhaseResult`
    （カウントを1減らし、0になった攻撃の対象を全部先に決めてから配列順に適用し、発火したものは period に戻す）

- [ ] **Step 1: attacks.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { applyAttackPhase, resolveTrackingTarget } from '@/engine/attacks';
import { createInitialState } from '@/engine/state';
import type { AttackDef, Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
  ],
};

describe('resolveTrackingTarget', () => {
  it('king ルールは自分のkingの現在地を返す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'king')).toBe('b');
  });

  it('highest-level ルールは同率ならノードID昇順', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'c' },
        { owner: 'player', isKing: false, level: 3, nodeId: 'a' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'highest-level')).toBe('a');
  });

  it('nearest-to-enemy ルールは敵kingに一番近い自駒を返す', () => {
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 1, nodeId: 'a' },
        { owner: 'player', isKing: false, level: 1, nodeId: 'b' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'c' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    expect(resolveTrackingTarget(state, 'nearest-to-enemy')).toBe('b');
  });
});

describe('applyAttackPhase', () => {
  const arrow: AttackDef = { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'b' }, period: 3 };

  it('カウントが0になった攻撃を発火し、period に戻す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces[0].level).toBe(2);
    expect(result.state.attackStates).toEqual([{ remaining: 3 }]);
  });

  it('弓は Lv1 の駒を消す', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(0);
  });

  it('大砲はレベルに関わらず消す', () => {
    const cannon: AttackDef = { id: 'c1', type: 'cannon', target: { kind: 'node', nodeId: 'b' }, period: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 9, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [cannon],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(0);
  });

  it('足止めは対象を snared にし、今ラウンドは減算対象から除く', () => {
    const snare: AttackDef = { id: 's1', type: 'snare', target: { kind: 'node', nodeId: 'b' }, period: 4, duration: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [snare],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces[0].snared).toBe(2);
    expect(result.freshSnaredPieceIds.has(result.state.pieces[0].id)).toBe(true);
  });

  it('封鎖は駒が居なくても効き、ノードIDを記録する', () => {
    const blockade: AttackDef = {
      id: 'bl1',
      type: 'blockade',
      target: { kind: 'node', nodeId: 'c' },
      period: 3,
      duration: 2,
    };
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [blockade],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.blockades.c).toBe(2);
    expect(result.freshBlockadeNodeIds.has('c')).toBe(true);
  });

  it('対象ノードに敵駒が居ても何も起きない', () => {
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'enemy', isKing: false, level: 1, nodeId: 'b' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const oneAway = { ...state, attackStates: [{ remaining: 1 }] };
    const result = applyAttackPhase(oneAway);
    expect(result.state.pieces).toHaveLength(1);
  });

  it('発火していない攻撃はカウントを1減らすだけ', () => {
    const state = createInitialState({
      board,
      initialPieces: [],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const result = applyAttackPhase(state); // remaining は period=3 で始まる
    expect(result.state.attackStates).toEqual([{ remaining: 2 }]);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- attacks`
Expected: FAIL。

- [ ] **Step 3: attacks.ts を書く**

```ts
import { shortestDistance } from './board';
import type { AttackDef, GameState, TrackingRule } from './types';

function wallNodeIds(state: GameState): Set<string> {
  return new Set(state.board.nodes.filter((n) => n.type === 'wall').map((n) => n.id));
}

export function resolveTrackingTarget(state: GameState, rule: TrackingRule): string | null {
  const playerPieces = state.pieces.filter((p) => p.owner === 'player');
  if (playerPieces.length === 0) return null;

  if (rule === 'king') {
    const king = playerPieces.find((p) => p.isKing);
    return king ? king.nodeId : null;
  }

  if (rule === 'highest-level') {
    const maxLevel = Math.max(...playerPieces.map((p) => p.level));
    const candidates = playerPieces
      .filter((p) => p.level === maxLevel)
      .map((p) => p.nodeId)
      .sort();
    return candidates[0];
  }

  // nearest-to-enemy
  const enemyKing = state.pieces.find((p) => p.owner === 'enemy' && p.isKing);
  if (!enemyKing) return null;
  const blocked = wallNodeIds(state);
  let best: { nodeId: string; dist: number } | null = null;
  for (const p of playerPieces) {
    const dist = shortestDistance(state.board, p.nodeId, enemyKing.nodeId, blocked);
    if (dist === null) continue;
    if (!best || dist < best.dist || (dist === best.dist && p.nodeId < best.nodeId)) {
      best = { nodeId: p.nodeId, dist };
    }
  }
  return best ? best.nodeId : null;
}

function resolveTarget(state: GameState, attack: AttackDef): string | null {
  return attack.target.kind === 'node' ? attack.target.nodeId : resolveTrackingTarget(state, attack.target.rule);
}

export interface AttackPhaseResult {
  state: GameState;
  freshSnaredPieceIds: Set<string>;
  freshBlockadeNodeIds: Set<string>;
}

/**
 * 相手のターン開始時に呼ぶ（§7 step3）。カウントを1減らし、
 * 0になった攻撃は「対象を先に全部決めてから、配列順に適用する」（§8）。
 */
export function applyAttackPhase(state: GameState): AttackPhaseResult {
  const decremented = state.attackStates.map((s) => ({ remaining: s.remaining - 1 }));

  const firing: { index: number; nodeId: string | null }[] = [];
  decremented.forEach((s, index) => {
    if (s.remaining <= 0) {
      firing.push({ index, nodeId: resolveTarget(state, state.attacks[index]) });
    }
  });

  let pieces = [...state.pieces];
  const blockades = { ...state.blockades };
  const freshSnaredPieceIds = new Set<string>();
  const freshBlockadeNodeIds = new Set<string>();

  for (const { index, nodeId } of firing) {
    if (nodeId === null) continue;
    const attack = state.attacks[index];

    if (attack.type === 'blockade') {
      blockades[nodeId] = attack.duration ?? 1;
      freshBlockadeNodeIds.add(nodeId);
      continue;
    }

    const target = pieces.find((p) => p.owner === 'player' && p.nodeId === nodeId);
    if (!target) continue;

    if (attack.type === 'arrow') {
      pieces =
        target.level <= 1
          ? pieces.filter((p) => p.id !== target.id)
          : pieces.map((p) => (p.id === target.id ? { ...p, level: p.level - 1 } : p));
    } else if (attack.type === 'cannon') {
      pieces = pieces.filter((p) => p.id !== target.id);
    } else if (attack.type === 'snare') {
      pieces = pieces.map((p) => (p.id === target.id ? { ...p, snared: attack.duration ?? 1 } : p));
      freshSnaredPieceIds.add(target.id);
    }
  }

  const attackStates = decremented.map((s, index) =>
    s.remaining <= 0 ? { remaining: state.attacks[index].period } : s
  );

  return { state: { ...state, pieces, blockades, attackStates }, freshSnaredPieceIds, freshBlockadeNodeIds };
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- attacks`
Expected: 全件 PASS（10件）。

- [ ] **Step 5: コミット**

```bash
git add src/engine/attacks.ts __tests__/engine/attacks.test.ts
git commit -m "feat(engine): implement periodic and tracking attacks (spec section 8)"
```

---

### Task 11: ターン進行の統合（playRound、§7・§19）

**Files:**
- Create: `C:\claude\king-puzzle\src\engine\turn.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\turn.test.ts`

**Interfaces:**
- Consumes: `applyMove`/`applyFootstep`/`applyGenerate` (Task 8), `applyEndOfTurnFacilityEffects` (Task 7),
  `applyAttackPhase` (Task 10), `GameState`, `PlayerAction` (Task 2)
- Produces: `playRound(state: GameState, action: PlayerAction): GameState`
  （§7 の8ステップを1回ぶん進める。勝利は自分のターンで即確定し以降を実行しない。優先順位は勝利>敗北>時間切れ）

- [ ] **Step 1: turn.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { playRound } from '@/engine/turn';
import { createInitialState } from '@/engine/state';
import type { AttackDef, Board } from '@/engine/types';

describe('playRound', () => {
  it('勝利は施設発動より先に確定し、以降のステップを実行しない', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'training', level: 5 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const state = createInitialState({
      board,
      initialPieces: [
        { owner: 'player', isKing: true, level: 3, nodeId: 'a' },
        { owner: 'enemy', isKing: true, level: 1, nodeId: 'b' },
      ],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces.find((p) => p.owner === 'player')!;
    const next = playRound(state, { kind: 'move', pieceId: player.id, toNodeId: 'b' });
    expect(next.status).toBe('won');
    // 訓練場の効果（施設発動）は実行されていないので、レベルは 3-1=2 のまま
    expect(next.pieces[0].level).toBe(2);
    expect(next.round).toBe(1); // 勝利時は round を進めない
  });

  it('足踏みで上げた施設レベルは同ターンの発動に乗る', () => {
    const board: Board = { nodes: [{ id: 't', type: 'training', level: 2 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 2, nodeId: 't' }],
      initialCoins: 10,
      attacks: [],
      turnLimit: 10,
    });
    const player = state.pieces[0];
    const next = playRound(state, { kind: 'footstep', pieceId: player.id });
    // Lv2->Lv3 の足踏み（費用6）の直後、施設Lv3に対して駒Lv2<3 なので +1 されて Lv3 になる
    expect(next.board.nodes[0].level).toBe(3);
    expect(next.pieces[0].level).toBe(3);
    expect(next.coins).toBe(4);
  });

  it('攻撃のカウントは相手のターンで減り、0になれば発火する', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const arrow: AttackDef = { id: 'a1', type: 'arrow', target: { kind: 'node', nodeId: 'a' }, period: 2 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 3, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    // 1手目: footstep（何も起きない）。攻撃カウントは 2->1
    const afterFirst = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(afterFirst.attackStates[0].remaining).toBe(1);
    expect(afterFirst.pieces[0].level).toBe(3);
    // 2手目: footstep。カウントが0になり発火、king Lv3->Lv2、period(2)に戻る
    const afterSecond = playRound(afterFirst, { kind: 'footstep', pieceId: afterFirst.pieces[0].id });
    expect(afterSecond.pieces[0].level).toBe(2);
    expect(afterSecond.attackStates[0].remaining).toBe(2);
  });

  it('自分のkingを失えば敗北', () => {
    const board: Board = {
      nodes: [
        { id: 'a', type: 'road', level: 0 },
        { id: 'b', type: 'road', level: 0 },
      ],
      edges: [{ a: 'a', b: 'b' }],
    };
    const arrow: AttackDef = { id: 'a1', type: 'cannon', target: { kind: 'node', nodeId: 'a' }, period: 1 };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [arrow],
      turnLimit: 10,
    });
    const next = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(next.status).toBe('lost-king');
  });

  it('ラウンドが turnLimit を超えたら時間切れ', () => {
    const board: Board = { nodes: [{ id: 'a', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 1,
    });
    const next = playRound(state, { kind: 'footstep', pieceId: state.pieces[0].id });
    expect(next.status).toBe('lost-timeout');
  });

  it('強制スキップは何も変えずにラウンドだけ進む', () => {
    const board: Board = { nodes: [{ id: 'a', type: 'road', level: 0 }], edges: [] };
    const state = createInitialState({
      board,
      initialPieces: [{ owner: 'player', isKing: true, level: 1, nodeId: 'a' }],
      initialCoins: 0,
      attacks: [],
      turnLimit: 10,
    });
    const snared = { ...state, pieces: state.pieces.map((p) => ({ ...p, snared: 2 })) };
    const next = playRound(snared, { kind: 'forced-skip' });
    expect(next.round).toBe(2);
    expect(next.pieces[0].snared).toBe(1);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test -- turn`
Expected: FAIL。

- [ ] **Step 3: turn.ts を書く**

```ts
import { applyFootstep, applyGenerate, applyMove } from './actions';
import { applyAttackPhase } from './attacks';
import { applyEndOfTurnFacilityEffects } from './facilities';
import type { GameState, PlayerAction } from './types';

function applyPlayerAction(state: GameState, action: PlayerAction): GameState {
  switch (action.kind) {
    case 'move':
      return applyMove(state, action.pieceId, action.toNodeId);
    case 'footstep':
      return applyFootstep(state, action.pieceId);
    case 'generate':
      return applyGenerate(state, action.hutNodeId);
    case 'forced-skip':
      return state;
  }
}

function checkDefeat(state: GameState): GameState {
  const kingAlive = state.pieces.some((p) => p.owner === 'player' && p.isKing);
  return kingAlive ? state : { ...state, status: 'lost-king' };
}

/**
 * 1ラウンド分を進める（§7）。勝利は自分のターンで即確定し、以降を実行しない。
 * 判定の優先順位は 勝利 > 敗北 > 時間切れ（§19）。
 */
export function playRound(state: GameState, action: PlayerAction): GameState {
  // 【自分のターン】
  let next = applyPlayerAction(state, action);
  if (next.status === 'won') return next;

  next = applyEndOfTurnFacilityEffects(next, 'player');

  // 【相手のターン】
  const attackResult = applyAttackPhase(next);
  next = attackResult.state;

  next = applyEndOfTurnFacilityEffects(next, 'enemy');

  const pieces = next.pieces.map((p) =>
    p.snared > 0 && !attackResult.freshSnaredPieceIds.has(p.id) ? { ...p, snared: p.snared - 1 } : p
  );
  const blockades: Record<string, number> = {};
  for (const [nodeId, remaining] of Object.entries(next.blockades)) {
    if (attackResult.freshBlockadeNodeIds.has(nodeId)) {
      blockades[nodeId] = remaining;
      continue;
    }
    const decremented = remaining - 1;
    if (decremented > 0) blockades[nodeId] = decremented;
  }
  next = { ...next, pieces, blockades };

  next = checkDefeat(next);

  const round = next.round + 1;
  const status = next.status === 'playing' && round > next.turnLimit ? 'lost-timeout' : next.status;
  return { ...next, round, status };
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- turn`
Expected: 全件 PASS（6件）。

- [ ] **Step 5: engine 全体のテストを流す**

Run: `npm run test`
Expected: 全ファイル PASS（Task 2〜11 の合計）。

- [ ] **Step 6: コミット**

```bash
git add src/engine/turn.ts __tests__/engine/turn.test.ts
git commit -m "feat(engine): implement playRound orchestrating the full turn (spec section 7)"
```

---

### Task 12: ステージ定義スキーマと章1〜3のレベルデータ

**Files:**
- Create: `C:\claude\king-puzzle\src\levels\types.ts`
- Create: `C:\claude\king-puzzle\src\levels\chapter1.ts`
- Create: `C:\claude\king-puzzle\src\levels\chapter2.ts`
- Create: `C:\claude\king-puzzle\src\levels\chapter3.ts`
- Test: `C:\claude\king-puzzle\__tests__\levels\schema.test.ts`

**Interfaces:**
- Consumes: `Board`, `InitialPieceSetup`, `AttackDef` (Task 2)
- Produces:
  - `interface LevelDef { id: string; chapter: number; order: number; title: string; board: Board; initialPieces: InitialPieceSetup[]; initialCoins: number; attacks: AttackDef[]; tStar: number; s: number }`
  - `turnLimitOf(level: LevelDef): number`
  - `ch1_1`, `ch2_1`, `ch3_1` の3レベル定数

- [ ] **Step 1: types.ts を書く**

```ts
import type { AttackDef, Board, InitialPieceSetup } from '@/engine/types';

export interface LevelDef {
  id: string;
  chapter: number;
  order: number;
  title: string;
  board: Board;
  initialPieces: InitialPieceSetup[];
  initialCoins: number;
  attacks: AttackDef[];
  /** 作問時にソルバーで求めた最少ラウンド数。推測で書かない。 */
  tStar: number;
  /** ターン制限の余裕（難易度）。 */
  s: number;
}

export function turnLimitOf(level: LevelDef): number {
  return level.tStar + level.s;
}
```

- [ ] **Step 2: 章1〜3のレベルを書く（tStar は仮値。Task 13 のソルバーで実測して更新する）**

`src/levels/chapter1.ts`:
```ts
import type { LevelDef } from './types';

export const ch1_1: LevelDef = {
  id: 'ch1-1',
  chapter: 1,
  order: 1,
  title: 'はじめての一手',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'road', level: 0 },
      { id: 'n3', type: 'road', level: 0 },
      { id: 'n4', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
      { a: 'n3', b: 'n4' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 2, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n4' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 3, // 仮値。Task 13 で実測して更新する
  s: 4,
};
```

`src/levels/chapter2.ts`:
```ts
import type { LevelDef } from './types';

export const ch2_1: LevelDef = {
  id: 'ch2-1',
  chapter: 2,
  order: 1,
  title: 'のって、まつ',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 1, nodeId: 'n3' },
  ],
  initialCoins: 0,
  attacks: [],
  tStar: 2, // 仮値。Task 13 で実測して更新する
  s: 4,
};
```

`src/levels/chapter3.ts`:
```ts
import type { LevelDef } from './types';

export const ch3_1: LevelDef = {
  id: 'ch3-1',
  chapter: 3,
  order: 1,
  title: 'ふみしめて、そだてる',
  board: {
    nodes: [
      { id: 'n1', type: 'road', level: 0 },
      { id: 'n2', type: 'training', level: 2 },
      { id: 'n3', type: 'road', level: 0 },
    ],
    edges: [
      { a: 'n1', b: 'n2' },
      { a: 'n2', b: 'n3' },
    ],
  },
  initialPieces: [
    { owner: 'player', isKing: true, level: 1, nodeId: 'n1' },
    { owner: 'enemy', isKing: true, level: 2, nodeId: 'n3' },
  ],
  initialCoins: 6,
  attacks: [],
  tStar: 3, // 仮値。Task 13 で実測して更新する
  s: 4,
};
```

- [ ] **Step 3: schema.test.ts を書く（監査の最小版。§17 の構造検査の一部を先取り）**

```ts
import { describe, expect, it } from 'vitest';

import { ch1_1 } from '@/levels/chapter1';
import { ch2_1 } from '@/levels/chapter2';
import { ch3_1 } from '@/levels/chapter3';
import type { LevelDef } from '@/levels/types';

const levels: LevelDef[] = [ch1_1, ch2_1, ch3_1];

describe('level schema', () => {
  it.each(levels)('$id: king が両陣営に1つずつ居る', (level) => {
    const kings = level.initialPieces.filter((p) => p.isKing);
    expect(kings.filter((p) => p.owner === 'player')).toHaveLength(1);
    expect(kings.filter((p) => p.owner === 'enemy')).toHaveLength(1);
  });

  it.each(levels)('$id: edges が nodes に閉じている', (level) => {
    const nodeIds = new Set(level.board.nodes.map((n) => n.id));
    for (const edge of level.board.edges) {
      expect(nodeIds.has(edge.a)).toBe(true);
      expect(nodeIds.has(edge.b)).toBe(true);
    }
  });

  it.each(levels)('$id: 初期駒の位置が重複していない', (level) => {
    const nodeIds = level.initialPieces.map((p) => p.nodeId);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it.each(levels)('$id: 攻撃の対象ノードが実在する（node指定のみ）', (level) => {
    const nodeIds = new Set(level.board.nodes.map((n) => n.id));
    for (const attack of level.attacks) {
      if (attack.target.kind === 'node') {
        expect(nodeIds.has(attack.target.nodeId)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 4: テストを実行**

Run: `npm run test -- schema`
Expected: 全件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/levels/types.ts src/levels/chapter1.ts src/levels/chapter2.ts src/levels/chapter3.ts __tests__/levels/schema.test.ts
git commit -m "feat(levels): add level schema and chapters 1-3 (tStar provisional)"
```

---

### Task 13: BFSソルバーで `T*` を実測する

**Files:**
- Create: `C:\claude\king-puzzle\scripts\solveLevel.ts`
- Modify: `C:\claude\king-puzzle\src\levels\chapter1.ts`（tStar を実測値に更新）
- Modify: `C:\claude\king-puzzle\src\levels\chapter2.ts`（同上）
- Modify: `C:\claude\king-puzzle\src\levels\chapter3.ts`（同上）
- Test: `C:\claude\king-puzzle\__tests__\solveLevel.test.ts`

**Interfaces:**
- Consumes: `createInitialState`, `serializeState` (Task 4), `getLegalActions` (Task 9), `playRound` (Task 11),
  `LevelDef` (Task 12)
- Produces: `solve(level: LevelDef, maxDepth?: number): { tStar: number; path: PlayerAction[] } | null`
  （CLIとしても `tsx scripts/solveLevel.ts <levelId>` で実行できる）

- [ ] **Step 1: scripts/solveLevel.ts を書く**

```ts
import { getLegalActions } from '../src/engine/legalActions';
import { createInitialState, serializeState } from '../src/engine/state';
import { playRound } from '../src/engine/turn';
import type { GameState, PlayerAction } from '../src/engine/types';
import type { LevelDef } from '../src/levels/types';

export interface SolveResult {
  tStar: number;
  path: PlayerAction[];
}

/**
 * 幅優先で最少ラウンド数（T*）を求める。章1〜3は状態空間が小さいのでBFSで十分
 * （IDA*＋置換表は状態空間が増える章4以降でフェーズ4にて導入する）。
 * turnLimit はソルバー用に十分大きい値（maxDepth）を使う。レベル定義自身の
 * tStar+s をここで使うと、実測前の仮の tStar が小さすぎた場合に本当の解を
 * 時間切れとして刈ってしまう（鶏と卵の問題）ため。
 */
export function solve(level: LevelDef, maxDepth = 40): SolveResult | null {
  const init = createInitialState({
    board: level.board,
    initialPieces: level.initialPieces,
    initialCoins: level.initialCoins,
    attacks: level.attacks,
    turnLimit: maxDepth,
  });

  let frontier: { state: GameState; path: PlayerAction[] }[] = [{ state: init, path: [] }];
  const visited = new Set<string>([serializeState(init)]);

  for (let depth = 0; depth < maxDepth; depth++) {
    const next: typeof frontier = [];
    for (const { state, path } of frontier) {
      for (const action of getLegalActions(state)) {
        const result = playRound(state, action);
        if (result.status === 'won') {
          return { tStar: depth + 1, path: [...path, action] };
        }
        if (result.status !== 'playing') continue;
        const key = serializeState(result);
        if (visited.has(key)) continue;
        visited.add(key);
        next.push({ state: result, path: [...path, action] });
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}

async function main() {
  const [, , levelId] = process.argv;
  if (!levelId) {
    console.error('usage: npm run solve -- <levelId>');
    process.exit(1);
  }
  const { getLevel } = await import('../src/levels/index');
  const level = getLevel(levelId);
  if (!level) {
    console.error(`level not found: ${levelId}`);
    process.exit(1);
  }
  const result = solve(level);
  if (!result) {
    console.error('解なし、または maxDepth を超えました');
    process.exit(1);
  }
  console.log(`T* = ${result.tStar}`);
  console.log(JSON.stringify(result.path, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
```

（この段階では `src/levels/index.ts` はまだ無い。Task 14 で作る。Step 2 のテストは `solve()` を直接呼ぶので依存しない。）

- [ ] **Step 2: solveLevel.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { ch1_1 } from '@/levels/chapter1';
import { ch2_1 } from '@/levels/chapter2';
import { ch3_1 } from '@/levels/chapter3';
import { solve } from '../scripts/solveLevel';

describe('solve', () => {
  it('章1: king の直進3手で勝てる', () => {
    const result = solve(ch1_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBeLessThanOrEqual(3);
  });

  it('章2: 訓練場で1段だけ育てれば勝てる', () => {
    const result = solve(ch2_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBeLessThanOrEqual(2);
  });

  it('章3: 足踏みで施設を上げてから育てれば勝てる', () => {
    const result = solve(ch3_1);
    expect(result).not.toBeNull();
    expect(result!.tStar).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 3: テストを実行して実測値を確認する**

Run: `npm run test -- solveLevel`
Expected: 3件 PASS（`toBeLessThanOrEqual` は仮の上限。実際の `tStar` は次のコマンドで確認する）。

- [ ] **Step 4: 各レベルの実際の `T*` と手順を出力する（`src/levels/index.ts` が無いと動かないため、Task 14 の後にも再実行できるよう一旦インラインで確認する）**

一時スクリプトで直接呼び出して確認する（使い捨て、確認後は削除してよい）:

Run:
```bash
npx tsx -e "
import { solve } from './scripts/solveLevel';
import { ch1_1 } from './src/levels/chapter1';
import { ch2_1 } from './src/levels/chapter2';
import { ch3_1 } from './src/levels/chapter3';
for (const level of [ch1_1, ch2_1, ch3_1]) {
  const r = solve(level);
  console.log(level.id, r ? r.tStar : 'unsolved');
}
"
```

Expected: 3行、各レベルIDと実測 `T*` が出力される。

- [ ] **Step 5: 実測値と Task 12 の仮値を突き合わせ、ズレていれば `tStar` を実測値に更新する**

Step 4 の出力が `ch1_1: 3` / `ch2_1: 2` / `ch3_1: 3` と一致すればファイルは変更不要。
異なる場合は各 `chapter*.ts` の `tStar` を実測値に書き換え、コメント `// 仮値。...` を
`// scripts/solveLevel.ts で実測（YYYY-MM-DD）` に変える。

- [ ] **Step 6: 更新後、再度テストを流して確認**

Run: `npm run test`
Expected: 全件 PASS。

- [ ] **Step 7: コミット**

```bash
git add scripts/solveLevel.ts __tests__/solveLevel.test.ts src/levels/chapter1.ts src/levels/chapter2.ts src/levels/chapter3.ts
git commit -m "feat(scripts): add BFS solver and measure T* for chapters 1-3"
```

---

### Task 14: レベル索引とスコア計算

**Files:**
- Create: `C:\claude\king-puzzle\src\levels\index.ts`
- Create: `C:\claude\king-puzzle\src\engine\scoring.ts`
- Test: `C:\claude\king-puzzle\__tests__\levels\index.test.ts`
- Test: `C:\claude\king-puzzle\__tests__\engine\scoring.test.ts`

**Interfaces:**
- Consumes: `LevelDef` (Task 12)
- Produces:
  - `LEVELS: LevelDef[]`, `getLevel(id): LevelDef | undefined`, `getNextLevel(id): LevelDef | undefined`,
    `chapters(): { chapter: number; levels: LevelDef[] }[]`
  - `computeStars(tStar: number, s: number, actionsTaken: number): 1 | 2 | 3`（§10 の★条件）

- [ ] **Step 1: scoring.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { computeStars } from '@/engine/scoring';

describe('computeStars', () => {
  it('T* ちょうどなら★3', () => {
    expect(computeStars(10, 4, 10)).toBe(3);
  });

  it('T*+floor(S/2) 以内なら★2', () => {
    expect(computeStars(10, 4, 12)).toBe(2); // floor(4/2)=2 -> 12
  });

  it('T*+S 以内なら★1', () => {
    expect(computeStars(10, 4, 14)).toBe(1);
  });

  it('最上位の条件を優先する', () => {
    expect(computeStars(10, 0, 10)).toBe(3);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm run test -- scoring`
Expected: FAIL。

- [ ] **Step 3: scoring.ts を書く**

```ts
/** ★の条件（§10）。条件を満たした中で最上位の★を返す。 */
export function computeStars(tStar: number, s: number, actionsTaken: number): 1 | 2 | 3 {
  if (actionsTaken <= tStar) return 3;
  if (actionsTaken <= tStar + Math.floor(s / 2)) return 2;
  return 1;
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- scoring`
Expected: 4件 PASS。

- [ ] **Step 5: index.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { LEVELS, chapters, getLevel, getNextLevel } from '@/levels/index';

describe('levels index', () => {
  it('3レベルすべて登録されている', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['ch1-1', 'ch2-1', 'ch3-1']);
  });

  it('getLevel はIDで引ける', () => {
    expect(getLevel('ch2-1')?.chapter).toBe(2);
  });

  it('getNextLevel は次のレベルを返し、最後は undefined', () => {
    expect(getNextLevel('ch1-1')?.id).toBe('ch2-1');
    expect(getNextLevel('ch3-1')).toBeUndefined();
  });

  it('chapters は章番号順、章内は order 順でグループ化する', () => {
    const groups = chapters();
    expect(groups.map((g) => g.chapter)).toEqual([1, 2, 3]);
    expect(groups[0].levels.map((l) => l.id)).toEqual(['ch1-1']);
  });
});
```

- [ ] **Step 6: index.ts を書く**

```ts
import { ch1_1 } from './chapter1';
import { ch2_1 } from './chapter2';
import { ch3_1 } from './chapter3';
import type { LevelDef } from './types';

export type { LevelDef } from './types';
export { turnLimitOf } from './types';

export const LEVELS: LevelDef[] = [ch1_1, ch2_1, ch3_1];

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getNextLevel(id: string): LevelDef | undefined {
  const index = LEVELS.findIndex((l) => l.id === id);
  if (index === -1 || index + 1 >= LEVELS.length) return undefined;
  return LEVELS[index + 1];
}

export function chapters(): { chapter: number; levels: LevelDef[] }[] {
  const map = new Map<number, LevelDef[]>();
  for (const level of LEVELS) {
    const list = map.get(level.chapter) ?? [];
    list.push(level);
    map.set(level.chapter, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chapter, levels]) => ({ chapter, levels: levels.sort((x, y) => x.order - y.order) }));
}
```

- [ ] **Step 7: テストを通す**

Run: `npm run test -- levels/index`
Expected: 4件 PASS。

- [ ] **Step 8: solveLevel.test.ts が Task 13 で置いた仮定と矛盾しないか、全テストを再実行**

Run: `npm run test`
Expected: 全件 PASS。

- [ ] **Step 9: コミット**

```bash
git add src/levels/index.ts src/engine/scoring.ts __tests__/levels/index.test.ts __tests__/engine/scoring.test.ts
git commit -m "feat(levels): add level index and star scoring"
```

---

### Task 15: 保存（進行状況・章の解放）

**Files:**
- Create: `C:\claude\king-puzzle\src\storage\progress.ts`
- Test: `C:\claude\king-puzzle\__tests__\storage\progress.test.ts`

**Interfaces:**
- Produces:
  - `interface LevelProgress { cleared: boolean; bestStars: 0 | 1 | 2 | 3; bestTurns?: number }`
  - `getProgress(levelId: string): LevelProgress`
  - `recordClear(levelId: string, stars: 1 | 2 | 3, turns: number): void`
  - `isChapterUnlocked(chapter: number, levelIdsInPreviousChapter: string[]): boolean`
    （前章の7割クリアで解放。章1は常に解放。前章が無ければ解放）
  - `clearAllProgress(): void`（Task 22 のホーム画面「テスト用」から呼ぶ）

- [ ] **Step 1: progress.test.ts を書く**

```ts
import { beforeEach, describe, expect, it } from 'vitest';

import { getProgress, isChapterUnlocked, recordClear } from '@/storage/progress';

beforeEach(() => {
  window.localStorage.clear();
});

describe('progress storage', () => {
  it('未クリアの初期値', () => {
    expect(getProgress('x')).toEqual({ cleared: false, bestStars: 0 });
  });

  it('クリアを記録し、ベストのみ保持する', () => {
    recordClear('x', 2, 12);
    recordClear('x', 3, 10); // より良い記録
    recordClear('x', 1, 20); // より悪い記録は上書きしない
    const p = getProgress('x');
    expect(p.cleared).toBe(true);
    expect(p.bestStars).toBe(3);
    expect(p.bestTurns).toBe(10);
  });

  it('章1は常に解放されている', () => {
    expect(isChapterUnlocked(1, [])).toBe(true);
  });

  it('前章がなければ解放されている', () => {
    expect(isChapterUnlocked(2, [])).toBe(true);
  });

  it('前章の7割未満クリアでは解放されない', () => {
    recordClear('a', 1, 5);
    expect(isChapterUnlocked(2, ['a', 'b', 'c'])).toBe(false); // 1/3
  });

  it('前章の7割以上クリアで解放される', () => {
    recordClear('a', 1, 5);
    recordClear('b', 1, 5);
    recordClear('c', 1, 5);
    expect(isChapterUnlocked(2, ['a', 'b', 'c'])).toBe(true); // 3/3
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm run test -- progress`
Expected: FAIL。

- [ ] **Step 3: progress.ts を書く**

```ts
export interface LevelProgress {
  cleared: boolean;
  bestStars: 0 | 1 | 2 | 3;
  bestTurns?: number;
}

const KEY = 'king-puzzle:progress:v1';

type ProgressMap = Record<string, LevelProgress>;

function readAll(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeAll(data: ProgressMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 保存できなくてもゲーム自体は続行できる
  }
}

export function getProgress(levelId: string): LevelProgress {
  return readAll()[levelId] ?? { cleared: false, bestStars: 0 };
}

export function recordClear(levelId: string, stars: 1 | 2 | 3, turns: number): void {
  const all = readAll();
  const current = all[levelId] ?? { cleared: false, bestStars: 0 as const };
  all[levelId] = {
    cleared: true,
    bestStars: Math.max(current.bestStars, stars) as 0 | 1 | 2 | 3,
    bestTurns: current.bestTurns !== undefined ? Math.min(current.bestTurns, turns) : turns,
  };
  writeAll(all);
}

export function isChapterUnlocked(chapter: number, levelIdsInPreviousChapter: string[]): boolean {
  if (chapter <= 1) return true;
  if (levelIdsInPreviousChapter.length === 0) return true;
  const all = readAll();
  const clearedCount = levelIdsInPreviousChapter.filter((id) => all[id]?.cleared).length;
  return clearedCount / levelIdsInPreviousChapter.length >= 0.7;
}

export function clearAllProgress(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 何もしない
  }
}
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- progress`
Expected: 6件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/storage/progress.ts __tests__/storage/progress.test.ts
git commit -m "feat(storage): add level progress and chapter unlock rules"
```

---

### Task 16: ルーター

**Files:**
- Create: `C:\claude\king-puzzle\src\core\router.ts`
- Test: `C:\claude\king-puzzle\__tests__\core\router.test.ts`

**Interfaces:**
- Produces:
  - `type Route = { name: 'home' } | { name: 'level'; levelId: string }`
  - `parseRoute(hash: string): Route`, `hashFor(route: Route): string`,
    `navigate(route: Route): void`, `goBack(): void`, `useRoute(): Route`

- [ ] **Step 1: router.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { hashFor, parseRoute } from '@/core/router';

describe('router', () => {
  it('空ハッシュは home', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
  });

  it('#/level/xxx は level ルート', () => {
    expect(parseRoute('#/level/ch2-1')).toEqual({ name: 'level', levelId: 'ch2-1' });
  });

  it('未知のパスは home にフォールバックする', () => {
    expect(parseRoute('#/unknown')).toEqual({ name: 'home' });
  });

  it('hashFor は parseRoute の逆変換になる', () => {
    const route = { name: 'level' as const, levelId: 'ch3-1' };
    expect(parseRoute(hashFor(route))).toEqual(route);
  });

  it('レベルIDのURLエンコードを扱う', () => {
    const route = { name: 'level' as const, levelId: 'ch 1' };
    expect(parseRoute(hashFor(route))).toEqual(route);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm run test -- router`
Expected: FAIL。

- [ ] **Step 3: router.ts を書く**

```ts
import { useSyncExternalStore } from 'react';

/**
 * ハッシュルーティング。GitHub Pages のサブパス配信では、通常のパスルーティングだと
 * 直リンクのたびに 404.html のフォールバックが必要になるため、ハッシュで済ませる。
 */
export type Route = { name: 'home' } | { name: 'level'; levelId: string };

export const parseRoute = (hash: string): Route => {
  const path = hash.replace(/^#/, '').split('?')[0];
  const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (seg[0] === 'level' && seg[1]) return { name: 'level', levelId: seg[1] };
  return { name: 'home' };
};

export const hashFor = (route: Route): string => {
  switch (route.name) {
    case 'level':
      return `#/level/${encodeURIComponent(route.levelId)}`;
    default:
      return '#/';
  }
};

export const navigate = (route: Route): void => {
  window.location.hash = hashFor(route);
};

export const goBack = (): void => {
  window.history.back();
};

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

export const useRoute = (): Route =>
  parseRoute(
    useSyncExternalStore(
      subscribe,
      () => window.location.hash,
      () => ''
    )
  );
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- router`
Expected: 5件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/core/router.ts __tests__/core/router.test.ts
git commit -m "feat(core): add hash router"
```

---

### Task 17: 盤面レイアウトの計算

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\board\layout.ts`
- Test: `C:\claude\king-puzzle\__tests__\ui\layout.test.ts`

**Interfaces:**
- Consumes: `neighbors` (Task 3), `Board` (Task 2)
- Produces: `interface NodePosition { x: number; y: number }`, `computeLayout(board: Board, rootId: string): Record<string, NodePosition>`

- [ ] **Step 1: layout.test.ts を書く**

```ts
import { describe, expect, it } from 'vitest';

import { computeLayout } from '@/ui/board/layout';
import type { Board } from '@/engine/types';

const board: Board = {
  nodes: [
    { id: 'a', type: 'road', level: 0 },
    { id: 'b', type: 'road', level: 0 },
    { id: 'c', type: 'road', level: 0 },
  ],
  edges: [
    { a: 'a', b: 'b' },
    { a: 'b', b: 'c' },
  ],
};

describe('computeLayout', () => {
  it('root からの距離が離れるほど x が大きくなる', () => {
    const positions = computeLayout(board, 'a');
    expect(positions.a.x).toBeLessThan(positions.b.x);
    expect(positions.b.x).toBeLessThan(positions.c.x);
  });

  it('すべてのノードに座標が付く', () => {
    const positions = computeLayout(board, 'a');
    expect(Object.keys(positions).sort()).toEqual(['a', 'b', 'c']);
  });

  it('同じ盤面・同じ root なら毎回同じ座標になる（決定的）', () => {
    expect(computeLayout(board, 'a')).toEqual(computeLayout(board, 'a'));
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm run test -- layout`
Expected: FAIL。

- [ ] **Step 3: layout.ts を書く**

```ts
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
```

- [ ] **Step 4: テストを通す**

Run: `npm run test -- layout`
Expected: 3件 PASS。

- [ ] **Step 5: コミット**

```bash
git add src/ui/board/layout.ts __tests__/ui/layout.test.ts
git commit -m "feat(ui): add deterministic board layout algorithm"
```

---

### Task 18: 盤面描画コンポーネント

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\board\Board.tsx`

**Interfaces:**
- Consumes: `computeLayout` (Task 17), `GameState`, `Piece` (Task 2)
- Produces:
```ts
interface BoardProps {
  state: GameState;
  rootId: string;
  selectedPieceId: string | null;
  legalDestinations: string[];
  onSelectPiece: (piece: Piece) => void;
  onSelectHut: (nodeId: string) => void;
  onSelectDestination: (nodeId: string) => void;
}
export function Board(props: BoardProps): JSX.Element
```
このタスクにはユニットテストを書かない（Task 24 でブラウザから直接見て確認する。DOM描画のスナップショットテストはこのフェーズでは価値が薄い）。

- [ ] **Step 1: Board.tsx を書く**

```tsx
import { computeLayout } from './layout';
import type { GameState, Piece } from '@/engine/types';

interface BoardProps {
  state: GameState;
  rootId: string;
  selectedPieceId: string | null;
  legalDestinations: string[];
  onSelectPiece: (piece: Piece) => void;
  onSelectHut: (nodeId: string) => void;
  onSelectDestination: (nodeId: string) => void;
}

const NODE_COLOR: Record<string, string> = {
  road: 'var(--surface-2)',
  hut: '#d9c07a',
  wall: '#8a5a5a',
  mine: '#7a9e7e',
  training: '#7a8fc2',
};

export function Board({
  state,
  rootId,
  selectedPieceId,
  legalDestinations,
  onSelectPiece,
  onSelectHut,
  onSelectDestination,
}: BoardProps) {
  const positions = computeLayout(state.board, rootId);
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const minX = Math.min(...xs) - 60;
  const maxX = Math.max(...xs) + 60;
  const minY = Math.min(...ys) - 60;
  const maxY = Math.max(...ys) + 60;
  const width = maxX - minX;
  const height = maxY - minY;

  const pieceAt = (nodeId: string): Piece | undefined => state.pieces.find((p) => p.nodeId === nodeId);

  return (
    <div className="kp-board" style={{ position: 'relative', width: '100%', aspectRatio: `${width} / ${height}` }}>
      <svg viewBox={`${minX} ${minY} ${width} ${height}`} className="kp-board-edges">
        {state.board.edges.map((edge) => {
          const a = positions[edge.a];
          const b = positions[edge.b];
          return <line key={`${edge.a}-${edge.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="kp-edge" />;
        })}
      </svg>
      {state.board.nodes.map((node) => {
        const pos = positions[node.id];
        const piece = pieceAt(node.id);
        const isDestination = legalDestinations.includes(node.id);
        const isHutTarget = node.type === 'hut' && node.hutOwner === 'player' && !piece;
        return (
          <div
            key={node.id}
            className={`kp-node kp-node-${node.type}${isDestination ? ' kp-node-legal' : ''}`}
            style={{
              position: 'absolute',
              left: `${((pos.x - minX) / width) * 100}%`,
              top: `${((pos.y - minY) / height) * 100}%`,
              background: NODE_COLOR[node.type],
            }}
            onClick={() => {
              if (isDestination) onSelectDestination(node.id);
              else if (isHutTarget) onSelectHut(node.id);
              else if (piece && piece.owner === 'player') onSelectPiece(piece);
            }}
          >
            {node.type !== 'road' && node.type !== 'hut' && <span className="kp-node-level">Lv{node.level}</span>}
            {piece && (
              <div
                className={`kp-piece kp-piece-${piece.owner}${piece.isKing ? ' kp-piece-king' : ''}${
                  piece.id === selectedPieceId ? ' kp-piece-selected' : ''
                }${piece.snared > 0 ? ' kp-piece-snared' : ''}`}
              >
                {piece.isKing ? '王' : piece.level}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `npm run typecheck`
Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/ui/board/Board.tsx
git commit -m "feat(ui): add board rendering component"
```

---

### Task 19: ゲームコントローラ（状態履歴・undo・選択）

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\board\useGameController.ts`

**Interfaces:**
- Consumes: `createInitialState` (Task 4), `getLegalActions` (Task 9), `playRound` (Task 11),
  `LevelDef`/`turnLimitOf` (Task 12)
- Produces:
```ts
function useGameController(level: LevelDef): {
  state: GameState;
  selectedPieceId: string | null;
  legalDestinations: string[];
  actionsTaken: number;
  selectPiece: (piece: Piece) => void;
  selectDestination: (nodeId: string) => void;
  selectHut: (nodeId: string) => void;
  undo: () => void;
  canUndo: boolean;
}
```
undo は「1手戻す。制限なし」（§10）を、履歴配列から末尾を捨てるだけで実現する（engine が常に新しい状態を返す純粋関数だから可能）。

- [ ] **Step 1: useGameController.ts を書く**

```ts
import { useCallback, useMemo, useState } from 'react';

import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import { playRound } from '@/engine/turn';
import type { GameState, Piece, PlayerAction } from '@/engine/types';
import { turnLimitOf, type LevelDef } from '@/levels/types';

export function useGameController(level: LevelDef) {
  const initial = useMemo(
    () =>
      createInitialState({
        board: level.board,
        initialPieces: level.initialPieces,
        initialCoins: level.initialCoins,
        attacks: level.attacks,
        turnLimit: turnLimitOf(level),
      }),
    [level]
  );
  const [history, setHistory] = useState<GameState[]>([initial]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const state = history[history.length - 1];

  const legalActions = useMemo(() => getLegalActions(state), [state]);

  const legalDestinations = useMemo(() => {
    if (!selectedPieceId) return [];
    const moves = legalActions
      .filter((a): a is Extract<PlayerAction, { kind: 'move' }> => a.kind === 'move' && a.pieceId === selectedPieceId)
      .map((a) => a.toNodeId);
    const canFootstep = legalActions.some((a) => a.kind === 'footstep' && a.pieceId === selectedPieceId);
    const selfNodeId = state.pieces.find((p) => p.id === selectedPieceId)?.nodeId;
    return canFootstep && selfNodeId ? [...moves, selfNodeId] : moves;
  }, [legalActions, selectedPieceId, state]);

  const selectPiece = useCallback((piece: Piece) => {
    setSelectedPieceId((current) => (current === piece.id ? null : piece.id));
  }, []);

  const commit = useCallback(
    (action: PlayerAction) => {
      setHistory((h) => [...h, playRound(h[h.length - 1], action)]);
      setSelectedPieceId(null);
    },
    []
  );

  const selectDestination = useCallback(
    (nodeId: string) => {
      if (!selectedPieceId) return;
      const piece = state.pieces.find((p) => p.id === selectedPieceId);
      if (!piece) return;
      commit(
        piece.nodeId === nodeId
          ? { kind: 'footstep', pieceId: piece.id }
          : { kind: 'move', pieceId: piece.id, toNodeId: nodeId }
      );
    },
    [selectedPieceId, state, commit]
  );

  const selectHut = useCallback((nodeId: string) => commit({ kind: 'generate', hutNodeId: nodeId }), [commit]);

  const undo = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    setSelectedPieceId(null);
  }, []);

  return {
    state,
    selectedPieceId,
    legalDestinations,
    actionsTaken: history.length - 1,
    selectPiece,
    selectDestination,
    selectHut,
    undo,
    canUndo: history.length > 1,
  };
}
```

- [ ] **Step 2: 型チェック**

Run: `npm run typecheck`
Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/ui/board/useGameController.ts
git commit -m "feat(ui): add game controller hook with undo history"
```

---

### Task 20: ゲーム画面（ヘッダー・ステータスバー・盤面・undo・結果）

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\Game.tsx`

**Interfaces:**
- Consumes: `useGameController` (Task 19), `Board` (Task 18), `UndoToolIcon` (`src/ui/shared/tool-icons.tsx`, Task 1),
  `computeStars` (Task 14), `recordClear` (Task 15), `turnLimitOf` (Task 12)
- Produces:
```ts
interface GameProps { level: LevelDef; onBack: () => void; onHelp: () => void }
export function Game(props: GameProps): JSX.Element
```

- [ ] **Step 1: Game.tsx を書く**

```tsx
import { useEffect } from 'react';

import { computeStars } from '@/engine/scoring';
import { recordClear } from '@/storage/progress';
import { turnLimitOf, type LevelDef } from '@/levels/types';

import { Board } from './board/Board';
import { useGameController } from './board/useGameController';
import { UndoToolIcon } from './shared/tool-icons';

interface GameProps {
  level: LevelDef;
  onBack: () => void;
  onHelp: () => void;
}

export function Game({ level, onBack, onHelp }: GameProps) {
  const {
    state,
    selectedPieceId,
    legalDestinations,
    actionsTaken,
    selectPiece,
    selectDestination,
    selectHut,
    undo,
    canUndo,
  } = useGameController(level);

  const rootId = level.initialPieces.find((p) => p.owner === 'player' && p.isKing)!.nodeId;
  const turnLimit = turnLimitOf(level);
  const remainingTurns = Math.max(turnLimit - state.round + 1, 0);

  useEffect(() => {
    if (state.status === 'won') {
      recordClear(level.id, computeStars(level.tStar, level.s, actionsTaken), actionsTaken);
    }
  }, [state.status, level, actionsTaken]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div className="header-left">
            <button type="button" className="icon-btn" onClick={onBack} aria-label="戻る">
              ←
            </button>
          </div>
          <h1 className="title">{level.title}</h1>
          <div className="header-actions">
            <button type="button" className="icon-btn" onClick={onHelp} aria-label="あそびかた">
              ?
            </button>
          </div>
        </div>
        <div className="status-bar">
          <span className="stat">コイン {state.coins}</span>
          <span className="stat">のこり {remainingTurns}ターン</span>
          {state.attacks.map((attack, i) => (
            <span key={attack.id} className="stat">
              {attack.type} あと{state.attackStates[i].remaining}
            </span>
          ))}
        </div>
      </header>
      <main className="play">
        <div className="board">
          <Board
            state={state}
            rootId={rootId}
            selectedPieceId={selectedPieceId}
            legalDestinations={legalDestinations}
            onSelectPiece={selectPiece}
            onSelectHut={selectHut}
            onSelectDestination={selectDestination}
          />
        </div>
        <footer className="footer">
          <button type="button" className="tool" onClick={undo} disabled={!canUndo} aria-label="もどす">
            <UndoToolIcon />
          </button>
        </footer>
      </main>
      {state.status !== 'playing' && (
        <div className="kp-result-overlay">
          <div className="kp-result-card">
            <p>{state.status === 'won' ? 'クリア！' : 'また挑戦しよう'}</p>
            <button type="button" className="text-btn" onClick={onBack}>
              もどる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `npm run typecheck`
Expected: エラーなし（`UndoToolIcon` は Task 1 の sync で既に `src/ui/shared/tool-icons.tsx` にある）。

- [ ] **Step 3: コミット**

```bash
git add src/ui/Game.tsx
git commit -m "feat(ui): add game screen with header, status bar, and undo"
```

---

### Task 21: あそびかたシート

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\HelpSheet.tsx`

**Interfaces:**
- Produces: `interface HelpSheetProps { onClose: () => void }`, `export function HelpSheet(props: HelpSheetProps): JSX.Element`

- [ ] **Step 1: HelpSheet.tsx を書く**

```tsx
interface HelpSheetProps {
  onClose: () => void;
}

export function HelpSheet({ onClose }: HelpSheetProps) {
  return (
    <div className="kp-sheet-overlay" onClick={onClose}>
      <div className="kp-sheet" onClick={(e) => e.stopPropagation()}>
        <h2>あそびかた</h2>
        <section>
          <h3>1. うごかす</h3>
          <p>自分の駒をえらんで、となりのマスへ。もといた場所をえらぶと足踏み。</p>
        </section>
        <section>
          <h3>2. たたかう</h3>
          <p>敵の駒がいるマスへ進むと戦闘。レベルが高いほうが勝ち、負けたほうは消える。同じレベルなら相討ち。</p>
        </section>
        <section>
          <h3>3. しせつ</h3>
          <p>自分のターンの終わりにその駒が乗っていると効果を受ける。訓練場は駒のレベルが上がる。</p>
        </section>
        <section>
          <h3>4. あしぶみ</h3>
          <p>足踏みすると、その施設のレベルが上がる（コインを払う）。</p>
        </section>
        <section>
          <h3>5. かちまけ</h3>
          <p>相手の王を倒せば勝ち。自分の王を失えば負け。決められたターン数で勝てなくても負け。</p>
        </section>
        <button type="button" className="text-btn" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `npm run typecheck`
Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/ui/HelpSheet.tsx
git commit -m "feat(ui): add help sheet"
```

---

### Task 22: ホーム画面

**Files:**
- Create: `C:\claude\king-puzzle\src\ui\Home.tsx`

**Interfaces:**
- Consumes: `chapters` (Task 14), `getProgress`/`isChapterUnlocked`/`clearAllProgress` (Task 15), `navigate` (Task 16)
- Produces: `export function Home(): JSX.Element`

- [ ] **Step 1: Home.tsx を書く**

```tsx
import { navigate } from '@/core/router';
import { chapters } from '@/levels/index';
import { clearAllProgress, getProgress, isChapterUnlocked } from '@/storage/progress';

export function Home() {
  const groups = chapters();

  const handleClearRecords = () => {
    clearAllProgress();
    window.location.reload();
  };

  return (
    <div className="app home">
      <div className="home-header">
        <button type="button" className="icon-btn" aria-label="設定">
          設定
        </button>
      </div>
      <h1 className="title">king-puzzle</h1>
      <p className="subtitle">城攻めパズル</p>
      <div className="chapter-list">
        {groups.map(({ chapter, levels }, index) => {
          const previousLevelIds = index > 0 ? groups[index - 1].levels.map((l) => l.id) : [];
          const unlocked = isChapterUnlocked(chapter, previousLevelIds);
          return (
            <section key={chapter} className={`chapter${unlocked ? '' : ' chapter-locked'}`}>
              <h2>章 {chapter}</h2>
              <ul>
                {levels.map((level) => {
                  const progress = getProgress(level.id);
                  return (
                    <li key={level.id}>
                      <button
                        type="button"
                        className="text-btn"
                        disabled={!unlocked}
                        onClick={() => navigate({ name: 'level', levelId: level.id })}
                      >
                        {level.title} {progress.cleared ? '★'.repeat(progress.bestStars) : ''}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <button type="button" className="dev-menu-pill" onClick={handleClearRecords}>
        テスト用（きろくをけす）
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `npm run typecheck`
Expected: エラーなし。

- [ ] **Step 3: コミット**

```bash
git add src/ui/Home.tsx
git commit -m "feat(ui): add home screen with chapter list and dev menu"
```

---

### Task 23: App配線・グローバルスタイル・最終 index.html

**Files:**
- Modify: `C:\claude\king-puzzle\src\App.tsx`
- Modify: `C:\claude\king-puzzle\src\main.tsx`
- Create: `C:\claude\king-puzzle\src\ui\styles.css`
- Test: `C:\claude\king-puzzle\__tests__\App.test.tsx`（ルーティングの分岐だけをスモークテストする。JSXを含むため拡張子は `.tsx`）

**Interfaces:**
- Consumes: `useRoute`/`goBack`/`navigate` (Task 16), `getLevel` (Task 14), `Game` (Task 20), `Home` (Task 22),
  `HelpSheet` (Task 21)

- [ ] **Step 1: App.test.tsx を書く（jsdom 上で hash を切り替えて描画確認）**

```ts
import { describe, expect, it, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { App } from '@/App';

afterEach(() => {
  window.location.hash = '';
  document.body.innerHTML = '';
});

describe('App routing smoke test', () => {
  it('home ルートで king-puzzle というタイトルが出る', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });
    expect(container.textContent).toContain('king-puzzle');
  });

  it('存在しないレベルIDでは案内文が出る', () => {
    window.location.hash = '#/level/does-not-exist';
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });
    expect(container.textContent).toContain('見つかりませんでした');
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npm run test -- App`
Expected: FAIL（`App` がまだ配線されていない）。

- [ ] **Step 3: App.tsx を書き直す**

```tsx
import { useState } from 'react';

import { goBack, navigate, useRoute } from '@/core/router';
import { getLevel } from '@/levels/index';

import { Game } from './ui/Game';
import { HelpSheet } from './ui/HelpSheet';
import { Home } from './ui/Home';

function LevelRoute({ levelId }: { levelId: string }) {
  const [showHelp, setShowHelp] = useState(false);
  const level = getLevel(levelId);

  if (!level) {
    return (
      <div className="app notice">
        <p>そのステージは見つかりませんでした。</p>
        <button type="button" className="text-btn" onClick={() => navigate({ name: 'home' })}>
          ホームへ
        </button>
      </div>
    );
  }

  return (
    <>
      <Game key={level.id} level={level} onBack={goBack} onHelp={() => setShowHelp(true)} />
      {showHelp && <HelpSheet onClose={() => setShowHelp(false)} />}
    </>
  );
}

export function App() {
  const route = useRoute();
  switch (route.name) {
    case 'level':
      return <LevelRoute levelId={route.levelId} />;
    default:
      return <Home />;
  }
}
```

- [ ] **Step 4: main.tsx を書き直す**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: styles.css を書く**

```css
@import './shared/tokens.css';
@import './shared/chrome.css';

html,
body,
#root {
  height: 100%;
  margin: 0;
  background: var(--bg);
  font-family: var(--font);
  color: var(--title);
}

.play {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
  padding: var(--pad);
}

.board {
  width: min(480px, 100%);
}

.kp-board {
  touch-action: none;
}
.kp-board-edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.kp-edge {
  stroke: var(--line);
  stroke-width: 3;
}

.kp-node {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--line);
  cursor: pointer;
}
.kp-node-legal {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.kp-node-level {
  font-size: 11px;
  color: var(--muted);
  position: absolute;
  margin-top: -40px;
}

.kp-piece {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #fff;
}
.kp-piece-player {
  background: var(--accent);
}
.kp-piece-enemy {
  background: var(--warn);
}
.kp-piece-king {
  border: 3px solid gold;
}
.kp-piece-selected {
  box-shadow: 0 0 0 3px var(--accent-hover);
}
.kp-piece-snared {
  opacity: 0.5;
}

.kp-result-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.kp-result-card {
  background: var(--surface);
  border-radius: var(--card-radius);
  padding: var(--pad);
  text-align: center;
}

.kp-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.3);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.kp-sheet {
  background: var(--surface);
  border-radius: var(--sheet-radius) var(--sheet-radius) 0 0;
  padding: var(--pad);
  width: min(480px, 100%);
  max-height: 80vh;
  overflow-y: auto;
}

.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
  padding: var(--pad);
}
.chapter-list {
  width: min(480px, 100%);
}
.chapter-locked {
  opacity: 0.4;
  pointer-events: none;
}
```

- [ ] **Step 6: テストを通す**

Run: `npm run test -- App`
Expected: 2件 PASS。

- [ ] **Step 7: 型チェックとテスト全体**

Run: `npm run typecheck`
Expected: エラーなし。

Run: `npm run test`
Expected: 全件 PASS。

- [ ] **Step 8: コミット**

```bash
git add src/App.tsx src/main.tsx src/ui/styles.css __tests__/App.test.tsx
git commit -m "feat: wire up App routing and global styles"
```

---

### Task 24: ブラウザでの動作確認（3レベル通しプレイ）

このタスクにはコードの変更はない。**実装したエージェント自身がブラウザツールで実際に操作して確認する。**
自動テストはロジックの正しさは保証するが、機能としての正しさ（実際に遊べるか）は保証しない
（CLAUDE.md「型チェックとテスト...機能の正しさは保証しない」）。

**Interfaces:**
- Consumes: Task 0 で起動した dev サーバ（`http://localhost:5190/`）

- [ ] **Step 1: 開発サーバが動いていることを確認する**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5190/`
Expected: `200`。動いていなければ `npm run dev` を `run_in_background: true` で起動する。

- [ ] **Step 2: ブラウザツールでホーム画面を開く**

`http://localhost:5190/#/` を開き、章1〜3が表示され、すべて選べる状態であることを確認する。

- [ ] **Step 3: 章1をクリアする**

「はじめての一手」を開き、king を3回移動（隣→隣→敵king）してクリアできることを確認する。
結果オーバーレイに「クリア！」が出て、undo ボタンが押せることも確認する。

- [ ] **Step 4: 章2をクリアする**

king を訓練場へ移動 → 敵kingへ移動、の2手でクリアできることを確認する。

- [ ] **Step 5: 章3をクリアする**

king を訓練場へ移動 → 足踏み（施設Lv3・自分Lv3になる）→ 敵kingへ移動、の3手でクリアできることを確認する。
足踏み直後にコインが正しく減り、駒のレベルが同ターンで上がって表示されることを確認する。

- [ ] **Step 6: undo を確認する**

任意のレベルで1手進めたあと undo ボタンを押し、直前の状態に戻ることを確認する。

- [ ] **Step 7: あそびかたシートを確認する**

プレイ画面右上の `?` を押してシートが開き、5項目が表示され、`とじる` で閉じることを確認する。

- [ ] **Step 8: 問題があれば該当タスクに戻って修正し、テストを再実行してから再確認する**

（コードを直した場合は、このタスクの Step 2 からやり直す。）

---

### Task 25: GitHub Pages への公開

**Files:**
- Create: `C:\claude\king-puzzle\scripts\deploy.mjs`

**Interfaces:**
- Consumes: `npm run build` の成果物 `dist/`

- [ ] **Step 1: deploy.mjs を書く（animal-puzzle と同じ方式）**

```js
// ビルド済みの dist/ を gh-pages ブランチへ push する。
//
// GitHub Actions を使っていないのは、gh の認証トークンに workflow スコープが
// 無く、.github/workflows/ を push できないため。こちらは追加の権限が要らない。

import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

const run = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });
const capture = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に npm run build を実行してください。');
  process.exit(1);
}

const remote = capture(['remote', 'get-url', 'origin']);
const name = capture(['config', 'user.name']);
const email = capture(['config', 'user.email']);

// 必須。GitHub Pages は Jekyll を既定で走らせ、`_` で始まるファイル・ディレクトリを
// 黙って除外する。これが無いと JS バンドルが 404 になる。
writeFileSync(join(DIST, '.nojekyll'), '');

// dist を使い捨てのリポジトリにして、履歴を持たない1コミットとして push する
rmSync(join(DIST, '.git'), { recursive: true, force: true });
run(['init', '-q'], DIST);
run(['config', 'user.name', name], DIST);
run(['config', 'user.email', email], DIST);
run(['checkout', '-q', '-B', 'gh-pages'], DIST);
run(['add', '-A'], DIST);
run(['commit', '-q', '-m', `deploy ${new Date().toISOString()}`], DIST);
run(['push', '-q', '-f', remote, 'gh-pages:gh-pages'], DIST);
rmSync(join(DIST, '.git'), { recursive: true, force: true });

console.log('gh-pages へ反映しました');
```

- [ ] **Step 2: GitHub にリポジトリを作成して push する**

Run:
```bash
gh repo create king-puzzle --public --source=. --remote=origin --push
```
Expected: `masato-masa/king-puzzle` が作成され、現在のブランチ（Task 0〜24 のコミット）が push される。

- [ ] **Step 3: GitHub Pages を有効化する**

Run:
```bash
gh api repos/masato-masa/king-puzzle/pages -X POST -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1 || true
```
（`gh-pages` ブランチがまだ無いため失敗することがある。その場合は Step 4 の deploy 後に再実行する。）

- [ ] **Step 4: ビルドしてデプロイする**

```bash
git add scripts/deploy.mjs
git commit -m "chore: add gh-pages deploy script"
npm run deploy
```

Expected: `gh-pages へ反映しました` と表示される。

- [ ] **Step 5: Pages が有効になっていなければここで有効化する**

Run:
```bash
gh api repos/masato-masa/king-puzzle/pages -X POST -f "source[branch]=gh-pages" -f "source[path]=/"
```
Expected: 成功、または既に有効なら該当のレスポンス。

- [ ] **Step 6: 公開URLを確認する**

数分待ってから `https://masato-masa.github.io/king-puzzle/` をブラウザツールで開き、
ホーム画面が表示され、章1をクリアできることを確認する（Task 24 と同じ手順を公開版で1回なぞる）。

- [ ] **Step 7: ユーザーに公開URLを報告する**

このタスクの最後に、公開URL `https://masato-masa.github.io/king-puzzle/` をユーザーに伝える。

---

## 完了条件

- `npm run test` と `npm run typecheck` が通る。
- 章1〜3のレベルが実際にブラウザで最初から最後までクリアできる（Task 24）。
- `https://masato-masa.github.io/king-puzzle/` で同じことができる（Task 25）。
- `shared-ui/sync.mjs --check` が「すべて一致している。」を返す。
- このフェーズで意図的にスコープ外とした項目（冒頭の表）が、次フェーズの計画で拾われることが分かっている。
