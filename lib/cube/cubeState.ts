// Cube state utilities for converting scrambles to facelet states
// Based on cstimer's image.js implementation

// Face indices (matching cstimer's order)
// D=0, L=1, B=2, U=3, R=4, F=5
export const FACES = ['D', 'L', 'B', 'U', 'R', 'F'] as const;
export type Face = typeof FACES[number];

// Standard cube colors (WCA color scheme)
export const FACE_COLORS: Record<number, string> = {
  0: '#ffff00', // D - Yellow
  1: '#ffa500', // L - Orange
  2: '#0000ff', // B - Blue
  3: '#ffffff', // U - White
  4: '#ff0000', // R - Red
  5: '#00ff00', // F - Green
};

// Move to face index mapping
const MOVE_TO_FACE: Record<string, number> = {
  'D': 0,
  'L': 1,
  'B': 2,
  'U': 3,
  'R': 4,
  'F': 5,
};

// Parse a scramble string into move instructions
// Returns array of [faceIndex, depth, quarterTurns]
export function parseScramble(scramble: string): [number, number, number][] {
  if (!scramble.trim()) return [];

  const moves = scramble.trim().split(/\s+/);
  const result: [number, number, number][] = [];

  for (const move of moves) {
    if (!move) continue;

    // Extract face, modifier
    const faceChar = move[0].toUpperCase();
    const faceIndex = MOVE_TO_FACE[faceChar];

    if (faceIndex === undefined) continue;

    // Determine quarter turns from modifier
    let quarterTurns = 1;
    if (move.includes("'")) {
      quarterTurns = 3; // Counter-clockwise = 3 clockwise quarter turns
    } else if (move.includes('2')) {
      quarterTurns = 2;
    }

    // Depth (1 for normal moves, could extend for wide moves)
    const depth = 1;

    result.push([faceIndex, depth, quarterTurns]);
  }

  return result;
}

// Initialize a solved cube state
// Returns array of 54 integers (6 faces x 9 facelets)
// Each value 0-5 represents which face color is at that position
export function createSolvedState(): number[] {
  const state: number[] = [];
  for (let face = 0; face < 6; face++) {
    for (let i = 0; i < 9; i++) {
      state.push(face);
    }
  }
  return state;
}

// Apply a single slice move to the cube state
// f = face index (0-5), d = depth (0 for face turn), q = quarter turns
function applyMove(state: number[], f: number, q: number): void {
  const size = 3;
  const s2 = size * size; // 9

  for (let k = 0; k < q; k++) {
    // Rotate the face itself
    const faceStart = f * s2;
    const temp = [
      state[faceStart], state[faceStart + 1], state[faceStart + 2],
      state[faceStart + 3], state[faceStart + 4], state[faceStart + 5],
      state[faceStart + 6], state[faceStart + 7], state[faceStart + 8],
    ];

    // Rotate face 90 degrees clockwise
    state[faceStart + 0] = temp[6];
    state[faceStart + 1] = temp[3];
    state[faceStart + 2] = temp[0];
    state[faceStart + 3] = temp[7];
    state[faceStart + 4] = temp[4];
    state[faceStart + 5] = temp[1];
    state[faceStart + 6] = temp[8];
    state[faceStart + 7] = temp[5];
    state[faceStart + 8] = temp[2];

    // Rotate the adjacent edges
    // Face order: D=0, L=1, B=2, U=3, R=4, F=5
    let edges: number[][];

    switch (f) {
      case 0: // D
        edges = [
          [5 * s2 + 6, 5 * s2 + 7, 5 * s2 + 8], // F bottom
          [4 * s2 + 6, 4 * s2 + 7, 4 * s2 + 8], // R bottom
          [2 * s2 + 6, 2 * s2 + 7, 2 * s2 + 8], // B bottom
          [1 * s2 + 6, 1 * s2 + 7, 1 * s2 + 8], // L bottom
        ];
        break;
      case 1: // L
        edges = [
          [3 * s2 + 0, 3 * s2 + 3, 3 * s2 + 6], // U left
          [5 * s2 + 0, 5 * s2 + 3, 5 * s2 + 6], // F left
          [0 * s2 + 0, 0 * s2 + 3, 0 * s2 + 6], // D left
          [2 * s2 + 8, 2 * s2 + 5, 2 * s2 + 2], // B right (reversed)
        ];
        break;
      case 2: // B
        edges = [
          [3 * s2 + 2, 3 * s2 + 1, 3 * s2 + 0], // U top (reversed)
          [1 * s2 + 0, 1 * s2 + 3, 1 * s2 + 6], // L left
          [0 * s2 + 6, 0 * s2 + 7, 0 * s2 + 8], // D bottom
          [4 * s2 + 8, 4 * s2 + 5, 4 * s2 + 2], // R right (reversed)
        ];
        break;
      case 3: // U
        edges = [
          [2 * s2 + 2, 2 * s2 + 1, 2 * s2 + 0], // B top (reversed)
          [4 * s2 + 0, 4 * s2 + 1, 4 * s2 + 2], // R top
          [5 * s2 + 0, 5 * s2 + 1, 5 * s2 + 2], // F top
          [1 * s2 + 0, 1 * s2 + 1, 1 * s2 + 2], // L top
        ];
        break;
      case 4: // R
        edges = [
          [3 * s2 + 8, 3 * s2 + 5, 3 * s2 + 2], // U right (reversed)
          [2 * s2 + 0, 2 * s2 + 3, 2 * s2 + 6], // B left
          [0 * s2 + 8, 0 * s2 + 5, 0 * s2 + 2], // D right (reversed)
          [5 * s2 + 8, 5 * s2 + 5, 5 * s2 + 2], // F right (reversed)
        ];
        break;
      case 5: // F
        edges = [
          [3 * s2 + 6, 3 * s2 + 7, 3 * s2 + 8], // U bottom
          [4 * s2 + 0, 4 * s2 + 3, 4 * s2 + 6], // R left
          [0 * s2 + 2, 0 * s2 + 1, 0 * s2 + 0], // D top (reversed)
          [1 * s2 + 8, 1 * s2 + 5, 1 * s2 + 2], // L right (reversed)
        ];
        break;
      default:
        return;
    }

    // Cycle the edge pieces clockwise
    const tempEdge = [state[edges[3][0]], state[edges[3][1]], state[edges[3][2]]];
    for (let i = 3; i > 0; i--) {
      state[edges[i][0]] = state[edges[i - 1][0]];
      state[edges[i][1]] = state[edges[i - 1][1]];
      state[edges[i][2]] = state[edges[i - 1][2]];
    }
    state[edges[0][0]] = tempEdge[0];
    state[edges[0][1]] = tempEdge[1];
    state[edges[0][2]] = tempEdge[2];
  }
}

// Apply a scramble to a solved cube and return the resulting state
export function applyScramble(scramble: string): number[] {
  const state = createSolvedState();
  const moves = parseScramble(scramble);

  for (const [faceIndex, , quarterTurns] of moves) {
    applyMove(state, faceIndex, quarterTurns);
  }

  return state;
}

// Get the color at a specific position
export function getColorAt(state: number[], faceIndex: number, row: number, col: number): string {
  const index = faceIndex * 9 + row * 3 + col;
  return FACE_COLORS[state[index]];
}
