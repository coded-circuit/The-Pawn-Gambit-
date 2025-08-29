import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addXP,
  endGame,
  movePlayer,
  playerCaptureCooldown,
  processPieces,
  resetState,
  updateCaptureTiles,
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
    playerPosition,
    playerCooldownLeft,
    turnNumber,
    xp,
    gems,
    livesLeft,
    isGameOver,
    playerPieceType,
    totalXP,
    totalGems,
    totalTurnsSurvived,
  } = useSelector((state) => state.game);
  const difficulty = useSelector(selectDifficulty);
  const [potentialMoves, setPotentialMoves] = useState([]);

  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);
  useEffect(() => {
    if (isGameOver) return;
    const intervalId = setInterval(() => {
      dispatch(addXP(getPerSecondXPIncrease(difficulty)));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isGameOver, difficulty, dispatch]);

  useEffect(() => {
    if (isGameOver || !playerPosition) {
      setPotentialMoves([]);
      return;
    }
    const occupied = extractOccupiedCells(occupiedCellsMatrix);
    const moves = PieceMovementFunc[playerPieceType](playerPosition, playerPosition, occupied);
    const captures = PieceCaptureFunc[playerPieceType](playerPosition, playerPosition, occupied);
    setPotentialMoves([...moves, ...captures]);
  }, [playerPosition, playerPieceType, occupiedCellsMatrix, isGameOver]);

  const handleCellClick = (pos) => {
    if (isGameOver) return;
    const isCapturing = occupiedCellsMatrix[pos.y][pos.x] !== false;
    dispatch(movePlayer({ targetPos: pos, isCapturing, difficulty }));

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
    return Array.from({ length: 64 }, (_, i) => {
      const x = i % 8;
      const y = Math.floor(i / 8);
      const pos = { x, y };
      const isPotentialMove = arrayHasVector(potentialMoves, pos);

      return (
        <GridCell
          key={`${x}-${y}`}
          pos={pos}
          isCapture={captureCells.some((cell) => cell.x === x && cell.y === y)}
          onClick={() => handleCellClick(pos)}
          isPotentialMove={isPotentialMove}
        />
      );
    });
  }, [potentialMoves, captureCells]);
  

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
          (1 - playerCooldownLeft / playerCaptureCooldown) * 100
        }
        isGameOver={isGameOver}
        playerPieceType={playerPieceType}
      />
      <div className={styles.graphicsGridBorder}></div>
      <div className={styles.graphicsGridTrunk}></div>
      <div className={styles.gridContainer}>{gridCellComponents}</div>
      <div className={styles.piecesContainer}>
        
          <Piece
            gridPos={playerPosition}
            type={playerPieceType}
            isCaptured={isGameOver}
          />
        {pieceComponents}
      </div>
    </main>
  );
};

export default GamePage;