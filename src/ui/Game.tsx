import { useEffect, useState } from 'react';

import { computeStars } from '@/engine/scoring';
import { recordClear } from '@/storage/progress';
import { hasSeenHint, markHintSeen } from '@/storage/hints';
import { turnLimitOf, type LevelDef } from '@/levels/types';
import type { AttackType } from '@/engine/types';

import { Board } from './board/Board';
import { useGameController } from './board/useGameController';
import { UndoToolIcon } from './shared/tool-icons';
import { BackIcon, GearIcon, HelpIcon } from './icons';
import coinArt from '@/assets/sprites/coin.png';
import hourglassArt from '@/assets/sprites/hourglass.png';
import starOnArt from '@/assets/sprites/star-on.png';
import starOffArt from '@/assets/sprites/star-off.png';
import { SettingsSheet } from './SettingsSheet';
import { LEVEL_TIPS } from './levelTips';

/** 勝敗が決まってから結果カードを出すまで。最後の一手の音と盤面を見せ切る長さ。 */
const RESULT_DELAY_MS = 1200;

/** 2 行目では盤の印と同じ 1 文字で出す。攻撃が 3 つあっても 375px の 1 行に収める（KP-12）。 */
const ATTACK_SHORT: Record<AttackType, string> = {
  arrow: '弓',
  cannon: '砲',
  snare: '罠',
  blockade: '封',
  spawn: '兵',
};

const ATTACK_NAME: Record<AttackType, string> = {
  arrow: '弓',
  cannon: '大砲',
  snare: '足止め',
  blockade: '封鎖',
  spawn: '敵兵',
};

interface GameProps {
  level: LevelDef;
  onBack: () => void;
  onHelp: () => void;
  onRetry: () => void;
  /** 次のステージが無ければ undefined。 */
  onNext?: () => void;
  /** クリアしたときの記録。渡さなければ本編の記録に書く。 */
  onClear?: (stars: 1 | 2 | 3, turns: number) => void;
  /** 結果カードの「戻る」ボタンの文言。 */
  backLabel?: string;
}

export function Game({ level, onBack, onHelp, onRetry, onNext, onClear, backLabel = 'ステージせんたく' }: GameProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
  // 初めて出る仕掛けの一言ヒント。タップで閉じるか、クリアしたら「見た」にする（KP-24）
  const tip = LEVEL_TIPS[level.id];
  const [tipOpen, setTipOpen] = useState(() => tip !== undefined && !hasSeenHint(level.id));
  const closeTip = () => {
    markHintSeen(level.id);
    setTipOpen(false);
  };
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
  // コインが増えも減りもしない面では出さない（2 行目を空ける）
  const usesCoins =
    level.initialCoins > 0 || level.board.nodes.some((n) => n.type === 'mine' || (n.type === 'hut' && n.hutOwner === 'player'));

  useEffect(() => {
    if (state.status === 'won') {
      const earned = computeStars(level.tStar, level.s, actionsTaken);
      markHintSeen(level.id);
      if (onClear) onClear(earned, actionsTaken);
      else recordClear(level.id, earned, actionsTaken);
    }
    // onClear は描くたびに作り直されるので見ない（クリアの瞬間に 1 回だけ書けばよい）
  }, [state.status, level, actionsTaken]);

  const stars = computeStars(level.tStar, level.s, actionsTaken);
  // 1 面目だけ、最初の 1 手まで操作を 1 行で案内する（KP-7）。押す場所が変わるたびに文言も変わる
  const hint =
    level.chapter === 1 && level.order === 1 && actionsTaken === 0 && state.status === 'playing'
      ? selectedPieceId
        ? '光っているマスをタップして進もう'
        : '自分の王（青）をタップしよう'
      : null;
  useEffect(() => {
    if (state.status === 'playing') {
      setShowResult(false);
      return;
    }
    const timer = window.setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state.status]);

  return (
    <div className="app app-battle">
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
          {usesCoins && (
            <span className="stat" aria-label={`コイン ${state.coins}`}>
              <img className="stat-icon" src={coinArt} alt="" draggable={false} />
              {state.coins}
            </span>
          )}
          <span className="stat" aria-label={`のこり ${remainingTurns} ターン`}>
            <img className="stat-icon" src={hourglassArt} alt="" draggable={false} />
            {remainingTurns}手
          </span>
          <span className="stat" aria-label={`星3つは ${level.tStar} 手以内`}>
            <img className="stat-icon" src={starOnArt} alt="" draggable={false} />
            <img className="stat-icon stat-icon-tight" src={starOnArt} alt="" draggable={false} />
            <img className="stat-icon stat-icon-tight" src={starOnArt} alt="" draggable={false} />
            {level.tStar}手
          </span>
          {state.attacks.length > 0 && (
            <span
              className="stat kp-stat-attacks"
              aria-label={state.attacks
                .map((attack, i) => `${ATTACK_NAME[attack.type]} あと${state.attackStates[i].remaining}`)
                .join('、')}
            >
              {state.attacks.map((attack, i) => (
                <span key={attack.id} className={state.attackStates[i].remaining <= 1 ? 'kp-stat-soon' : undefined}>
                  {ATTACK_SHORT[attack.type]}
                  {state.attackStates[i].remaining}
                </span>
              ))}
            </span>
          )}
        </div>
      </header>
      {tip && tipOpen && state.status === 'playing' && (
        <button type="button" className="kp-tip" onClick={closeTip}>
          <span>{tip}</span>
          <span className="kp-tip-close" aria-hidden="true">
            ✕
          </span>
        </button>
      )}
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
          {hint && (
            <p className="kp-hint" role="status">
              {hint}
            </p>
          )}
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
                      <img src={i < stars ? starOnArt : starOffArt} alt="" draggable={false} />
                    </span>
                  ))}
                </div>
                <p className="kp-result-sub">
                  {actionsTaken} 手（さいたん {level.tStar}）
                  {stars < 3 && (
                    <>
                      <br />
                      <span className="kp-result-goal">★3 まで あと {actionsTaken - level.tStar} 手</span>
                    </>
                  )}
                </p>
                <p className="kp-result-rule">
                  ★3 は {level.tStar} 手以内 ／ ★2 は {level.tStar + Math.floor(level.s / 2)} 手以内
                </p>
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
                {backLabel}
              </button>
            </div>
          </div>
        </div>
      )}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
}
