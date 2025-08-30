import {
  Difficulty,
  PieceType,
  assert,
  assertIsVector,
} from "../../../global/utils";
import { isValidCell } from "./grid";


const weightedPieceProbabilities = {
  [Difficulty.EASY]: [
    { type: PieceType.QUEEN, weight: 0.03 },
    { type: PieceType.ROOK, weight: 0.07 },
    { type: PieceType.BISHOP, weight: 0.1 },
    { type: PieceType.KNIGHT, weight: 0.2 },
    { type: PieceType.PAWN_N, weight: 0.15 },
    { type: PieceType.PAWN_S, weight: 0.15 },
    { type: PieceType.PAWN_E, weight: 0.15 },
    { type: PieceType.PAWN_W, weight: 0.15 },
  ],
  [Difficulty.NORMAL]: [
    { type: PieceType.QUEEN, weight: 0.08 },
    { type: PieceType.ROOK, weight: 0.12},
    { type: PieceType.BISHOP, weight: 0.15 },
    { type: PieceType.KNIGHT, weight: 0.25 },
    { type: PieceType.PAWN_N, weight: 0.1 },
    { type: PieceType.PAWN_S, weight: 0.1 },
    { type: PieceType.PAWN_E, weight: 0.1 },
    { type: PieceType.PAWN_W, weight: 0.1 },
  ],
  [Difficulty.HARD]: [
    { type: PieceType.QUEEN, weight: 0.15 },
    { type: PieceType.ROOK, weight: 0.15 },
    { type: PieceType.BISHOP, weight: 0.2 },
    { type: PieceType.KNIGHT, weight: 0.25 }, 
    { type: PieceType.PAWN_N, weight: 0.0625 },
    { type: PieceType.PAWN_S, weight: 0.0625 },
    { type: PieceType.PAWN_E, weight: 0.0625 },
    { type: PieceType.PAWN_W, weight: 0.0625 },  
  ],
  [Difficulty.INSANE]: [ 
    { type: PieceType.QUEEN, weight: 0.15 },
    { type: PieceType.ROOK, weight: 0.15 },
    { type: PieceType.BISHOP, weight: 0.2 },
    { type: PieceType.KNIGHT, weight: 0.25 },
    { type: PieceType.PAWN_N, weight: 0.0625 },
    { type: PieceType.PAWN_S, weight: 0.0625 },
    { type: PieceType.PAWN_E, weight: 0.0625 },
    { type: PieceType.PAWN_W, weight: 0.0625 },
  ],
  [Difficulty.DUOS]: [ 
    { type: PieceType.QUEEN, weight: 0.15 },
    { type: PieceType.ROOK, weight: 0.15 },
    { type: PieceType.BISHOP, weight: 0.2 },
    { type: PieceType.KNIGHT, weight: 0.25 }, 
    { type: PieceType.PAWN_N, weight: 0.0625 },
    { type: PieceType.PAWN_S, weight: 0.0625 },
    { type: PieceType.PAWN_E, weight: 0.0625 },
    { type: PieceType.PAWN_W, weight: 0.0625 },  
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
    case Difficulty.INSANE:
      // Increased frequency: 60% chance for 2 pieces, 40% for 1.
      if (rand < 0.6) return 2;
      return 1;
    case Difficulty.DUOS:
      // Increased frequency: 60% chance for 2 pieces, 40% for 1.
      if (rand < 0.6) return 2;
      return 1;
    default:
      assert(false, "Invalid difficulty in getNumberToSpawn!", difficulty);
  }
}

export function getPieceWithPos(difficulty, gridSize) {
  const { edge, randomPoint: pos } = pickSpawnPoint(gridSize);
  const type = choosePieceToSpawn(difficulty);
  assertIsVector(pos);
  if (type.startsWith("Pawn")) {
    return { type: edgeToPawns[edge], pos };
  }
  return { type, pos };
}

function pickSpawnPoint(gridSize) {
  const getRandomLane = () => Math.floor(Math.random() * gridSize);
  const edge = Math.floor(Math.random() * 4);
  let randomPoint = {};

  switch (edge) {
    case 0: randomPoint = { x: getRandomLane(), y: 0 }; break;
    case 1: randomPoint = { x: gridSize - 1, y: getRandomLane() }; break;
    case 2: randomPoint = { x: 0, y: getRandomLane() }; break;
    case 3: randomPoint = { x: getRandomLane(), y: gridSize - 1 }; break;
    default: assert(false, "Invalid edge!");
  }
  assert(isValidCell(randomPoint, gridSize), "Invalid spawn point chosen!");
  return { edge, randomPoint };
}

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

  return probabilities[probabilities.length - 1].type;
}