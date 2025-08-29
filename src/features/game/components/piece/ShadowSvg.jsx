import styles from "./PieceSvg.module.scss";

const Shadow = ({ isMoving }) => {
  return (
    <svg
      className={`${styles.shadow} ${isMoving ? styles.movingShadow : ""}`}
      // width="90"
      // height="50"
      viewBox="0 0 90 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="45"
        cy="25"
        rx="45"
        ry="25"
        fill="#3D3D3D"
        fillOpacity="0.3"
      />
    </svg>
  );
};

export default Shadow;
