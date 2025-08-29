import {
  PieceType,
  BlackPieceType,
  assert, 
  assertIsVector,
  arrayHasVector,
  removeVectorInArray,
} from "../../../global/utils";

import { isValidCell } from "./grid";

// export const BlackPieceType = {
//   BLACK_PAWN: "BlackPawn",
//   BLACK_ROOK: "BlackRook",
//   BLACK_BISHOP: "BlackBishop",
//   BLACK_QUEEN: "BlackQueen",
// };
export const PawnTypes = [
  PieceType.PAWN_N,
  PieceType.PAWN_E,
  PieceType.PAWN_W,
  PieceType.PAWN_S,
  BlackPieceType.BLACK_PAWN,
];
export const OfficerTypes = [
  PieceType.QUEEN,
  PieceType.ROOK,
  PieceType.BISHOP,
  PieceType.KNIGHT,
  BlackPieceType.BLACK_QUEEN,
  BlackPieceType.BLACK_ROOK,
  BlackPieceType.BLACK_BISHOP,
];
export const PieceCooldown = {
  // [PieceType.PLAYER]: null,
  [BlackPieceType.BLACK_PAWN]: null,
  [BlackPieceType.BLACK_ROOK]: null,
  [BlackPieceType.BLACK_BISHOP]: null,
  [BlackPieceType.BLACK_QUEEN]: null,
  [PieceType.QUEEN]: 5,
  [PieceType.ROOK]: 4,
  [PieceType.BISHOP]: 4,
  [PieceType.KNIGHT]: 3,
  [PieceType.PAWN_N]: 2,
  [PieceType.PAWN_E]: 2,
  [PieceType.PAWN_W]: 2,
  [PieceType.PAWN_S]: 2,
};

// --- Helper Functions moved to top for clarity and safety ---

function getPlusDirectionMovement(pos, playerPos, occupied) {
  const moves = [];
  const directions = [
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
  ];
  for (const dir of directions) {
    const targetPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    if (isValidCell(targetPos) && !arrayHasVector(occupied, targetPos)) {
      moves.push(targetPos);
    }
  }
  return moves;
}

function getPlusDirectionCaptures(pos, playerPos, occupied) {
  const captures = [];
  const directions = [
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
  ];
  for (const dir of directions) {
    const targetPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    if (isValidCell(targetPos) && arrayHasVector(occupied, targetPos)) {
      captures.push(targetPos);
    }
  }
  return captures;
}

function getMoveCellsByOffset(piecePos, playerPos, obs, offsets) {
  assertIsVector(piecePos);
  assertIsVector(playerPos);
  const obstacles = removeVectorInArray(obs, playerPos);
  const { x: origX, y: origY } = piecePos;
  const output = [];
  offsets.forEach((offset) => {
    assertIsVector(offset);
    const move = { x: origX + offset.x, y: origY + offset.y };
    if (isValidCell(move) && !arrayHasVector(obstacles, move)) {
      output.push(move);
    }
  });
  return output;
}

function getMoveCellsByDirection(piecePos, dirX, dirY, playerPos, obs) {
  assertIsVector(piecePos);
  assertIsVector(playerPos);
  const obstacles = removeVectorInArray(obs, playerPos);
  const { x: origX, y: origY } = piecePos;
  const output = [];
  const currCell = { x: origX + dirX, y: origY + dirY };
  while (isValidCell(currCell) && !arrayHasVector(obstacles, currCell)) {
    output.push({ ...currCell });
    currCell.x += dirX;
    currCell.y += dirY;
  }
  return output;
}

function getCaptureCellsByOffset(piecePos, playerPos, obs, offsets) {
  assertIsVector(piecePos);
  assertIsVector(playerPos);
  const { x: origX, y: origY } = piecePos;
  const output = [];
  offsets.forEach((offset) => {
    assertIsVector(offset);
    const move = { x: origX + offset.x, y: origY + offset.y };
    if (isValidCell(move)) {
      output.push(move);
    }
  });
  return output;
}

