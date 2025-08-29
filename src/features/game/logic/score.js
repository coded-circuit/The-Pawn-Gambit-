import { Difficulty, PieceType,BlackPieceType } from "../../../global/utils";

// Experience Points (XP) Breakdown
const survivalXPMilestones = {
  0: 50,
  50: 100,
  100: 200,
  200: 300,
  300: 500,
};
const pieceCaptureXP = {
  [BlackPieceType.BLACK_PAWN]:null,
  [BlackPieceType.BLACK_ROOK]:null,
  [BlackPieceType.BLACK_QUEEN]:null,
  [BlackPieceType.BLACK_BISHOP]:null,
  [PieceType.QUEEN]: 500,
  [PieceType.ROOK]: 200,
  [PieceType.BISHOP]: 200,
  [PieceType.KNIGHT]: 100,
  [PieceType.PAWN_N]: 100,
  [PieceType.PAWN_E]: 100,
  [PieceType.PAWN_W]: 100,
  [PieceType.PAWN_S]: 100,
};
const timeBonusXP = 1;

// Existing constants for gems and difficulty
const difficultyMultiplier = {
  [Difficulty.EASY]: 1.0,
  [Difficulty.NORMAL]: 1.5,
  [Difficulty.HARD]: 2.0,
};
const survivalGemReward = 1;
const pieceCaptureGemReward = {
  [BlackPieceType.BLACK_PAWN]: null,
  [BlackPieceType.BLACK_BISHOP]: null,
  [BlackPieceType.BLACK_QUEEN]: null,
  [BlackPieceType.BLACK_ROOK]: null,
  [PieceType.QUEEN]: 5,
  [PieceType.ROOK]: 4,
  [PieceType.BISHOP]: 4,
  [PieceType.KNIGHT]: 3,
  [PieceType.PAWN_N]: 3,
  [PieceType.PAWN_E]: 3,
  [PieceType.PAWN_W]: 3,
  [PieceType.PAWN_S]: 3,
};

Object.freeze(survivalXPMilestones);
Object.freeze(pieceCaptureXP);
Object.freeze(timeBonusXP);
Object.freeze(difficultyMultiplier);
Object.freeze(survivalGemReward);
Object.freeze(pieceCaptureGemReward);


export function getPassiveXPIncrease(difficulty, turnNumber) {
  let prevMilestone = 0;
  for (let milestone in survivalXPMilestones) {
    if (turnNumber >= Number(milestone)) {
      prevMilestone = milestone;
      continue;
    }
    return (
      (survivalXPMilestones[prevMilestone]) * difficultyMultiplier[difficulty]
    );
  }
  return (
    (survivalXPMilestones[prevMilestone]) * difficultyMultiplier[difficulty]
  );
}

export function getPieceCaptureXPIncrease(pieceType) {
  return pieceCaptureXP[pieceType];
}

export function getSurvivalGems() {
  return survivalGemReward;
}

export function getPieceCaptureGems(pieceType) {
  return pieceCaptureGemReward[pieceType];
}

export function getPerSecondXPIncrease(difficulty) {
  return timeBonusXP * difficultyMultiplier[difficulty];
}
