import { useEffect, useState } from 'react';

import { computeStars } from '@/engine/scoring';
import { recordClear } from '@/storage/progress';
import { turnLimitOf, type LevelDef } from '@/levels/types';
import type { AttackType } from '@/engine/types';

import { Board } from './board/Board';
import { useGameController } from './board/useGameController';
import { UndoToolIcon } from './shared/tool-icons';
import { BackIcon, GearIcon, HelpIcon } from './icons';
import { SettingsSheet } from './SettingsSheet';

/** 勝敗が決まってから結果カードを出すまで。最後の一手の音と盤面を見せ切る長さ。 */
const RESULT_DELAY_MS = 1200;

const ATTACK_NAME: Record<AttackType, string> = {
  arrow: '弓',
  cannon: '大砲',
  snare: '足止め',
  blockade: '封鎖',
};

interface GameProps {
  level: LevelDef;
  onBack: () => void;
  onHelp: () => void;
  onRetry: () => void;
  /** 次のステージが無ければ undefined。 */
  onNext?: () => void;
}

export function Game({ level, onBack, onHelp, onRetry, onNext }: GameProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
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

  const stars = computeStars(level.tStar, level.s, actionsTaken);
  useEffect(() => {
    if (state.status === 'playing') {
      setShowResult(false);
      return;
    }
    const timer = window.setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state.status]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div className="header-left">
            <button type="button" className="icon-btn" onClick={onBack} aria-label="戻る">
              <BackIcon />
            </button>
          </div>
          <h1 className="title">{level.title}</h1>
          <div className="header-actions">
            <button type="button" className="icon-btn" onClick={() => setShowSettings(true)} aria-label="設定">
              <GearIcon />
            </button>
            <button type="button" className="icon-btn" onClick={onHelp} aria-label="あそびかた">
              <HelpIcon />
            </button>
          </div>
        </div>
        <div className="status-bar">
          <span className="stat">コイン {state.coins}</span>
          <span className="stat">のこり {remainingTurns}ターン</span>
          <span className="stat" aria-label={`星3つは ${level.tStar} 手以内`}>
            ★3 {level.tStar}手
          </span>
          {state.attacks.map((attack, i) => (
            <span key={attack.id} className="stat">
              {ATTACK_NAME[attack.type]} あと{state.attackStates[i].remaining}
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
      {showResult && (
        <div className="kp-result-overlay">
          <div className="kp-result-card">
            {state.status === 'won' ? (
              <>
                <p className="kp-result-title">クリア！</p>
                <div className="kp-stars" aria-label={`星 ${stars}`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i < stars ? 'kp-star on' : 'kp-star'} style={{ animationDelay: `${180 + i * 260}ms` }}>
                      {i < stars ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="kp-result-sub">{actionsTaken} 手（さいたん {level.tStar}）</p>
              </>
            ) : (
              <>
                <p className="kp-result-title">また挑戦しよう</p>
                <p className="kp-result-sub">{state.status === 'lost-king' ? '王がたおされた' : 'ターンが尽きた'}</p>
              </>
            )}
            <div className="kp-result-buttons">
              {state.status === 'won' && onNext ? (
                <button type="button" className="home-btn primary" onClick={onNext}>
                  つぎへ
                </button>
              ) : null}
              <button type="button" className={state.status === 'won' && onNext ? 'home-btn' : 'home-btn primary'} onClick={onRetry}>
                もういちど
              </button>
              <button type="button" className="home-btn" onClick={onBack}>
                ステージせんたく
              </button>
            </div>
          </div>
        </div>
      )}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
}
