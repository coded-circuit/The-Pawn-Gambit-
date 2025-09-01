import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addXP,
  endGame,
  movePlayer,
  playerCaptureCooldown,
  processPieces, selectPlayerPosition, updateCaptureTiles,selectPlayer2Position,
} from "../../data/gameSlice";
import GridCell from "./components/grid-cell/GridCell";
import Piece from "./components/piece/Piece";
import UI from "./components/ui/UI";
import styles from "./GamePage.module.scss";

import { arrayHasVector, extractOccupiedCells } from "../../global/utils";
import { PieceCaptureFunc, PieceMovementFunc } from "./logic/piece";
import { getPerSecondXPIncrease } from "./logic/score";

import { selectDifficulty } from "../../data/menuSlice";
import store from "../../data/store";

const GamePage = () => {
  const dispatch = useDispatch();

  const {
    pieces,
    occupiedCellsMatrix,
    captureCells,
    turnNumber,
    xp,
    gems,
    livesLeft,
    isGameOver,
    playerPieceType,
    totalXP,
    totalGems,
    totalTurnsSurvived,
    gridSize,
    player,
    player2,
  } = useSelector((state) => (state.game));
  const difficulty = useSelector(selectDifficulty);
  const playerPosition = useSelector(selectPlayerPosition);
  const player2Position = useSelector(selectPlayer2Position);
  const [potentialMoves, setPotentialMoves] = useState([]);

  // useEffect(() => {
  //   dispatch(resetState());
  // }, [dispatch]);
  useEffect(() => {
    if (isGameOver ||  (!playerPosition && !player2Position)) {
      setPotentialMoves([]);
      return;
    }
     const occupied = extractOccupiedCells(occupiedCellsMatrix);
    const moves = [];
    const addMoves = (pos) => {
      const m = PieceMovementFunc[playerPieceType](pos, pos, occupied, gridSize);
      const c = PieceCaptureFunc[playerPieceType](pos, pos, occupied, gridSize);
      moves.push(...m, ...c);
    };
    if (playerPosition && player?.isAlive !== false) addMoves(playerPosition);
    if (player2Position && player2?.isAlive) addMoves(player2Position);

    // Dedup
    const seen = new Set();
    const uniq = moves.filter(v => {
      const k = `${v.x},${v.y}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    setPotentialMoves(uniq);
  },[playerPosition, player2Position, playerPieceType, occupiedCellsMatrix, isGameOver, player?.isAlive, player2?.isAlive, gridSize]);

  useEffect(() => {
    if (isGameOver || !playerPosition) {
      setPotentialMoves([]);
      return;
    }
    const occupied = extractOccupiedCells(occupiedCellsMatrix);
    const moves = PieceMovementFunc[playerPieceType](playerPosition, playerPosition, occupied,gridSize);
    const captures = PieceCaptureFunc[playerPieceType](playerPosition, playerPosition, occupied,gridSize);
    setPotentialMoves([...moves, ...captures]);
  }, [playerPosition, playerPieceType, occupiedCellsMatrix, isGameOver]);

  // Inactivity timeout: set isGameOver to true if no input for 30 seconds
  useEffect(() => {
    if (isGameOver) return;

    const TIMEOUT_MS = 30000; // 30 seconds
    let timerId;

    const reset = () => {
      if (isGameOver) return;
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        const currentState = store.getState().game;
        if (!currentState.isGameOver) {
          dispatch(endGame());
        }
      }, TIMEOUT_MS);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "pointerdown",
      "pointermove",
    ];

    events.forEach((evt) => {
      document.addEventListener(evt, reset, { passive: true });
    });

    // start timer on mount
    reset();

    return () => {
      if (timerId) clearTimeout(timerId);
      events.forEach((evt) => {
        document.removeEventListener(evt, reset);
      });
    };
  }, [dispatch, isGameOver]);

  const handleCellClick = (pos) => {
    if (isGameOver) return;

    const cellVal = occupiedCellsMatrix[pos.y][pos.x];
    const isFriendly = cellVal === "ThePlayer" || cellVal === "ThePlayer2";
    const isCapturing = cellVal !== false && !isFriendly;

    const occupied = extractOccupiedCells(occupiedCellsMatrix);

    // Allow clicking on your own cell to count as a turn
    const isSameAsP1 = !!playerPosition && pos.x === playerPosition.x && pos.y === playerPosition.y;
    const isSameAsP2 = !!player2Position && pos.x === player2Position.x && pos.y === player2Position.y;

    const canP1 = playerPosition && player?.isAlive !== false && (
      isSameAsP1 ||
      arrayHasVector(PieceMovementFunc[playerPieceType](playerPosition, playerPosition, occupied, gridSize), pos) ||
      arrayHasVector(PieceCaptureFunc[playerPieceType](playerPosition, playerPosition, occupied, gridSize), pos)
    );

    const canP2 = player2Position && player2?.isAlive && (
      isSameAsP2 ||
      arrayHasVector(PieceMovementFunc[playerPieceType](player2Position, player2Position, occupied, gridSize), pos) ||
      arrayHasVector(PieceCaptureFunc[playerPieceType](player2Position, player2Position, occupied, gridSize), pos)
    );

    let which = 0;
    if (canP1) which = 1;
    else if (canP2) which = 2;
    else return;

    dispatch(movePlayer({ which, targetPos: pos, isCapturing, difficulty }));

    setTimeout(() => {
      dispatch(processPieces({ difficulty }));
      dispatch(updateCaptureTiles());

      const currentState = store.getState().game;
      if (currentState.isGameOver && currentState.livesLeft <= 0) {
        dispatch(endGame());
      }
    }, 100);
  };
  const pieceComponents = useMemo(
    () =>
      pieces ? Object.keys(pieces).map((pieceId) => (
        <Piece
          key={pieceId}
          gridPos={pieces[pieceId].position}
          type={pieces[pieceId].type}
          cooldownLeft={pieces[pieceId].cooldown}
          isCaptured={pieces[pieceId].isCaptured}
        />
      )) : [],
    [pieces]
  );
  const gridCellComponents = useMemo(() => {
  const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const x = i % gridSize;
      const y = Math.floor(i / gridSize);
      const pos = { x, y };
      const isPotentialMove = arrayHasVector(potentialMoves, pos);

      cells.push(
        <GridCell
          key={`${x}-${y}`}
          pos={pos}
          isCapture={captureCells.some((cell) => cell.x === x && cell.y === y)}
          onClick={() => handleCellClick(pos)}
          isPotentialMove={isPotentialMove}
        />
      );
    }
    return cells;
  }, [gridSize, potentialMoves, captureCells]);

  return (
    <main>
      <UI
        turnNumber={turnNumber}
        xp={xp}
        gems={gems}
        livesLeft={livesLeft}
        totalXP={totalXP}
        totalGems={totalGems}
        totalTurnsSurvived={totalTurnsSurvived}
        captureCooldownPercent={
          (1 - (player?.captureCooldownLeft ?? 0) / playerCaptureCooldown) * 100
        }
        isGameOver={isGameOver}
        playerPieceType={playerPieceType}
      />
      <div className={styles.graphicsGridBorder}></div>
      <div className={styles.graphicsGridTrunk}></div>
      <div className={styles.gridContainer }style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`,'--grid-size': String(gridSize) }}>{gridCellComponents}</div>
          <div className={styles.piecesContainer} style={{ '--grid-size': String(gridSize) }}>
          <Piece
            gridPos={playerPosition}
            type={playerPieceType}
            isCaptured={isGameOver || player?.isAlive === false}
            cooldownLeft={player?.captureCooldownLeft ?? 0}
          />
          {player2 && (
            <Piece
              gridPos={player2.position}
              type={playerPieceType}
              isCaptured={isGameOver || player2.isAlive === false}
              cooldownLeft={player2.captureCooldownLeft ?? 0}
            />
          )}
        {pieceComponents}
      </div>
    </main>
  );
};

export default GamePage;