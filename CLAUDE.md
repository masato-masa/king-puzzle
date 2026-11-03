# キングパズル

共通の進め方は `C:\claude\CLAUDE.md`。ここにはこのアプリ固有のことだけ書く。
仕様・バックログは `Obsidian:Projects/king-puzzle/`（`backlog.md`）。

- **戦略ゲーム扱い**（ユーザー指定 2026-11-03）。にゃんどく等のパズルゲーム共通 UI（shared-ui）の対象外。
  リアルカードバトルと同じく、素材を作り込んだ重厚な画面にする。判断は `Obsidian:Decisions/2026-11-03-king-puzzle-strategy-genre.md`。
- `src/ui/shared/` は昔 shared-ui から配られた写しだが、**今はこのゲームのもの**。見た目の上書きは `src/ui/theme.css` に書く。
- ゲーム性（`src/engine/`・`src/levels/`）は変えない。面を足したら `npx tsx scripts/audit-levels.ts`、むげんは `scripts/audit-endless.ts`。
- 絵は ChatGPT 製。一枚絵を `assets-src/` に置き、`node scripts/slice-sprites.mjs <rc|extras|stable>` で `src/assets/sprites/` へ切り出す。
  - `pieces-rc-sheet.png`（`rc`）: 王・兵・小屋・採掘場・訓練場・城壁。リアルカードバトルの画風
  - `extras-rc-sheet.png`（`extras`）: 馬小屋・蹄鉄・コイン・星（点灯／消灯）・砂時計
  - `bg-table.png`: 戦闘画面の背景（作戦室の机と羊皮紙）。`src/assets/art/bg-table.webp` に変換してある。羊皮紙の位置に合わせて `theme.css` の `--table-top/bottom` を決めている
  - 旧 `sheet.png`・`stable-sheet.png` は前の画風の元データ（切り出し先は上書き済み）
- ブラウザで試すときは URL に `?mute`。開発サーバーは `npm run dev`（ポート 5190）。
- 公開: `npm run deploy`（gh-pages ブランチへ）。
