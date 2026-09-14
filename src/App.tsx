import { useState } from 'react';

import { navigate, useRoute } from '@/core/router';
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
        <button type="button" className="sheet-link" onClick={() => navigate({ name: 'home' })}>
          ホームへ
        </button>
      </div>
    );
  }

  return (
    <>
      <Game key={level.id} level={level} onBack={() => navigate({ name: 'home' })} onHelp={() => setShowHelp(true)} />
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
