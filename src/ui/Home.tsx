import { useState } from 'react';

import kingArt from '@/assets/sprites/king-player.png';
import { navigate } from '@/core/router';
import { chapters, LEVELS } from '@/levels/index';
import type { LevelDef } from '@/levels/index';
import { clearAllProgress, getProgress, isChapterUnlocked } from '@/storage/progress';

import { GearIcon } from './icons';
import { SettingsSheet } from './SettingsSheet';

type Sheet = 'none' | 'settings' | 'levels';

/** 章ごとに、遊べるかどうかを決める（前の章の 7 割クリアで開く）。 */
function unlockedLevels(): Set<string> {
  const groups = chapters();
  const open = new Set<string>();
  groups.forEach(({ chapter, levels }, index) => {
    const previousLevelIds = index > 0 ? groups[index - 1].levels.map((l) => l.id) : [];
    if (isChapterUnlocked(chapter, previousLevelIds)) levels.forEach((l) => open.add(l.id));
  });
  return open;
}

/** 「つづきから」の行き先。遊べる面のうち、まだクリアしていない最初の面。全部クリア済みなら最後の面。 */
function resumeLevel(open: Set<string>): LevelDef {
  return LEVELS.find((l) => open.has(l.id) && !getProgress(l.id).cleared) ?? LEVELS[LEVELS.length - 1];
}

export function Home() {
  const [sheet, setSheet] = useState<Sheet>('none');
  const open = unlockedLevels();
  const resume = resumeLevel(open);
  const progress = LEVELS.map((l) => getProgress(l.id));
  const clearedCount = progress.filter((p) => p.cleared).length;
  const starCount = progress.reduce((sum, p) => sum + p.bestStars, 0);
  const started = clearedCount > 0;

  const handleClearRecords = () => {
    clearAllProgress();
    window.location.reload();
  };

  return (
    <div className="app app-home">
      <div className="home-top">
        <button type="button" className="icon-btn" onClick={() => setSheet('settings')} aria-label="設定">
          <GearIcon />
        </button>
      </div>

      <div className="home">
        <div className="home-art">
          <img className="home-king" src={kingArt} alt="" />
        </div>
        <h1 className="home-title">キングパズル</h1>
        <p className="home-sub">王を守って、相手の王をとろう</p>

        <div className="home-buttons">
          <button
            type="button"
            className="home-btn primary"
            onClick={() => navigate({ name: 'level', levelId: resume.id })}
          >
            {started ? (
              <>
                つづきから
                <span className="home-btn-sub">{resume.title}</span>
              </>
            ) : (
              'はじめる'
            )}
          </button>
          <button type="button" className="home-btn" onClick={() => setSheet('levels')}>
            ステージをえらぶ
          </button>
        </div>

        <p className="home-progress">
          クリア {clearedCount}/{LEVELS.length}　★ {starCount}/{LEVELS.length * 3}
        </p>
      </div>

      <button type="button" className="dev-pill" onClick={handleClearRecords}>
        テスト用（きろくをけす）
      </button>

      {sheet === 'settings' && <SettingsSheet onClose={() => setSheet('none')} />}
      {sheet === 'levels' && <LevelSheet open={open} onClose={() => setSheet('none')} />}
    </div>
  );
}

/** ステージ一覧。章ごとに並べ、まだ開いていない章は押せない。 */
function LevelSheet({ open, onClose }: { open: Set<string>; onClose: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="sheet-title">ステージ</h2>
        <div className="sheet-list">
          {chapters().map(({ chapter, levels }) => (
            <section key={chapter} className="level-chapter">
              <h3 className="level-chapter-title">章 {chapter}</h3>
              {levels.map((level) => {
                const p = getProgress(level.id);
                const locked = !open.has(level.id);
                return (
                  <button
                    key={level.id}
                    type="button"
                    className="sheet-row level-row"
                    disabled={locked}
                    onClick={() => navigate({ name: 'level', levelId: level.id })}
                  >
                    <span>{level.title}</span>
                    <span className="level-stars" aria-label={`星 ${p.bestStars}`}>
                      {locked ? 'まだ' : [1, 2, 3].map((n) => (
                        <span key={n} className={n <= p.bestStars ? 'on' : ''}>
                          ★
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
        <button type="button" className="sheet-btn" onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}