function getCaptureCellsByDirection(piecePos, dirX, dirY, playerPos, obs) {
  assertIsVector(piecePos);
  assertIsVector(playerPos);
  const obstacles = removeVectorInArray(obs, playerPos);
  const { x: origX, y: origY } = piecePos;
  const output = [];
  const currCell = { x: origX + dirX, y: origY + dirY };
  while (isValidCell(currCell)) {
    output.push({ ...currCell });
    if (arrayHasVector(obstacles, currCell)) {
      break;
    }
    currCell.x += dirX;
    currCell.y += dirY;
  }
  return output;
}

// --- Main Exported Objects ---

export const PieceMovementFunc = {
  [BlackPieceType.BLACK_PAWN]: getPlusDirectionMovement,
  [BlackPieceType.BLACK_ROOK]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, -1, playerPos, occupied)
    ),
  [BlackPieceType.BLACK_BISHOP]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [BlackPieceType.BLACK_QUEEN]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.QUEEN]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.ROOK]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 0, playerPos, occupied),
      getMoveCellsByDirection(pos, 0, -1, playerPos, occupied)
    ),
  [PieceType.BISHOP]: (pos, playerPos, occupied) =>
    [].concat(
      getMoveCellsByDirection(pos, 1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, 1, playerPos, occupied),
      getMoveCellsByDirection(pos, -1, -1, playerPos, occupied),
      getMoveCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.KNIGHT]: (pos, playerPos, occupied) =>
    getMoveCellsByOffset(pos, playerPos, occupied, [
      { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
      { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 },
    ]),
  [PieceType.PAWN_N]: (pos, playerPos, occupied) =>
    getMoveCellsByOffset(pos, playerPos, occupied, [{ x: 0, y: -1 }]),
  [PieceType.PAWN_E]: (pos, playerPos, occupied) =>
    getMoveCellsByOffset(pos, playerPos, occupied, [{ x: 1, y: 0 }]),
  [PieceType.PAWN_W]: (pos, playerPos, occupied) =>
    getMoveCellsByOffset(pos, playerPos, occupied, [{ x: -1, y: 0 }]),
  [PieceType.PAWN_S]: (pos, playerPos, occupied) =>
    getMoveCellsByOffset(pos, playerPos, occupied, [{ x: 0, y: 1 }]),
};

export const PieceCaptureFunc = {
  [BlackPieceType.BLACK_PAWN]: getPlusDirectionCaptures,
  [BlackPieceType.BLACK_ROOK]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, -1, playerPos, occupied)
    ),
  [BlackPieceType.BLACK_BISHOP]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [BlackPieceType.BLACK_QUEEN]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.QUEEN]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.ROOK]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 0, playerPos, occupied),
      getCaptureCellsByDirection(pos, 0, -1, playerPos, occupied)
    ),
  [PieceType.BISHOP]: (pos, playerPos, occupied) =>
    [].concat(
      getCaptureCellsByDirection(pos, 1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, 1, playerPos, occupied),
      getCaptureCellsByDirection(pos, -1, -1, playerPos, occupied),
      getCaptureCellsByDirection(pos, 1, -1, playerPos, occupied)
    ),
  [PieceType.KNIGHT]: (pos, playerPos, occupied) =>
    getCaptureCellsByOffset(pos, playerPos, occupied, [
      { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
      { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 },
    ]),
  [PieceType.PAWN_N]: (pos, playerPos, occupied) =>
    getCaptureCellsByOffset(pos, playerPos, occupied, [
      { x: -1, y: -1 }, { x: 1, y: -1 },
    ]),
  [PieceType.PAWN_E]: (pos, playerPos, occupied) =>
    getCaptureCellsByOffset(pos, playerPos, occupied, [
      { x: 1, y: -1 }, { x: 1, y: 1 },
    ]),
  [PieceType.PAWN_W]: (pos, playerPos, occupied) =>
    getCaptureCellsByOffset(pos, playerPos, occupied, [
      { x: -1, y: -1 }, { x: -1, y: 1 },
    ]),
  [PieceType.PAWN_S]: (pos, playerPos, occupied) =>
    getCaptureCellsByOffset(pos, playerPos, occupied, [
      { x: -1, y: 1 }, { x: 1, y: 1 },
    ]),
};