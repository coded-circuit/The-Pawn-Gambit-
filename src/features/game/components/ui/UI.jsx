import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  PageName,
  sleep,
  TRANSITION_HALF_LIFE,
  BlackPieceType,
} from "../../../../global/utils";

import {
  resetState,
  restartGame,
  upgradePlayerPiece,
} from "../../../../data/gameSlice";
import { switchPage } from "../../../../data/menuSlice";
import QuitSvg from "./QuitSvg";
import ResetSvg from "./ResetSvg";
import styles from "./UI.module.scss";


const GameUI = ({
  touchHandlers,
  captureCooldownPercent,
  turnNumber,
  xp,
  gems,
  isGameOver,
  livesLeft,
  totalXP,
  totalGems,
  playerPieceType,
  // dispatch prop is no longer needed
}) => {
  const dispatch = useDispatch(); // Use the hook for dispatching actions
  const [turnNumberClass, setTurnNumberClass] = useState(styles.uiVariable);
  const [xpClass, setXpClass] = useState(styles.uiVariable);
  const [gemsClass, setGemsClass] = useState(styles.uiVariable);

  // --- NEW: Logic to determine next upgrade ---
  let upgradeInfo = {
    cost: 0,
    nextPieceName: "",
    isMaxLevel: true,
  };

  switch (playerPieceType) {
    case BlackPieceType.BLACK_PAWN:
      upgradeInfo = { cost: 10, nextPieceName: "Rook", isMaxLevel: false };
      break;
    case BlackPieceType.BLACK_ROOK:
      upgradeInfo = { cost: 20, nextPieceName: "Bishop", isMaxLevel: false };
      break;
    case BlackPieceType.BLACK_BISHOP:
      upgradeInfo = { cost: 30, nextPieceName: "Queen", isMaxLevel: false };
      break;
    default:
      // Player is a Queen or other, button will not render.
      break;
  }
  // --- END NEW ---

  useEffect(() => {
    (async () => {
      setTurnNumberClass(`${styles.uiVariable} ${styles.puff}`);
      await sleep(200);
      setTurnNumberClass(`${styles.uiVariable}`);
    })();
  }, [turnNumber]);

  useEffect(() => {
    (async () => {
      setXpClass(`${styles.uiVariable} ${styles.puff}`);
      await sleep(200);
      setXpClass(`${styles.uiVariable}`);
    })();
  }, [xp]);

  useEffect(() => {
    (async () => {
      setGemsClass(`${styles.uiVariable} ${styles.puff}`);
      await sleep(200);
      setGemsClass(`${styles.uiVariable}`);
    })();
  }, [gems]);

  const renderLives = () => {
    const totalLives = 5;
    const hearts = [];
    for (let i = 0; i < totalLives; i++) {
      if (i < livesLeft + 1) {
        hearts.push(
          <span key={i} className={styles.heartIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "1em", height: "1em" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
        );
      } else {
        hearts.push(
          <span key={i} className={styles.heartIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "1em", height: "1em" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
        );
      }
    }
    return hearts;
  };

  return (
    <div className={styles.hud}>
      {isGameOver && livesLeft > 0 && (
        <div className={styles.gameOver}>
          <span className={styles.gameOverText}>Respawning…</span>
          <span className={styles.scoreText}>{xp}</span>
          <div className={styles.gameBox}>
            <span className={styles.subtitleText}>
              Gems <div> {gems}</div>
            </span>
            <span className={styles.subtitleText}>
              Turns<div>{turnNumber}</div>
            </span>
            <span className={styles.subtitleText}>
              Lives Left <div>{livesLeft}</div>
            </span>
          </div>
          <button
            className={styles.playagain}
            onClick={() => dispatch(restartGame())}
          >
            Play Again
          </button>
        </div>
      )}
      {isGameOver && livesLeft === 0 && (
        <div className={styles.gameOver}>
          <span className={styles.gameOverText}>FINAL SCORE</span>
          <div className={styles.gameBox2}>
            <span className={styles.titleText}>
              Total XP: <span className={styles.scoreText}>{totalXP}</span>
            </span>
            <span className={styles.titleText}>
              Total Gems: <span className={styles.scoreText}>{totalGems}</span>
            </span>
          </div>
          <button
            className={styles.uiButton}
            onClick={(e) => {
              e.target.blur();
              dispatch(switchPage(PageName.MAIN_MENU));
            }}
          >
            Quit
          </button>
        </div>
      )}
      <div className={styles.upperLeft}>
        <span className={styles.uiLabel}>XP:</span>
        <span className={xpClass}>{xp}</span>
        <span className={styles.uiLabel}>TURN:</span>
        <span className={turnNumberClass}>{turnNumber}</span>
        <span className={styles.uiLabel}>GEMS:</span>
        <span className={gemsClass}>{gems}</span>
        <span className={styles.uiLabel}>LIVES LEFT:</span>
        <span className={styles.uiVariable}>{renderLives()}</span>
      </div>
      <div className={styles.upperRight}>
        <button
          className={styles.uiButton}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            (async () => {
              dispatch(switchPage(PageName.GAME));
              await sleep(TRANSITION_HALF_LIFE);
              dispatch(resetState());
            })();
          }}
        >
          <ResetSvg />
        </button>
        <button
          className={styles.uiButton}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.target.blur();
            dispatch(switchPage(PageName.MAIN_MENU));
          }}
        >
          <QuitSvg />
        </button>
      </div>
      <div className={styles.upperCenter}>
        <div className={styles.cooldownBar}>
          <div className={styles.cooldownBarBG}>
            <div
              className={`${styles.cooldownBarFill} ${
                captureCooldownPercent >= 100.0 ? styles.barFull : ""
              }`}
              style={{ width: `${captureCooldownPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className={styles.touchArea} {...touchHandlers} />

      {/* --- REPLACED BUTTONS --- */}
      <div className={styles.upgradeButtonsContainer}>
        {!upgradeInfo.isMaxLevel && !isGameOver && (
          <button
            className={styles.upgradeButton}
            onClick={() => dispatch(upgradePlayerPiece())}
            disabled={gems < upgradeInfo.cost}
          >
            Upgrade to {upgradeInfo.nextPieceName} ({upgradeInfo.cost} Gems)
          </button>
        )}
      </div>
    </div>
  );
};

export default GameUI;