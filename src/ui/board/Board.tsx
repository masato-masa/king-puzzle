import { computeLayout } from './layout';
import type { GameState, Piece } from '@/engine/types';

interface BoardProps {
  state: GameState;
  rootId: string;
  selectedPieceId: string | null;
  legalDestinations: string[];
  onSelectPiece: (piece: Piece) => void;
  onSelectHut: (nodeId: string) => void;
  onSelectDestination: (nodeId: string) => void;
}

const NODE_COLOR: Record<string, string> = {
  road: 'var(--surface-2)',
  hut: '#d9c07a',
  wall: '#8a5a5a',
  mine: '#7a9e7e',
  training: '#7a8fc2',
};

export function Board({
  state,
  rootId,
  selectedPieceId,
  legalDestinations,
  onSelectPiece,
  onSelectHut,
  onSelectDestination,
}: BoardProps) {
  const positions = computeLayout(state.board, rootId);
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const minX = Math.min(...xs) - 60;
  const maxX = Math.max(...xs) + 60;
  const minY = Math.min(...ys) - 60;
  const maxY = Math.max(...ys) + 60;
  const width = maxX - minX;
  const height = maxY - minY;

  const pieceAt = (nodeId: string): Piece | undefined => state.pieces.find((p) => p.nodeId === nodeId);

  return (
    <div className="kp-board" style={{ position: 'relative', width: '100%', aspectRatio: `${width} / ${height}` }}>
      <svg viewBox={`${minX} ${minY} ${width} ${height}`} className="kp-board-edges">
        {state.board.edges.map((edge) => {
          const a = positions[edge.a];
          const b = positions[edge.b];
          return <line key={`${edge.a}-${edge.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="kp-edge" />;
        })}
      </svg>
      {state.board.nodes.map((node) => {
        const pos = positions[node.id];
        const piece = pieceAt(node.id);
        const isDestination = legalDestinations.includes(node.id);
        const isHutTarget = node.type === 'hut' && node.hutOwner === 'player' && !piece;
        return (
          <div
            key={node.id}
            className={`kp-node kp-node-${node.type}${isDestination ? ' kp-node-legal' : ''}`}
            style={{
              position: 'absolute',
              left: `${((pos.x - minX) / width) * 100}%`,
              top: `${((pos.y - minY) / height) * 100}%`,
              background: NODE_COLOR[node.type],
            }}
            onClick={() => {
              if (isDestination) onSelectDestination(node.id);
              else if (isHutTarget) onSelectHut(node.id);
              else if (piece && piece.owner === 'player') onSelectPiece(piece);
            }}
          >
            {node.type !== 'road' && node.type !== 'hut' && <span className="kp-node-level">Lv{node.level}</span>}
            {piece && (
              <div
                className={`kp-piece kp-piece-${piece.owner}${piece.isKing ? ' kp-piece-king' : ''}${
                  piece.id === selectedPieceId ? ' kp-piece-selected' : ''
                }${piece.snared > 0 ? ' kp-piece-snared' : ''}`}
              >
                {piece.isKing ? '王' : piece.level}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
