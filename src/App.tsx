import { useState } from 'react';

import { navigate, useRoute } from '@/core/router';
import { getLevel, getNextLevel } from '@/levels/index';

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

export function App() {
  const route = useRoute();
  switch (route.name) {
    case 'level':
      return <LevelRoute levelId={route.levelId} />;
    default:
      return <Home />;
  }
}
