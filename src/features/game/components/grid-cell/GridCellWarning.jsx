import styles from "./GridCellWarning.module.scss";

const GridCellWarning = () => {
  return (
    <svg
      className={styles.gridCellWarning}
      width="76"
      height="75"
      viewBox="0 0 76 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 70V5C0.5 2.23858 2.73858 0 5.5 0H70.5C73.2614 0 75.5 2.23858 75.5 5V70C75.5 72.7614 73.2614 75 70.5 75H5.5C2.73858 75 0.5 72.7614 0.5 70Z"
        // fill="#D68D82"
        className={styles.warningFill}
      />
      <path
        d="M38 14.5833C38 34.5833 38 43.75 38 43.75"
        stroke="#EAB5A1"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M38 61.25L38 57.0833"
        stroke="#EAB5A1"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default GridCellWarning;
