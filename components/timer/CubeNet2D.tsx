'use client';

import { useMemo } from 'react';
import { applyScramble, getColorAt } from '@/lib/cube/cubeState';

interface CubeNet2DProps {
  scramble: string;
}

// T-shaped layout for unwrapped cube net
// Face order: D=0, L=1, B=2, U=3, R=4, F=5
//
// Layout:
//        U U U
//        U U U
//        U U U
//   L L L F F F R R R B B B
//   L L L F F F R R R B B B
//   L L L F F F R R R B B B
//        D D D
//        D D D
//        D D D

const CELL_SIZE = 10;
const STICKER_GAP = 0.5;  // Gap between stickers within a face
const FACE_GAP = 3;       // Gap between faces

// Calculate face size (3 stickers + 2 inner gaps)
const FACE_SIZE = 3 * CELL_SIZE + 2 * STICKER_GAP;

// Face positions in the T-shape layout (grid units)
const FACE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 1, y: 2 }, // D - bottom center
  1: { x: 0, y: 1 }, // L - left middle
  2: { x: 3, y: 1 }, // B - right end
  3: { x: 1, y: 0 }, // U - top center
  4: { x: 2, y: 1 }, // R - right of center
  5: { x: 1, y: 1 }, // F - center
};

export default function CubeNet2D({ scramble }: CubeNet2DProps) {
  const cubeState = useMemo(() => applyScramble(scramble), [scramble]);

  // Calculate SVG dimensions (4 faces wide, 3 faces tall + gaps between)
  const width = 4 * FACE_SIZE + 5 * FACE_GAP;
  const height = 3 * FACE_SIZE + 4 * FACE_GAP;

  // Render a single face
  const renderFace = (faceIndex: number) => {
    const pos = FACE_POSITIONS[faceIndex];
    const offsetX = FACE_GAP + pos.x * (FACE_SIZE + FACE_GAP);
    const offsetY = FACE_GAP + pos.y * (FACE_SIZE + FACE_GAP);

    const cells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = offsetX + col * (CELL_SIZE + STICKER_GAP);
        const y = offsetY + row * (CELL_SIZE + STICKER_GAP);
        const color = getColorAt(cubeState, faceIndex, row, col);

        cells.push(
          <rect
            key={`${faceIndex}-${row}-${col}`}
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={color}
            stroke="#333"
            strokeWidth="0.5"
          />
        );
      }
    }
    return cells;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Background */}
      <rect x="0" y="0" width={width} height={height} fill="transparent" />

      {/* Render all 6 faces */}
      {[0, 1, 2, 3, 4, 5].map((faceIndex) => renderFace(faceIndex))}
    </svg>
  );
}
