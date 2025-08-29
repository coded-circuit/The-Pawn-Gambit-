import { useEffect, useState } from "react";
import { switchPage } from "../../data/menuSlice";
import { PageName, sleep, TRANSITION_HALF_LIFE } from "../../global/utils";
import styles from "./HowToPlayPage.module.scss";
import { useDispatch } from "react-redux";
import ControlsIcon from "./components/ControlsIcon";

const HowToPlayPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await sleep(TRANSITION_HALF_LIFE);
      setDisabled(false); 
    })();
  }, []);

  return (
    <main className={styles.howToPlayMenu}>
      <div>
        <h1 className={styles.heading}>HOW TO PLAY</h1>
        <div className={styles.wasdIcon}>
          <ControlsIcon />
        </div>
        <p className={styles.instruction}>
          Move: WASD (or swipe)
          <br />
          Pass Turn: Space (or tap)
        </p>

        <div className={styles.barIcon}>
          <div className={styles.cooldownBarBG}>
            <div className={styles.cooldownBarFill}></div>
          </div>
        </div>
        <p className={styles.instruction}>
          Capture enemies by moving into them when the bar is full.
        </p>
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

export default HowToPlayPage;
