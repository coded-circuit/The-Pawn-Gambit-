import {
  Difficulty,
  PieceType,
  BlackPieceType,
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
      // 10% for 2, 50% for 1, 40% for 0 => 60% spawn rate
      if (rand < 0.10) return 2;
      if (rand < 0.60) return 1;
      return 0;
    case Difficulty.NORMAL:
      // 20% for 2, 50% for 1, 30% for 0 => 70% spawn rate
      if (rand < 0.20) return 2;
      if (rand < 0.70) return 1;
      return 0;
    case Difficulty.HARD:
      // 25% for 2, 55% for 1, 20% for 0 => 80% spawn rate
      if (rand < 0.25) return 2;
      if (rand < 0.80) return 1;
      return 0;
    case Difficulty.INSANE:
      // Keep aggressive but slightly toned down: 50% => 2, else 1
      if (rand < 0.50) return 2;
      return 1;
    case Difficulty.DUOS:
      // Keep aggressive but slightly toned down: 50% => 2, else 1
      if (rand < 0.50) return 2;
      return 1;
    default:
      assert(false, "Invalid difficulty in getNumberToSpawn!", difficulty);
  }
}

export function getPieceWithPos(difficulty, gridSize, playerPieceType) {
  const { edge, randomPoint: pos } = pickSpawnPoint(gridSize);
  const type = choosePieceToSpawn(difficulty, playerPieceType);
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

function choosePieceToSpawn(difficulty, playerPieceType) {
  const probabilities = weightedPieceProbabilities[difficulty];
  if (!playerPieceType) {
    // Fallback to base table if no player piece context
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

  const tier = getPlayerTier(playerPieceType);
  // Adjust weights then sample by total sum
  const adjusted = probabilities.map(({ type, weight }) => ({
    type,
    weight: weight * weightMultiplierFor(type, tier),
  }));

  const total = adjusted.reduce((s, p) => s + p.weight, 0);
  // Safety: if something goes wrong, fallback to base table
  if (!(total > 0)) {
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

  const r = Math.random() * total;
  let acc = 0;
  for (const p of adjusted) {
    acc += p.weight;
    if (r < acc) return p.type;
  }
  return adjusted[adjusted.length - 1].type;
}

function getPlayerTier(playerPieceType) {
  switch (playerPieceType) {
    case BlackPieceType.BLACK_PAWN: return 0;
    case BlackPieceType.BLACK_KNIGHT: return 1;
    case BlackPieceType.BLACK_ROOK: return 2;
    case BlackPieceType.BLACK_BISHOP: return 3;
    case BlackPieceType.BLACK_QUEEN: return 4;
    default: return 0;
  }
}

function weightMultiplierFor(enemyType, playerTier) {
  // Scales per upgrade tier (0..4)
  const pawnScale   = [1.00, 0.85, 0.70, 0.55, 0.40]; // fewer pawns over time
  const knightScale = [1.00, 1.10, 1.20, 1.30, 1.40];
  const officerScale= [1.00, 1.20, 1.40, 1.60, 1.80]; // rook/bishop
  const queenScale  = [1.00, 1.30, 1.60, 1.90, 2.20];

  if (enemyType.startsWith("Pawn")) return pawnScale[playerTier];
  if (enemyType === PieceType.KNIGHT) return knightScale[playerTier];
  if (enemyType === PieceType.ROOK || enemyType === PieceType.BISHOP) return officerScale[playerTier];
  if (enemyType === PieceType.QUEEN) return queenScale[playerTier];
  return 1.0;
}