import { useEffect, useRef } from 'react';

import bgMap from '@/assets/art/bg-map.webp';
import starOffArt from '@/assets/sprites/star-off.png';
import starOnArt from '@/assets/sprites/star-on.png';
import { navigate } from '@/core/router';
import { chapters, LEVELS } from '@/levels/index';
import { getProgress } from '@/storage/progress';

import { BackIcon } from './icons';

/** 面と面の縦の間隔。ノード 56px と星・題名が収まる長さ。 */
const STEP = 112;
const PAD_TOP = 96;
const PAD_BOTTOM = 84;
/** 左右のふれ幅（横幅に対する割合）。 */
const SWAY = 0.27;

/** i 番目の面の位置。1 面目が地図の下、最後の面が上。道は左右にうねる。 */
function pointOf(index: number, total: number): { x: number; y: number } {
  const y = PAD_TOP + (total - 1 - index) * STEP;
  const x = 0.5 + SWAY * Math.sin(index * 0.95 + 0.3) * (index === 0 ? 0.4 : 1);
  return { x, y };
}

interface StageMapProps {
  open: Set<string>;
  onClose: () => void;
}

/**
 * ステージ選びの遠征マップ。羊皮紙の地図（assets-src/bg-map.png、ChatGPT 製）を上下にひっくり返しながら
 * 並べて長い一枚にし、その上に道と面のノードを重ねる。
 * 継ぎ目は上下反転で必ず連続する。今の面（最初の未クリアで開いている面）まで自動でスクロールする。
 */
export function StageMap({ open, onClose }: StageMapProps) {
  const total = LEVELS.length;
  const height = PAD_TOP + (total - 1) * STEP + PAD_BOTTOM;
  const progress = LEVELS.map((l) => getProgress(l.id));
  const currentIndex = LEVELS.findIndex((l, i) => open.has(l.id) && !progress[i].cleared);
  const current = currentIndex === -1 ? total - 1 : currentIndex;
  const stars = progress.reduce((sum, p) => sum + p.bestStars, 0);
  // 最初の閉じた章の旗に「あと N 面で開く」を添える（開く条件は前の章の 7 割クリア）
  const groups = chapters();
  const lockedAt = groups.findIndex((g) => g.levels.every((l) => !open.has(l.id)));
  let unlockNote: { chapter: number; need: number } | null = null;
  if (lockedAt > 0) {
    const prev = groups[lockedAt - 1].levels;
    const done = prev.filter((l) => getProgress(l.id).cleared).length;
    unlockNote = { chapter: groups[lockedAt].chapter, need: Math.max(1, Math.ceil(prev.length * 0.7) - done) };
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const target = pointOf(current, total).y - box.clientHeight * 0.55;
    box.scrollTop = Math.max(0, target);
  }, [current, total]);

  const points = LEVELS.map((_, i) => pointOf(i, total));
  // 道。隣り合う面を、縦に出入りする曲線でなめらかにつなぐ（x は 0〜100 の割合）
  const road = points
    .map((p, i) => {
      const x = p.x * 100;
      if (i === 0) return `M ${x} ${p.y}`;
      const q = points[i - 1];
      const midY = (p.y + q.y) / 2;
      return `C ${q.x * 100} ${midY} ${x} ${midY} ${x} ${p.y}`;
    })
    .join(' ');
  // クリア済みの区間だけ金に光らせる
  const doneUntil = progress.reduce((n, p, i) => (p.cleared && i === n ? n + 1 : n), 0);

  return (
    <div className="kp-map" role="dialog" aria-label="ステージ">
      <header className="kp-map-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="閉じる">
          <BackIcon />
        </button>
        <h2 className="kp-map-title">えんせい</h2>
        <span className="kp-map-stars">
          <img src={starOnArt} alt="" draggable={false} />
          {stars}/{total * 3}
        </span>
      </header>

      <div className="kp-map-scroll" ref={scrollRef}>
        <div className="kp-map-world" style={{ height }}>
          <div className="kp-map-tiles" aria-hidden>
            {Array.from({ length: Math.ceil(height / 430) + 1 }, (_, t) => (
              <div
                key={t}
                className={`kp-map-tile${t % 2 === 1 ? ' flip' : ''}`}
                style={{ backgroundImage: `url(${bgMap})` }}
              />
            ))}
          </div>

          <svg className="kp-map-road" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
            <path d={road} className="kp-road-base" />
            {doneUntil > 1 && (
              <path
                d={points
                  .slice(0, doneUntil)
                  .map((p, i) => {
                    const x = p.x * 100;
                    if (i === 0) return `M ${x} ${p.y}`;
                    const q = points[i - 1];
                    const midY = (p.y + q.y) / 2;
                    return `C ${q.x * 100} ${midY} ${x} ${midY} ${x} ${p.y}`;
                  })
                  .join(' ')}
                className="kp-road-done"
              />
            )}
          </svg>

          {unlockNote && (
            <p
              className="kp-map-unlock"
              style={{ top: points[LEVELS.findIndex((l) => l.chapter === unlockNote.chapter)].y - 68 }}
            >
              章 {unlockNote.chapter - 1} をあと {unlockNote.need} 面クリアすると、ここがひらく
            </p>
          )}

          {LEVELS.map((level, i) => {
            const p = points[i];
            const prog = progress[i];
            const locked = !open.has(level.id);
            const isCurrent = i === current && !locked && !prog.cleared;
            const firstOfChapter = i === 0 || LEVELS[i - 1].chapter !== level.chapter;
            const side = p.x > 0.5 ? 'left' : 'right';
            return (
              <div key={level.id} className="kp-map-spot" style={{ left: `${p.x * 100}%`, top: p.y }}>
                {firstOfChapter && (
                  <span className={`kp-map-chapter ${side}`}>
                    章 {level.chapter}
                  </span>
                )}
                <button
                  type="button"
                  className={`kp-map-node${locked ? ' locked' : ''}${prog.cleared ? ' cleared' : ''}${
                    isCurrent ? ' current' : ''
                  }`}
                  disabled={locked}
                  onClick={() => navigate({ name: 'level', levelId: level.id })}
                  aria-label={`${level.title}${locked ? '（まだ）' : ` 星 ${prog.bestStars}`}`}
                >
                  {locked ? <LockIcon /> : <span className="kp-map-num">{i + 1}</span>}
                </button>
                {!locked && (
                  <span className="kp-map-stars-row" aria-hidden>
                    {[1, 2, 3].map((n) => (
                      <img key={n} src={n <= prog.bestStars ? starOnArt : starOffArt} alt="" draggable={false} />
                    ))}
                  </span>
                )}
                <span className={`kp-map-name ${side}${locked ? ' locked' : ''}`}>{locked ? '？？？' : level.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2h1.5A1.5 1.5 0 0 1 20 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10H7zm2 0h6V8a3 3 0 0 0-6 0v2z"
        fill="currentColor"
      />
    </svg>
  );
}
