import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { BlackPieceType, PieceType, assertIsVector } from "../../../../global/utils";
import { selectGridSize } from "../../../../data/gameSlice";
import styles from "./Piece.module.scss";

// --- SVG Imports ---
import BlackBishop from "./Players/BlackBishopSvg";
import BlackPawn from "./Players/BlackPawnSvg";
import BlackQueen from "./Players/BlackQueen";
import BlackRook from "./Players/BlackRook";
import BlackKnight from "./Players/BlackKnightSvg";
import Bishop from "./BishopSvg";
import Knight from "./KnightSvg";
import Pawn from "./PawnSvg";
import Queen from "./QueenSvg";
import Rook from "./RookSvg";
import Shadow from "./ShadowSvg";

import { useSelector } from "react-redux";


const Piece = ({ gridPos, type, isCaptured, cooldownLeft: cooldownLeftProp }) => {
  const gridSize = useSelector(selectGridSize);
  const playerCaptureCooldownLeft = useSelector((state) => state.game.player?.captureCooldownLeft);

  // Derive a cooldownLeft value: prefer prop, then fallback to player's cooldown, else 0
  const cooldownLeft = cooldownLeftProp ?? playerCaptureCooldownLeft ?? 0;

  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    // Animate only when we have a valid position and it changes.
    if (!gridPos) return;
    setIsMoving(true);
    const timer = setTimeout(() => setIsMoving(false), 250);
    return () => clearTimeout(timer);
  }, [gridPos?.x, gridPos?.y]);

  if (!gridPos) {
    return null;
  }
  assertIsVector(gridPos);

  const gfxPlayerStyles = {
    top: `${(gridPos.y * 100) / gridSize}%`,
    left: `${(gridPos.x * 100) / gridSize}%`,
    zIndex: gridPos.y,
    opacity: isCaptured ? 0.0 : 1.0,
  };

  let pieceComponent = null;

  switch (type) {
    case BlackPieceType.BLACK_PAWN: pieceComponent = <BlackPawn />; break;
    case BlackPieceType.BLACK_ROOK: pieceComponent = <BlackRook />; break;
    case BlackPieceType.BLACK_BISHOP: pieceComponent = <BlackBishop />; break;
    case BlackPieceType.BLACK_KNIGHT: pieceComponent = <BlackKnight />; break;
    case BlackPieceType.BLACK_QUEEN: pieceComponent = <BlackQueen />; break;
    case PieceType.QUEEN: pieceComponent = <Queen />; break;
    case PieceType.ROOK: pieceComponent = <Rook />; break;
    case PieceType.BISHOP: pieceComponent = <Bishop />; break;
    case PieceType.KNIGHT: pieceComponent = <Knight />; break;
    case PieceType.PAWN_N:
    case PieceType.PAWN_E:
    case PieceType.PAWN_W:
    case PieceType.PAWN_S:
      pieceComponent = <Pawn />;
      break;
    default:
      console.warn(`Unknown piece type encountered: ${type}`);
      pieceComponent = null;
  }
  return (
    <div className={styles.piece} style={gfxPlayerStyles}>
      <div className={isMoving ? `${styles.jumpReference} ${styles.jumping}` : styles.jumpReference}>
        <div className={
            cooldownLeft === 0
              ? styles.jiggleReference
              : cooldownLeft === 99
              ? styles.celebrateReference
              : styles.danceReference
          }>
      {pieceComponent}
    </div>
  </div>
  <Shadow isMoving={isMoving} />
</div>
  );
};

Piece.propTypes = {
  gridPos: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  type: PropTypes.string,
  isCaptured: PropTypes.bool,
  cooldownLeft: PropTypes.number,
};

export default Piece;