import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { BlackPieceType, PieceType, assertIsVector } from "../../../../global/utils";
import styles from "./Piece.module.scss";

// --- SVG Imports ---
import BlackBishop from "./Players/BlackBishopSvg";
import BlackPawn from "./Players/BlackPawnSvg";
import BlackQueen from "./Players/BlackQueen";
import BlackRook from "./Players/BlackRook";
import Bishop from "./BishopSvg";
import Knight from "./KnightSvg";
import Pawn from "./PawnSvg";
import Queen from "./QueenSvg";
import Rook from "./RookSvg";
import Shadow from "./ShadowSvg";

import { useSelector } from "react-redux";
import { selectPlayerPosition } from "../../../../data/gameSlice";


const Piece = ({ gridPos, type, isCaptured }) => {
  // Always select the player's position (used as a fallback only)
  const playerGridPos = useSelector(selectPlayerPosition);
  // Prefer the provided gridPos (for enemies and explicitly passed cases),
  // otherwise fall back to the player's position (for the player's own piece).
  const effectivePos = gridPos ?? playerGridPos;

  // --- Hooks are now correctly called at the top ---
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    // Animate only when we have a valid position and it changes.
    if (!effectivePos) return;
    setIsMoving(true);
    const timer = setTimeout(() => setIsMoving(false), 250);
    return () => clearTimeout(timer);
  }, [effectivePos?.x, effectivePos?.y]);

  // The safety check now happens after all hooks have been called.
  if (!effectivePos) {
    return null;
  }
  assertIsVector(effectivePos);

  const gfxPlayerStyles = {
    top: `${(effectivePos.y * 100) / 8}%`,
    left: `${(effectivePos.x * 100) / 8}%`,
    zIndex: effectivePos.y,
    opacity: isCaptured ? 0.0 : 1.0,
  };

  let pieceComponent = null;

  switch (type) {
    case BlackPieceType.BLACK_PAWN: pieceComponent = <BlackPawn />; break;
    case BlackPieceType.BLACK_ROOK: pieceComponent = <BlackRook />; break;
    case BlackPieceType.BLACK_BISHOP: pieceComponent = <BlackBishop />; break;
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
        <div className={styles.danceReference}>
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
};

export default Piece;