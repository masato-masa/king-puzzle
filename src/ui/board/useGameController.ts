import { useCallback, useMemo, useState } from 'react';

import { getLegalActions } from '@/engine/legalActions';
import { createInitialState } from '@/engine/state';
import { playRound } from '@/engine/turn';
import type { GameState, Piece, PlayerAction } from '@/engine/types';
import { turnLimitOf, type LevelDef } from '@/levels/types';

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
    setSelectedPieceId((current) => (current === piece.id ? null : piece.id));
  }, []);

  const commit = useCallback(
    (action: PlayerAction) => {
      setHistory((h) => [...h, playRound(h[h.length - 1], action)]);
      setSelectedPieceId(null);
    },
    []
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
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    setSelectedPieceId(null);
  }, []);

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
