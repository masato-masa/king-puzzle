import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { computeLayout, fitLayout } from './layout';
import { resolveTrackingTarget } from '@/engine/attacks';
import type { AttackType, BoardNode, GameState, Piece } from '@/engine/types';

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

const ATTACK_SHORT: Record<AttackType, string> = {
  arrow: '弓',
  cannon: '砲',
  snare: '罠',
  blockade: '封',
};

interface AttackMark {
  id: string;
  label: string;
  /** 1 なら、このターンの終わりに飛んでくる。 */
  remaining: number;
}

/** 攻撃がいまどのノードを狙っているか。追尾型はその時点の対象を出す（動けば印も動く）。 */
function attackMarks(state: GameState): Record<string, AttackMark[]> {
  const marks: Record<string, AttackMark[]> = {};
  state.attacks.forEach((attack, i) => {
    const nodeId =
      attack.target.kind === 'node' ? attack.target.nodeId : resolveTrackingTarget(state, attack.target.rule);
    if (!nodeId) return;
    (marks[nodeId] ??= []).push({
      id: attack.id,
      label: ATTACK_SHORT[attack.type],
      remaining: state.attackStates[i].remaining,
    });
  });
  return marks;
}

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
  // 盤を置ける枠の大きさを測り、その中に収まる向きと倍率を決める（layout.ts の fitLayout）。
  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setBox({ width: frame.clientWidth, height: frame.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    measure();
    return () => ro.disconnect();
  }, []);

  const fitted = fitLayout(computeLayout(state.board, rootId), box.width, box.height);
  const { positions, minX, minY, width, height, scale } = fitted;

  const pieceAt = (nodeId: string): Piece | undefined => state.pieces.find((p) => p.nodeId === nodeId);
  const marks = attackMarks(state);
  const { ghosts, fx } = usePieceEffects(state.pieces);

  return (
    <div ref={frameRef} className="kp-board-frame">
    <div
      className="kp-board"
      style={{ width: width * scale, height: height * scale, ['--s' as string]: scale }}
    >
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
        const blocked = (state.blockades[node.id] ?? 0) > 0;
        return (
          <div
            key={node.id}
            className={`kp-node kp-node-${node.type}${node.hutOwner ? ` kp-hut-${node.hutOwner}` : ''}${
              isDestination ? ' kp-node-legal' : ''
            }${blocked ? ' kp-node-blocked' : ''}`}
            style={{
              position: 'absolute',
              left: (pos.x - minX) * scale,
              top: (pos.y - minY) * scale,
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
            {marks[node.id] && (
              <div className="kp-attack-marks">
                {marks[node.id].map((m) => (
                  <span
                    key={m.id}
                    className={`kp-attack-mark${m.remaining <= 1 ? ' kp-attack-mark-soon' : ''}`}
                    aria-label={`${m.label} あと${m.remaining}`}
                  >
                    {m.label}
                    {m.remaining}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {/* 枠を測る前に置くと、倍率 0 の位置から滑って飛んでくる。測ってから置く。 */}
      {box.width > 0 &&
        [...state.pieces.map((p) => ({ piece: p, gone: false })), ...ghosts.map((p) => ({ piece: p, gone: true }))].map(
        ({ piece, gone }) => {
          const pos = positions[piece.nodeId];
          const effect = gone ? ' kp-piece-gone' : fx[piece.id] ? ` kp-piece-${fx[piece.id]}` : '';
          return (
            <div
              key={gone ? `${piece.id}-gone` : piece.id}
              className={`kp-piece kp-piece-${piece.owner}${piece.isKing ? ' kp-piece-king' : ''}${
                piece.id === selectedPieceId ? ' kp-piece-selected' : ''
              }${piece.snared > 0 ? ' kp-piece-snared' : ''}${effect}`}
              style={{ left: (pos.x - minX) * scale, top: (pos.y - minY) * scale }}
              aria-label={`${piece.owner === 'player' ? '自分' : '相手'}の${piece.isKing ? '王' : '兵'} Lv${piece.level}`}
            >
              <img
                className="kp-piece-img"
                src={sprite(`${piece.isKing ? 'king' : 'soldier'}-${piece.owner}`)}
                alt=""
                draggable={false}
              />
              <span className="kp-piece-level">{piece.level}</span>
            </div>
          );
        },
        )}
    </div>
    </div>
  );
}

const FX_MS = 520;

/**
 * 駒の出入りとレベルの上下を拾って、短い演出の印を付ける（C2 手応え・C3 失敗の納得）。
 * 消えた駒は少しのあいだ「消える演出」用に残す。
 */
function usePieceEffects(pieces: Piece[]) {
  const prev = useRef<Map<string, Piece>>(new Map(pieces.map((p) => [p.id, p])));
  const [ghosts, setGhosts] = useState<Piece[]>([]);
  const [fx, setFx] = useState<Record<string, 'up' | 'down' | 'new'>>({});

  useEffect(() => {
    const now = new Map(pieces.map((p) => [p.id, p]));
    const gone = [...prev.current.values()].filter((p) => !now.has(p.id));
    const changes: Record<string, 'up' | 'down' | 'new'> = {};
    for (const p of pieces) {
      const before = prev.current.get(p.id);
      if (!before) changes[p.id] = 'new';
      else if (p.level > before.level) changes[p.id] = 'up';
      else if (p.level < before.level) changes[p.id] = 'down';
    }
    prev.current = now;
    if (gone.length === 0 && Object.keys(changes).length === 0) return;
    // 自分の駒が倒された・削られたときだけ、指に短く返す。
    const hurt = gone.some((p) => p.owner === 'player') || Object.entries(changes).some(([, c]) => c === 'down');
    if (hurt) navigator.vibrate?.(40);
    setGhosts(gone);
    setFx(changes);
    const timer = window.setTimeout(() => {
      setGhosts([]);
      setFx({});
    }, FX_MS);
    return () => window.clearTimeout(timer);
  }, [pieces]);

  return { ghosts, fx };
}
