import { useCallback, useMemo, useState } from 'react';

import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import { playRound } from '@/engine/turn';
import type { GameState, Piece, PlayerAction } from '@/engine/types';
import { turnLimitOf, type LevelDef } from '@/levels/types';
import { buzz, playSfx } from '@/core/sound';

/** 1 手で起きたことを音にする。前と後の盤面を比べるだけで、engine には手を入れない。 */
function soundOf(prev: GameState, next: GameState, action: PlayerAction): void {
  const count = (s: GameState, owner: Piece['owner']) => s.pieces.filter((p) => p.owner === owner).length;
  if (action.kind === 'generate') playSfx('summon');
  else if (action.kind === 'move' || action.kind === 'footstep') playSfx('select');
  if (count(next, 'enemy') < count(prev, 'enemy')) {
    playSfx('hit', 0.12);
    buzz(18);
  }
  if (count(next, 'player') < count(prev, 'player')) {
    playSfx('death', 0.2);
    buzz([0, 30, 40, 30]);
  }
  if (next.coins > prev.coins) playSfx('coin', 0.18);
  if (next.status === 'won' && prev.status === 'playing') {
    playSfx('win', 0.45);
    buzz([0, 18, 60, 18, 60, 30]);
  } else if (next.status !== 'playing' && prev.status === 'playing') {
    playSfx('lose', 0.45);
  }
}

export function useGameController(level: LevelDef) {
  const initial = useMemo(
    () =>
      createInitialState({
        board: level.board,
        initialPieces: level.initialPieces,
        initialCoins: level.initialCoins,
        attacks: level.attacks,
        turnLimit: turnLimitOf(level),
      }),
    [level]
  );
  const [history, setHistory] = useState<GameState[]>([initial]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const state = history[history.length - 1];

  const legalActions = useMemo(() => getLegalActions(state), [state]);

  const legalDestinations = useMemo(() => {
    if (!selectedPieceId) return [];
    const moves = legalActions
      .filter((a): a is Extract<PlayerAction, { kind: 'move' }> => a.kind === 'move' && a.pieceId === selectedPieceId)
      .map((a) => a.toNodeId);
    const canFootstep = legalActions.some((a) => a.kind === 'footstep' && a.pieceId === selectedPieceId);
    const selfNodeId = state.pieces.find((p) => p.id === selectedPieceId)?.nodeId;
    return canFootstep && selfNodeId ? [...moves, selfNodeId] : moves;
  }, [legalActions, selectedPieceId, state]);

  const selectPiece = useCallback((piece: Piece) => {
    playSfx('tap');
    setSelectedPieceId((current) => (current === piece.id ? null : piece.id));
  }, []);

  const commit = useCallback(
    (action: PlayerAction) => {
      const next = playRound(state, action);
      setHistory((h) => [...h, next]);
      setSelectedPieceId(null);
      soundOf(state, next, action);
    },
    [state]
  );

  const selectDestination = useCallback(
    (nodeId: string) => {
      if (!selectedPieceId) return;
      const piece = state.pieces.find((p) => p.id === selectedPieceId);
      if (!piece) return;
      commit(
        piece.nodeId === nodeId
          ? { kind: 'footstep', pieceId: piece.id }
          : { kind: 'move', pieceId: piece.id, toNodeId: nodeId }
      );
    },
    [selectedPieceId, state, commit]
  );

  const selectHut = useCallback((nodeId: string) => commit({ kind: 'generate', hutNodeId: nodeId }), [commit]);

  const undo = useCallback(() => {
    if (history.length > 1) playSfx('tap');
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    setSelectedPieceId(null);
  }, [history.length]);

  return {
    state,
    selectedPieceId,
    legalDestinations,
    actionsTaken: history.length - 1,
    selectPiece,
    selectDestination,
    selectHut,
    undo,
    canUndo: history.length > 1,
  };
}
