// 3x3 Scramble Generator
// Generates random-move scrambles for 3x3 Rubik's cube

const MOVES = ['U', 'D', 'R', 'L', 'F', 'B'] as const;
const MODIFIERS = ['', "'", '2'] as const;

type Move = typeof MOVES[number];
type Modifier = typeof MODIFIERS[number];

// Opposite faces - moves on opposite faces can be adjacent
const OPPOSITE_FACES: Record<Move, Move> = {
  'U': 'D',
  'D': 'U',
  'R': 'L',
  'L': 'R',
  'F': 'B',
  'B': 'F',
};

// Same axis faces - need to avoid redundant sequences like R L R
const SAME_AXIS: Record<Move, Move[]> = {
  'U': ['U', 'D'],
  'D': ['U', 'D'],
  'R': ['R', 'L'],
  'L': ['R', 'L'],
  'F': ['F', 'B'],
  'B': ['F', 'B'],
};

/**
 * Generate a random 3x3 scramble
 * @param length Number of moves (default 20, WCA standard)
 * @returns Scramble string (e.g., "R U R' U' R' F R2 U' R' U' R U R' F'")
 */
export function generateScramble(length: number = 20): string {
  const scramble: string[] = [];
  let lastMove: Move | null = null;
  let secondLastMove: Move | null = null;

  for (let i = 0; i < length; i++) {
    // Get available moves (excluding invalid sequences)
    const availableMoves = MOVES.filter(move => {
      // Can't repeat the same face
      if (move === lastMove) return false;

      // If last two moves are on the same axis (e.g., R L),
      // can't do another move on that axis (would allow R L R simplification)
      if (lastMove && secondLastMove) {
        const lastAxis = SAME_AXIS[lastMove];
        const secondLastAxis = SAME_AXIS[secondLastMove];
        if (lastAxis === secondLastAxis && lastAxis.includes(move)) {
          return false;
        }
      }

      return true;
    });

    // Pick random move and modifier
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];

    scramble.push(move + modifier);

    // Update history
    secondLastMove = lastMove;
    lastMove = move;
  }

  return scramble.join(' ');
}

/**
 * Validate a scramble string
 * @param scramble Scramble string to validate
 * @returns true if valid
 */
export function isValidScramble(scramble: string): boolean {
  if (!scramble || typeof scramble !== 'string') return false;

  const moves = scramble.trim().split(/\s+/);
  if (moves.length === 0) return false;

  const validMovePattern = /^[UDRLBF][2']?$/;
  return moves.every(move => validMovePattern.test(move));
}

/**
 * Parse scramble string to array of moves
 */
export function parseScramble(scramble: string): string[] {
  return scramble.trim().split(/\s+/).filter(m => m.length > 0);
}

/**
 * Get inverse of a scramble (to solve from scrambled state)
 */
export function invertScramble(scramble: string): string {
  const moves = parseScramble(scramble);

  return moves
    .reverse()
    .map(move => {
      const face = move[0];
      const modifier = move.slice(1);

      if (modifier === "'") return face;
      if (modifier === '') return face + "'";
      return move; // '2' stays the same
    })
    .join(' ');
}
