import { createSlice, nanoid } from "@reduxjs/toolkit";
import { arrayHasVector, assert, extractOccupiedCells, BlackPieceType } from "../global/utils";
import {
  OfficerTypes,
  PawnTypes,
  PieceCaptureFunc,
  PieceCooldown,
  PieceMovementFunc,
} from "../features/game/logic/piece";
import {
  getPassiveXPIncrease,
  getPieceCaptureGems,
  getPieceCaptureXPIncrease,
  getSurvivalGems,
} from "../features/game/logic/score";
import { getNumberToSpawn, getPieceWithPos } from "../features/game/logic/spawning";

export const playerCaptureCooldown = 6;
const playerSpawnPos = { x: 3, y: 4 };
const initialState = {
  pieces: {},
  player: {
    position: { ...playerSpawnPos },
    type: BlackPieceType.BLACK_PAWN,
    captureCooldownLeft: playerCaptureCooldown,
  },
  movingPieces: {},
  captureCells: [],
  occupiedCellsMatrix: new Array(8).fill(null).map(() => new Array(8).fill(false)),
  queuedForDeletion: [],
  turnNumber: 0,
  xp: 0,
  gems: 0,
  isGameOver: false,
  livesLeft: 4,
  totalXP: 0,
  totalGems: 0,
  totalTurnsSurvived: 0,
  playerPieceType: BlackPieceType.BLACK_PAWN,
};
console.log("Player's position:", initialState.player.position);
initialState.occupiedCellsMatrix[playerSpawnPos.y][playerSpawnPos.x] = "ThePlayer";

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    resetState: () => initialState,

    addXP: (state, action) => { state.xp += action.payload; },

    endGame: (state) => {
      if (!state.isGameOver) {
        state.isGameOver = true;
        state.totalXP = state.xp;
        state.totalGems = state.gems;
        state.totalTurnsSurvived += state.turnNumber;
      }
    },
    
    restartGame: (state) => {
      if (state.livesLeft > 0) {
        const newState = { ...initialState };
        newState.livesLeft = state.livesLeft - 1;
        newState.totalXP = state.xp;
        newState.totalGems = state.gems;
        newState.totalTurnsSurvived = state.totalTurnsSurvived + state.turnNumber;
        newState.xp = state.xp;
        newState.gems = state.gems;
        return newState;
      }
    },

    upgradePlayerPiece: (state) => {
      const currentPiece = state.playerPieceType;
      let nextPiece = null;
      let cost = 0;
      switch (currentPiece) {
        case BlackPieceType.BLACK_PAWN: nextPiece = BlackPieceType.BLACK_ROOK; cost = 10; break;
        case BlackPieceType.BLACK_ROOK: nextPiece = BlackPieceType.BLACK_BISHOP; cost = 20; break;
        case BlackPieceType.BLACK_BISHOP: nextPiece = BlackPieceType.BLACK_QUEEN; cost = 30; break;
        default: return;
      }
      if (state.gems >= cost) {
        state.gems -= cost;
        state.playerPieceType = nextPiece;
        state.player.type = nextPiece;
      }
    },

    movePlayer: {
      reducer(state, action) {
        const { targetPos, isCapturing, difficulty } = action.payload;
        const currentPos = state.player.position;

        if (targetPos.x === currentPos.x && targetPos.y === currentPos.y) {
          state.turnNumber += 1;
          return;
        }

        const occupied = extractOccupiedCells(state.occupiedCellsMatrix);
        const validMoves = PieceMovementFunc[state.playerPieceType](currentPos, currentPos, occupied);
        const validCaptures = PieceCaptureFunc[state.playerPieceType](currentPos, currentPos, occupied);
        
        const isValid = 
          (!isCapturing && arrayHasVector(validMoves, targetPos)) || 
          (isCapturing && arrayHasVector(validCaptures, targetPos));

        if (!isValid) return;

        state.turnNumber += 1;
        state.xp += getPassiveXPIncrease(difficulty, state.turnNumber);
        state.gems += getSurvivalGems();

        if (state.player.captureCooldownLeft > 0) { state.player.captureCooldownLeft -= 1; }

        state.queuedForDeletion.forEach((pieceId) => delete state.pieces[pieceId]);
        state.queuedForDeletion = [];

        if (isCapturing) {
          const capturedPieceId = state.occupiedCellsMatrix[targetPos.y][targetPos.x];
          state.xp += getPieceCaptureXPIncrease(state.pieces[capturedPieceId].type);
          state.gems += getPieceCaptureGems(state.pieces[capturedPieceId].type);
          queueDelete(state, capturedPieceId);
          state.player.captureCooldownLeft = playerCaptureCooldown;
        }

        moveOccupiedCell(state, currentPos, targetPos, "ThePlayer");
        state.player.position = targetPos;
      },
      // This prepare function is essential for creating the action correctly
      prepare(payload) {
        return { payload };
      },
    },

    addPiece: {
      reducer(state, action) {
        const { x, y, type } = action.payload;
        if (state.occupiedCellsMatrix[y][x]) return;
        const { pieceId, newPiece } = createPiece(x, y, type);
        state.pieces[pieceId] = newPiece;
        state.occupiedCellsMatrix[y][x] = pieceId;
      },
      prepare(x, y, type) {
        return { payload: { x, y, type } };
      }
    },
    
    processPieces: (state, action) => {
      // Spawn a few enemies based on difficulty, then let enemies capture the player if possible.
      const difficulty = action?.payload?.difficulty;
      const toSpawn = getNumberToSpawn(difficulty);
      for (let i = 0; i < toSpawn; i += 1) {
        const { type, pos } = getPieceWithPos(difficulty);
        if (!state.occupiedCellsMatrix[pos.y][pos.x]) {
          const { pieceId, newPiece } = createPiece(pos.x, pos.y, type);
          state.pieces[pieceId] = newPiece;
          state.occupiedCellsMatrix[pos.y][pos.x] = pieceId;
        }
      }

      // Enemy capture step: if any enemy can capture the player, move onto the player's square and end the game.
      const occupied = extractOccupiedCells(state.occupiedCellsMatrix);
      const playerPos = state.player.position;
      let playerCaptured = false;
      for (const [pieceId, p] of Object.entries(state.pieces)) {
        if (playerCaptured) break;
        if (p.isCaptured) continue;
        // Handle enemy cooldowns (only for non-player pieces which have numeric cooldowns)
        if (typeof p.cooldown === "number" && p.cooldown > 0) {
          p.cooldown -= 1;
          continue;
        }
        const captures = PieceCaptureFunc[p.type](p.position, playerPos, occupied);
        if (captures.some((c) => c.x === playerPos.x && c.y === playerPos.y)) {
          // Move this piece onto the player's square and end the game
          moveOccupiedCell(state, p.position, playerPos, pieceId);
          p.position = { ...playerPos };
          state.isGameOver = true;
          // reset cooldown after a move
          if (typeof PieceCooldown[p.type] === "number") {
            p.cooldown = PieceCooldown[p.type];
          }
          playerCaptured = true;
        }
      }
    },
    updateCaptureTiles: (state) => {
      // Compute all enemy capture tiles for UI and threat detection
      const occupied = extractOccupiedCells(state.occupiedCellsMatrix);
      const playerPos = state.player.position;
      const captures = [];
      Object.values(state.pieces).forEach((p) => {
        if (p.isCaptured) return;
        const caps = PieceCaptureFunc[p.type](p.position, playerPos, occupied);
        captures.push(...caps);
      });
      // Deduplicate
      const seen = new Set();
      state.captureCells = captures.filter((c) => {
        const key = `${c.x},${c.y}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Also end the game if player is standing on a threatened tile (parity with earlier behavior)
      if (state.captureCells.some((c) => c.x === playerPos.x && c.y === playerPos.y)) {
        state.isGameOver = true;
      }
    },
  },
  
});

export const {
  resetState, addXP, endGame, restartGame, upgradePlayerPiece,
  movePlayer, addPiece, processPieces, updateCaptureTiles,
} = gameSlice.actions;

export const selectAllPieces = (state) => state.game.pieces;
export const selectOccupiedCellsMatrix = (state) => state.game.occupiedCellsMatrix;
export const selectCaptureCells = (state) => state.game.captureCells;
export const selectPlayerPosition = (state) => state.game.player.position;
export const selectPlayerCaptureCooldown = (state) => state.game.player.captureCooldownLeft;
export const selectTurnNumber = (state) => state.game.turnNumber;
export const selectXP = (state) => state.game.xp;
export const selectGems = (state) => state.game.gems;
export const selectIsGameOver = (state) => state.game.isGameOver;
export const selectLivesLeft = (state) => state.game.livesLeft;
export const selectTotalXP = (state) => state.game.totalXP;
export const selectTotalGems = (state) => state.game.totalGems;
export const selectTotalTurnsSurvived = (state) => state.game.totalTurnsSurvived;
export const selectPlayerPieceType = (state) => state.game.playerPieceType;

export default gameSlice.reducer;

function moveOccupiedCell(state, v1, v2, pieceId) {
  if (!v1 || !v2 || (v1.x === v2.x && v1.y === v2.y)) return;
  state.occupiedCellsMatrix[v1.y][v1.x] = false;
  state.occupiedCellsMatrix[v2.y][v2.x] = pieceId;
}
function createPiece(x, y, type) {
  const pieceId = nanoid();
  return {
    pieceId,
    newPiece: {
      position: { x, y }, type, cooldown: PieceCooldown[type],
      isCaptured: false, movesMade: 0,
    },
  };
}
function queueDelete(state, pieceId) {
  if (!state.pieces[pieceId]) return;
  const pos = state.pieces[pieceId].position;
  state.occupiedCellsMatrix[pos.y][pos.x] = false;
  state.pieces[pieceId].isCaptured = true;
  state.queuedForDeletion.push(pieceId);
}