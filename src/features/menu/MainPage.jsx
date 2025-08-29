import { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { startGame } from "../../data/gameSlice";
import { switchPage } from "../../data/menuSlice";
import { Difficulty,PageName, TRANSITION_HALF_LIFE, sleep } from "../../global/utils";
import styles from "./MainPage.module.scss";

import Logo from "./components/Logo";

const MainPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [hasClicked, setHasClicked] = useState(false);
  const currentDifficulty = useSelector((state) => state.menu.settings.difficulty);
  const dispatch = useDispatch();
  const handleTournamentClick = () => {
    if (hasClicked) return;
    // Always starts the game on INSANE difficulty
    dispatch(startGame({ difficulty: Difficulty.INSANE }));
    dispatch(switchPage(PageName.GAME));
    setHasClicked(true);
  };

  useEffect(() => {
    (async () => {
      await sleep(TRANSITION_HALF_LIFE);
      setDisabled(false);
    })();
  }, []);

  return (
    <main className={styles.mainMenu}>
      <div>
        <section className={styles.panel}>
          <h1 className={styles.logo}>
          <Logo />
        </h1>
        <p className={styles.tagline}>Survive the board. Upgrade. Outplay the horde.</p>
        <div className={styles.buttons}>
          <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(startGame({difficulty:currentDifficulty}))
            dispatch(switchPage(PageName.GAME));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          PRACTICE
        </button>
        <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleTournamentClick}
          disabled={disabled}
        >
          TOURNAMENT
        </button>
        <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(switchPage(PageName.HOW_TO_PLAY));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          HOW TO PLAY
        </button>
        <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(switchPage(PageName.OPTIONS));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          OPTIONS
        </button>
        </div>
        
        </section>
      </div>
    </main>
  );
};

export default MainPage;
