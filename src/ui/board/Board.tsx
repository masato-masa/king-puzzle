import { computeLayout } from './layout';
import type { BoardNode, GameState, Piece } from '@/engine/types';

// 絵は assets-src/sheet.png（ChatGPT で 1 枚に描かせたもの）を scripts/slice-sprites.mjs で切り出したもの。
const SPRITES = import.meta.glob('../../assets/sprites/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const sprite = (name: string): string => SPRITES[`../../assets/sprites/${name}.png`];

/** 道には絵を置かない。施設と小屋と壁だけ建物の絵を出す。 */
const BUILDING: Partial<Record<BoardNode['type'], string>> = {
  hut: 'hut',
  wall: 'wall',
  mine: 'mine',
  training: 'training',
};

const FACILITY_NAME: Partial<Record<BoardNode['type'], string>> = {
  wall: '壁',
  mine: '鉱山',
  training: '訓練所',
};

interface BoardProps {
  state: GameState;
  rootId: string;
  selectedPieceId: string | null;
  legalDestinations: string[];
  onSelectPiece: (piece: Piece) => void;
  onSelectHut: (nodeId: string) => void;
  onSelectDestination: (nodeId: string) => void;
}

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
        const building = BUILDING[node.type];
        const facilityName = FACILITY_NAME[node.type];
        return (
          <div
            key={node.id}
            className={`kp-node kp-node-${node.type}${node.hutOwner ? ` kp-hut-${node.hutOwner}` : ''}${
              isDestination ? ' kp-node-legal' : ''
            }`}
            style={{
              position: 'absolute',
              left: `${((pos.x - minX) / width) * 100}%`,
              top: `${((pos.y - minY) / height) * 100}%`,
            }}
            aria-label={facilityName ? `${facilityName} Lv${node.level}` : undefined}
            onClick={() => {
              if (isDestination) onSelectDestination(node.id);
              else if (isHutTarget) onSelectHut(node.id);
              else if (piece && piece.owner === 'player') onSelectPiece(piece);
            }}
          >
            {building && (
              <img className={`kp-building${piece ? ' kp-building-under' : ''}`} src={sprite(building)} alt="" draggable={false} />
            )}
            {facilityName && <span className="kp-node-level">Lv{node.level}</span>}
            {piece && (
              <div
                className={`kp-piece kp-piece-${piece.owner}${piece.isKing ? ' kp-piece-king' : ''}${
                  piece.id === selectedPieceId ? ' kp-piece-selected' : ''
                }${piece.snared > 0 ? ' kp-piece-snared' : ''}`}
                aria-label={`${piece.owner === 'player' ? '自分' : '相手'}の${piece.isKing ? '王' : `兵 Lv${piece.level}`}`}
              >
                <img
                  className="kp-piece-img"
                  src={sprite(`${piece.isKing ? 'king' : 'soldier'}-${piece.owner}`)}
                  alt=""
                  draggable={false}
                />
                {!piece.isKing && <span className="kp-piece-level">{piece.level}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
