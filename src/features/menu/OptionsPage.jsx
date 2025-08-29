import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDifficulty,
  selectShowIndicators,
  setDifficulty,
  setShowIndicators,
  switchPage,
} from "../../data/menuSlice";
import {
  Difficulty,
  PageName,
  TRANSITION_HALF_LIFE,
  sleep,
} from "../../global/utils";
import styles from "./OptionsPage.module.scss";

const OptionsPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const currDifficulty = useSelector(selectDifficulty);
  const currShowIndicators = useSelector(selectShowIndicators);

  const dispatch = useDispatch();

  let difficultyStr = "";
  switch (currDifficulty) { 
    case Difficulty.EASY:
      difficultyStr = "CASUAL";
      break;
    case Difficulty.NORMAL:
      difficultyStr = "HARD";
      break;
    case Difficulty.HARD:
      difficultyStr = "BRUTAL";
      break;
  }
  const showIndicatorsStr = currShowIndicators ? "ON" : "OFF";

  useEffect(() => {
    (async () => {
      await sleep(TRANSITION_HALF_LIFE);
      setDisabled(false);
    })();
  }, []);

  return (
    <main className={styles.optionsMenu}>
      <div>
        <h1 className={styles.heading}>OPTIONS</h1>
        <p className={styles.optionLabel}>Difficulty</p>
        <button
          onMouseDown={(e) => e.preventDefault()}
          className={styles.optionButton}
          onClick={() => {
            if (isExiting) return;
            const newValue =
              currDifficulty === Difficulty.HARD
                ? Difficulty.EASY
                : currDifficulty + 1;
            dispatch(setDifficulty(newValue));
          }}
          disabled={disabled}
        >
          {difficultyStr}
        </button>
        <p className={styles.optionLabel}>Show Indicators</p>
        <button
          onMouseDown={(e) => e.preventDefault()}
          className={styles.optionButton}
          onClick={() => {
            if (isExiting) return;
            dispatch(setShowIndicators(!currShowIndicators));
          }}
          disabled={disabled}
        >
          {showIndicatorsStr}
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          className={styles.backButton}
          onClick={() => {
            if (isExiting) return;
            dispatch(switchPage(PageName.MAIN_MENU));
            setIsExiting(true);
          }}
          disabled={disabled}
        >
          BACK
        </button>
      </div>
    </main>
  );
};

export default OptionsPage;
