// ------------------------------------ CONSTANTS AND ENUMS ------------------------------------
export const TRANSITION_HALF_LIFE = 750;

export const PieceType = {
  QUEEN: "Queen",
  ROOK: "Rook",
  BISHOP: "Bishop",
  KNIGHT: "Knight",
  PAWN_N: "PawnN",
  PAWN_E: "PawnE",
  PAWN_W: "PawnW",
  PAWN_S: "PawnS",
};
export const BlackPieceType = {
  BLACK_PAWN: "BlackPawn",
  BLACK_ROOK: "BlackRook",
  BLACK_BISHOP: "BlackBishop",
  BLACK_QUEEN: "BlackQueen",
};
export const PageName = {
  MAIN_MENU: 0,
  GAME: 1,
  HOW_TO_PLAY: 2,
  OPTIONS: 3,
  CREDITS: 4,
};
export const Difficulty = {
  EASY: 0,
  NORMAL: 1,
  HARD: 2,
};

Object.freeze(PieceType);
Object.freeze(BlackPieceType);
Object.freeze(PageName);
Object.freeze(Difficulty);

// ------------------------------------ MATH UTILITIES ------------------------------------
export function getDistance(v1, v2) {
  assertIsVector(v1);
  assertIsVector(v2);
  return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
}

export function getVectorSum(v1, v2) {
  assertIsVector(v1);
  assertIsVector(v2);
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function isEven(number) {
  assert(
    !isNaN(number),
    "Trying to check the evenness of a number but isn't a number!"
  );
  return number % 2 === 0;
}

export function arrayHasVector(array, vector) {
  assertIsVector(vector);
  return array.some((item) => item.x === vector.x && item.y === vector.y);
}

export function removeVectorInArray(array, vector) {
  assertIsVector(vector);
  return array.filter((item) => {
    return item.x !== vector.x || item.y !== vector.y;
  });
}

// ------------------------------------ DEBUGGING UTILITIES ------------------------------------
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// --- THIS FUNCTION HAS BEEN CORRECTED ---
export function assertIsVector(vector) {
  assert(
    vector && vector.hasOwnProperty("x") && vector.hasOwnProperty("y"),
    `Vector assertion failed: ${vector}`
  );
}

export function extractOccupiedCells(matrix) {
  const output = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (matrix[y][x] !== false) {
        output.push({ x, y });
      }
    }
  }
  return output;
}

// ------------------------------------ TIMING UTILITIES ------------------------------------
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}