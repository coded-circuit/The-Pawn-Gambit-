import {
  Difficulty,
  PieceType,
  assert,
  assertIsVector,
} from "../../../global/utils";
import { isValidCell } from "./grid";

// --- NEW: A robust, readable probability table ---
// This structure is safe because it uses the PieceType enum directly.
// In src/features/game/logic/spawning.js

const weightedPieceProbabilities = {
  [Difficulty.EASY]: [
    { type: PieceType.QUEEN, weight: 0.03 },
    { type: PieceType.ROOK, weight: 0.07 },
    { type: PieceType.BISHOP, weight: 0.1 },
    { type: PieceType.KNIGHT, weight: 0.2 },
    { type: PieceType.PAWN_N, weight: 0.6 },
  ],
  [Difficulty.NORMAL]: [
    { type: PieceType.QUEEN, weight: 0.08 },
    { type: PieceType.ROOK, weight: 0.12 },
    { type: PieceType.BISHOP, weight: 0.15 },
    { type: PieceType.KNIGHT, weight: 0.25 },
    { type: PieceType.PAWN_N, weight: 0.4 },
  ],
  // --- HARD LEVEL UPDATED ---
  [Difficulty.HARD]: [
    { type: PieceType.QUEEN, weight: 0.225 }, // Increased from 0.15
    { type: PieceType.ROOK, weight: 0.15 },
    { type: PieceType.BISHOP, weight: 0.2 },
    { type: PieceType.KNIGHT, weight: 0.325 }, // Increased from 0.25
    { type: PieceType.PAWN_N, weight: 0.1 },  // Decreased from 0.25
  ],
};

const edgeToPawns = [
  PieceType.PAWN_S, // Edge 0 (Top)
  PieceType.PAWN_W, // Edge 1 (Right)
  PieceType.PAWN_E, // Edge 2 (Left)
  PieceType.PAWN_N, // Edge 3 (Bottom)
];

Object.freeze(edgeToPawns);

export function getNumberToSpawn(difficulty) {
  const rand = Math.random();
  switch (difficulty) {
    case Difficulty.EASY:
      if (rand < 0.3) return 1;
      return 0;
    case Difficulty.NORMAL:
      if (rand < 0.1) return 2;
      if (rand < 0.5) return 1;
      return 0;
    case Difficulty.HARD:
      if (rand < 0.2) return 2;
      if (rand < 0.5) return 1;
      return 0;
    default:
      assert(false, "Invalid difficulty in getNumberToSpawn!", difficulty);
  }
}

export function getPieceWithPos(difficulty) {
  const { edge, randomPoint: pos } = pickSpawnPoint();
  const type = choosePieceToSpawn(difficulty);

  assertIsVector(pos);

  // If the randomly chosen piece is any pawn, override it with
  // the correct pawn type for the edge it's spawning on.
  if (type.startsWith("Pawn")) {
    return { type: edgeToPawns[edge], pos };
  }
  return { type, pos };
}

function pickSpawnPoint() {
  const getRandomLane = () => Math.floor(Math.random() * 8);
  const edge = Math.floor(Math.random() * 4);
  let randomPoint = {};

  switch (edge) {
    case 0: randomPoint = { x: getRandomLane(), y: 0 }; break;
    case 1: randomPoint = { x: 7, y: getRandomLane() }; break;
    case 2: randomPoint = { x: 0, y: getRandomLane() }; break;
    case 3: randomPoint = { x: getRandomLane(), y: 7 }; break;
    default: assert(false, "Invalid edge!");
  }
  assert(isValidCell(randomPoint), "Invalid spawn point chosen!");
  return { edge, randomPoint };
}

// --- REWRITTEN: This function now uses the weighted table ---
function choosePieceToSpawn(difficulty) {
  const probabilities = weightedPieceProbabilities[difficulty];
  const rand = Math.random();
  let cumulativeWeight = 0;

  for (const piece of probabilities) {
    cumulativeWeight += piece.weight;
    if (rand < cumulativeWeight) {
      return piece.type;
    }
  }

  // Fallback in case of rounding errors, return the last piece type
  return probabilities[probabilities.length - 1].type;
}