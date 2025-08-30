import { createSlice, nanoid } from "@reduxjs/toolkit";
import { Difficulty,arrayHasVector, assert, extractOccupiedCells, BlackPieceType, getDistance } from "../global/utils";
import { generateGrid } from "../features/game/logic/grid";
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
export const spawnProtectionTurns = 2;
const PLAYER1_ID = "ThePlayer";
const PLAYER2_ID = "ThePlayer2";
const initialGridSize = 8;
const playerSpawnPos = { x: Math.floor(initialGridSize / 2) - 1, y: Math.floor(initialGridSize / 2) };
// const playerSpawnPos = { x: 3, y: 4 };
const initialState = {
  gridSize: initialGridSize,
  pieces: {},
  player: {
    position: { ...playerSpawnPos },
    type: BlackPieceType.BLACK_PAWN,
    captureCooldownLeft: playerCaptureCooldown,
    isAlive: true,
  },
  player2: null,
  movingPieces: {},
  captureCells: [],
  occupiedCellsMatrix: generateGrid(initialGridSize),
  // occupiedCellsMatrix: new Array(8).fill(null).map(() => new Array(8).fill(false)),
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
    startGame: (state, action) => {
      const difficulty = action.payload.difficulty;
      const useBigGrid = difficulty === Difficulty.INSANE || difficulty === Difficulty.DUOS;
      const gridSize = useBigGrid ? 10 : 8;
      let spawnPos1;
      let spawnPos2;
      if (difficulty === Difficulty.DUOS) {
        // Even spacing along the main diagonal (0,0) -> (N-1,N-1):
        // positions at ~1/3 and ~2/3 of the diagonal
        const i1 = Math.floor((gridSize - 1) / 3);
        const i2 = Math.floor((2 * (gridSize - 1)) / 3);
        spawnPos1 = { x: i1, y: i1 };
        spawnPos2 = { x: i2, y: i2 };
      } else {
        const midX = Math.floor(gridSize / 2);
        const midY = Math.floor(gridSize / 2);
        spawnPos1 = { x: Math.floor(gridSize / 2) - 1, y: midY };
        spawnPos2 = { x: midX, y: midY };
      }

      // Build a fresh state from scratch for reliability
      state.gridSize = gridSize;
      state.pieces = {};
      state.player = {
        position: spawnPos1,
        type: BlackPieceType.BLACK_PAWN,
        captureCooldownLeft: playerCaptureCooldown,
        isAlive: true,
      };
      state.player2 = (difficulty === Difficulty.DUOS)
        ? {
        position: spawnPos2,
        type: BlackPieceType.BLACK_PAWN,
        captureCooldownLeft: playerCaptureCooldown,
        isAlive: true,
      }
    : null;
      state.movingPieces = {};
      state.captureCells = [];
      state.occupiedCellsMatrix = generateGrid(gridSize); // Create a clean grid
      state.queuedForDeletion = [];
      state.turnNumber = 0;
      state.xp = 0;
      state.gems = 0;
      state.livesLeft =4;
      state.isGameOver = false;
      // Note: We carry over livesLeft, totalXP, etc. from the initial state or previous games
      state.playerPieceType = BlackPieceType.BLACK_PAWN;
      
      // CRITICAL STEP: Place the player on the new, clean matrix
      state.occupiedCellsMatrix[spawnPos1.y][spawnPos1.x] = PLAYER1_ID;
        if (state.player2) {
          state.occupiedCellsMatrix[spawnPos2.y][spawnPos2.x] = PLAYER2_ID;
        }
    },
    resetState: () => initialState,

    addXP: (state, action) => { state.xp += action.payload; },

        endGame: (state) => {
      // Store final totals for THIS round only
      state.totalXP = state.xp;
      state.totalGems = state.gems;

      if (!state.isGameOver) {
        state.isGameOver = true;
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
        case BlackPieceType.BLACK_PAWN:
          nextPiece = BlackPieceType.BLACK_KNIGHT;
          cost = 20;
          break;
        case BlackPieceType.BLACK_KNIGHT:
          nextPiece = BlackPieceType.BLACK_ROOK;
          cost = 50;
          break;
        case BlackPieceType.BLACK_ROOK:
          nextPiece = BlackPieceType.BLACK_BISHOP;
          cost = 80;
          break;
        case BlackPieceType.BLACK_BISHOP:
          nextPiece = BlackPieceType.BLACK_QUEEN;
          cost = 130;
          break;
        default:
          return;
      }
      if (state.gems >= cost) {
        state.gems -= cost;
        state.playerPieceType = nextPiece;
        state.player.type = nextPiece;
      }
    },

   movePlayer: {
  reducer(state, action) {
    const { targetPos, isCapturing, difficulty, which } = action.payload;
    const gridSize = state.gridSize;

    const active =
      which === 2 && state.player2 ? state.player2 : state.player;
    if (!active || active.isAlive === false) return;

    const currentPos = active.position;

    if (targetPos.x === currentPos.x && targetPos.y === currentPos.y) {
      state.turnNumber += 1;
      return;
    }

    const occupied = extractOccupiedCells(state.occupiedCellsMatrix, gridSize);
    const validMoves = PieceMovementFunc[state.playerPieceType](currentPos, currentPos, occupied, gridSize);
    const validCaptures = PieceCaptureFunc[state.playerPieceType](currentPos, currentPos, occupied, gridSize);

    const cellVal = state.occupiedCellsMatrix[targetPos.y][targetPos.x];
    const capturingEnemy = isCapturing && cellVal !== false && cellVal !== PLAYER1_ID && cellVal !== PLAYER2_ID;

    const isValid =
      (!isCapturing && arrayHasVector(validMoves, targetPos)) ||
      (capturingEnemy && arrayHasVector(validCaptures, targetPos));

    if (!isValid) return;

    state.turnNumber += 1;
    state.xp += getPassiveXPIncrease(difficulty, state.turnNumber);
    state.gems += getSurvivalGems();

   if (state.player && state.player.captureCooldownLeft > 0) {
  state.player.captureCooldownLeft -= 1;
}
if (state.player2 && state.player2.captureCooldownLeft > 0) {
  state.player2.captureCooldownLeft -= 1;
}


    state.queuedForDeletion.forEach((pieceId) => delete state.pieces[pieceId]);
    state.queuedForDeletion = [];

    if (capturingEnemy) {
      const capturedPieceId = cellVal;
      state.xp += getPieceCaptureXPIncrease(state.pieces[capturedPieceId].type);
      state.gems += getPieceCaptureGems(state.pieces[capturedPieceId].type);
      queueDelete(state, capturedPieceId);
      active.captureCooldownLeft = playerCaptureCooldown;
    }

    const label = (which === 2 && state.player2) ? PLAYER2_ID : PLAYER1_ID;
    moveOccupiedCell(state, currentPos, targetPos, label);
    active.position = targetPos;
  },
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
    
      // Replace the existing reducer with this updated version
// Replace the existing reducer with this updated version
processPieces: (state, action) => {
  // 1) Spawn based on difficulty
  const difficulty = action?.payload?.difficulty;
let toSpawn = getNumberToSpawn(difficulty);

// Soft cap: keep enemy count reasonable per difficulty/grid
const activeEnemies = Object.values(state.pieces).filter((p) => !p.isCaptured).length;
const gridArea = state.gridSize * state.gridSize;
const baseCap = Math.floor(gridArea * 0.18); // ~18% of board (8x8 => 11, 10x10 => 18)
const capByDifficulty = {
  [Difficulty.EASY]: Math.min(baseCap, 10),
  [Difficulty.NORMAL]: Math.min(baseCap, 12),
  [Difficulty.HARD]: Math.min(baseCap, 14),
  [Difficulty.INSANE]: Math.min(baseCap, 16),
  [Difficulty.DUOS]: Math.min(baseCap, 18),
}[difficulty ?? Difficulty.NORMAL] ?? baseCap;

const remainingSlots = Math.max(0, capByDifficulty - activeEnemies);
if (remainingSlots <= 0) {
  toSpawn = 0;
} else if (toSpawn > remainingSlots) {
  toSpawn = remainingSlots;
}
  for (let i = 0; i < toSpawn; i += 1) {
  let placed = false;
  for (let tries = 0; tries < 3 && !placed; tries += 1) {
    const { type, pos } = getPieceWithPos(difficulty, state.gridSize, state.playerPieceType);
    if (!state.occupiedCellsMatrix[pos.y][pos.x]) {
      const { pieceId, newPiece } = createPiece(pos.x, pos.y, type);
      state.pieces[pieceId] = newPiece;
      state.occupiedCellsMatrix[pos.y][pos.x] = pieceId;
      placed = true;
    }
  }
}

  // 2) Enemy capture and movement
  // Movement frequency knob (lower N => more often)
  const moveEveryNTurnsByDifficulty = {
    [Difficulty.EASY]: 3,
    [Difficulty.NORMAL]: 3,
    [Difficulty.HARD]: 2,
    [Difficulty.INSANE]: 2,
    [Difficulty.DUOS]: 2,
  };
  const moveMod =
    moveEveryNTurnsByDifficulty[difficulty ?? Difficulty.NORMAL] ?? 3;
  const shouldTryMoveThisTurn = state.turnNumber % moveMod === 0;

  for (const [pieceId, p] of Object.entries(state.pieces)) {
    if (p.isCaptured) continue;

    // Recompute live flags per enemy so earlier captures in this tick are respected
    const p1Alive = state.player?.isAlive !== false;
    const p2Alive = !!state.player2 && state.player2.isAlive;

    // Decrement capture cooldown if present; cooldown blocks capture but not movement
    if (typeof p.cooldown === "number" && p.cooldown > 0) {
      p.cooldown -= 1;
    }

    // Always capture-check against the current board state
    const occupiedForCapture = extractOccupiedCells(
      state.occupiedCellsMatrix,
      state.gridSize
    );

    let captured = false;
    let targetPos = null;
    let capturedWhich = 0;

    // Attempt capture only if not on cooldown
    if ((!p.cooldown || p.cooldown <= 0) && (p1Alive || p2Alive)) {
      if (p1Alive) {
        const caps1 = PieceCaptureFunc[p.type](
          p.position,
          p.position,
          occupiedForCapture,
          state.gridSize
        );
        if (
          caps1.some(
            (c) =>
              c.x === state.player.position.x &&
              c.y === state.player.position.y
          )
        ) {
          targetPos = { ...state.player.position };
          capturedWhich = 1;
          captured = true;
        }
      }

      if (!captured && p2Alive) {
        const caps2 = PieceCaptureFunc[p.type](
          p.position,
          p.position,
          occupiedForCapture,
          state.gridSize
        );
        if (
          caps2.some(
            (c) =>
              c.x === state.player2.position.x &&
              c.y === state.player2.position.y
          )
        ) {
          targetPos = { ...state.player2.position };
          capturedWhich = 2;
          captured = true;
        }
      }

      if (captured) {
        moveOccupiedCell(state, p.position, targetPos, pieceId);
        p.position = targetPos;

        if (capturedWhich === 1) {
          state.player.isAlive = false;
        } else if (capturedWhich === 2) {
          state.player2.isAlive = false;
        }

        // End only if both are dead (or if no player2)
        const bothDead =
          state.player?.isAlive === false &&
          (!state.player2 || state.player2.isAlive === false);
        state.isGameOver = bothDead;

        if (typeof PieceCooldown[p.type] === "number") {
          p.cooldown = PieceCooldown[p.type];
        }
        // Skip movement if a capture happened
        continue;
      }
    }

    // No capture -> optionally move closer to the nearest alive player
    if (shouldTryMoveThisTurn && (p1Alive || p2Alive)) {
      const targets = [];
      if (p1Alive) targets.push(state.player.position);
      if (p2Alive) targets.push(state.player2.position);

      const curr = p.position;

      // Pick nearest target
      let chosenTarget = targets[0];
      let minDist = getDistance(curr, targets[0]);
      for (let i = 1; i < targets.length; i++) {
        const d = getDistance(curr, targets[i]);
        if (d < minDist) {
          minDist = d;
          chosenTarget = targets[i];
        }
      }

      // Recompute occupancy for movement as earlier enemies may have moved
      const occupiedForMove = extractOccupiedCells(
        state.occupiedCellsMatrix,
        state.gridSize
      );

      // Use movement function; pass p.position as second arg (consistent with rest of codebase)
      const candidates = PieceMovementFunc[p.type](
        p.position,
        p.position,
        occupiedForMove,
        state.gridSize
      );

      // Prefer moves that strictly reduce distance to chosen target
      const improving = candidates.filter(
        (m) => getDistance(m, chosenTarget) < minDist
      );

      if (improving.length > 0) {
        // Among improving moves, pick any with minimum distance (random tie-break)
        let bestDist = Infinity;
        let bestMoves = [];
        for (const m of improving) {
          const d = getDistance(m, chosenTarget);
          if (d < bestDist) {
            bestDist = d;
            bestMoves = [m];
          } else if (d === bestDist) {
            bestMoves.push(m);
          }
        }
        const choice = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        moveOccupiedCell(state, p.position, choice, pieceId);
        p.position = choice;
      }
    }
  }
},

    updateCaptureTiles: (state) => {
  const occupied = extractOccupiedCells(state.occupiedCellsMatrix, state.gridSize);
  const captures = [];
  const p1Alive = state.player?.isAlive !== false;
  const p2Alive = !!state.player2 && state.player2.isAlive;

   Object.values(state.pieces).forEach((p) => {
    if (p.isCaptured) return;
    if (typeof p.cooldown === "number" && p.cooldown > 0) return;      // still frozen
    if (typeof p.attackDelay === "number" && p.attackDelay > 0) return; // cannot attack yet

    if (p1Alive) {
      const caps1 = PieceCaptureFunc[p.type](p.position, state.player.position, occupied, state.gridSize);
      captures.push(...caps1);
    }
    if (p2Alive) {
      const caps2 = PieceCaptureFunc[p.type](p.position, state.player2.position, occupied, state.gridSize);
      captures.push(...caps2);
    }
  });;

  // Deduplicate
  const seen = new Set();
  state.captureCells = captures.filter((c) => {
    const key = `${c.x},${c.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });


},
  },
  
});

export const {
  startGame,resetState, addXP, endGame, restartGame, upgradePlayerPiece,
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
export const selectGridSize = (state) => state.game.gridSize;
export const selectPlayer2Position = (state) => state.game.player2?.position;
export const selectPlayer2CaptureCooldown = (state) => state.game.player2?.captureCooldownLeft;
export default gameSlice.reducer;

function moveOccupiedCell(state, v1, v2, pieceId) {
  if (!v1 || !v2 || (v1.x === v2.x && v1.y === v2.y)) return;
  state.occupiedCellsMatrix[v1.y][v1.x] = false;
  state.occupiedCellsMatrix[v2.y][v2.x] = pieceId;
}
function createPiece(x, y, type) {
  const pieceId = nanoid();
  const baseCooldown = PieceCooldown[type] || 0; // per-type base cooldown ON SPAWN

  return {
    pieceId,
    newPiece: {
      position: { x, y },
      type,
      cooldown: baseCooldown,   // keeps per-type spawn cooldown
      attackDelay: 1,           // NEW: one-turn capture lock, separate from cooldown
      isCaptured: false,
      movesMade: 0,
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