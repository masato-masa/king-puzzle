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
            <button type="button" className="sheet-link" onClick={onBack}>
              もどる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
