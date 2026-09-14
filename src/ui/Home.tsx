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
      <h1 className="title">king-puzzle</h1>
      <p className="home-sub">城攻めパズル</p>
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
                        className="sheet-link"
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
      <button type="button" className="dev-pill" onClick={handleClearRecords}>
        テスト用（きろくをけす）
      </button>
    </div>
  );
}
