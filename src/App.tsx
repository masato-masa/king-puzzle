import { useEffect, useState } from 'react';

import { navigate, useRoute } from '@/core/router';
import { loadEndless, peekEndless } from '@/levels/endlessClient';
import { getLevel, getNextLevel } from '@/levels/index';
import type { LevelDef } from '@/levels/types';
import { recordEndlessClear } from '@/storage/endless';

import { Game } from './ui/Game';
import { HelpSheet } from './ui/HelpSheet';
import { Home } from './ui/Home';

function LevelRoute({ levelId }: { levelId: string }) {
  const [showHelp, setShowHelp] = useState(false);
  /** もういちど遊ぶたびに増やし、Game を作り直して状態を初期化する。 */
  const [attempt, setAttempt] = useState(0);
  const level = getLevel(levelId);
  const next = getNextLevel(levelId);

  if (!level) {
    return (
      <div className="app notice">
        <p>そのステージは見つかりませんでした。</p>
        <button type="button" className="sheet-link" onClick={() => navigate({ name: 'home' })}>
          ホームへ
        </button>
      </div>
    );
  }

  return (
    <>
      <Game
        key={`${level.id}:${attempt}`}
        level={level}
        onBack={() => navigate({ name: 'home' })}
        onHelp={() => setShowHelp(true)}
        onRetry={() => setAttempt((n) => n + 1)}
        onNext={next ? () => navigate({ name: 'level', levelId: next.id }) : undefined}
      />
      {showHelp && <HelpSheet onClose={() => setShowHelp(false)} />}
    </>
  );
}

/** むげんの n 面目。作り終えるまではローディングを出し、遊んでいる間に次の面を先読みする。 */
function EndlessRoute({ n }: { n: number }) {
  const [showHelp, setShowHelp] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [level, setLevel] = useState<LevelDef | undefined>(() => peekEndless(n));

  useEffect(() => {
    let alive = true;
    setLevel(peekEndless(n));
    void loadEndless(n).then((made) => {
      if (!alive) return;
      setLevel(made);
      void loadEndless(n + 1);
    });
    return () => {
      alive = false;
    };
  }, [n]);

  if (!level || level.order !== n) {
    return (
      <div className="app notice" role="status" aria-live="polite">
        <p className="kp-loading">むげん {n} をつくっています…</p>
      </div>
    );
  }

  return (
    <>
      <Game
        key={`${level.id}:${attempt}`}
        level={level}
        onBack={() => navigate({ name: 'home' })}
        onHelp={() => setShowHelp(true)}
        onRetry={() => setAttempt((k) => k + 1)}
        onNext={() => navigate({ name: 'endless', n: n + 1 })}
        onClear={(stars) => recordEndlessClear(n, stars)}
        backLabel="ホームへ"
      />
      {showHelp && <HelpSheet onClose={() => setShowHelp(false)} />}
    </>
  );
}

export function App() {
  const route = useRoute();
  switch (route.name) {
    case 'level':
      return <LevelRoute levelId={route.levelId} />;
    case 'endless':
      return <EndlessRoute n={route.n} />;
    default:
      return <Home />;
  }
}
