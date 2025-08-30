import { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { startGame } from "../../data/gameSlice";
import { switchPage,setDifficulty, setShowIndicators } from "../../data/menuSlice";
import { Difficulty,PageName, TRANSITION_HALF_LIFE, sleep } from "../../global/utils";
import styles from "./MainPage.module.scss";

import Logo from "./components/Logo";

const MainPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [hasClicked, setHasClicked] = useState(false);
  const dispatch = useDispatch();

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
    // Practice: force Casual difficulty and show indicators ON
    // Clear any tournament flags so Quit routes to MAIN_MENU
      try { localStorage.removeItem("tournamentCurrentRound"); } catch {}
      dispatch(setDifficulty(Difficulty.EASY));
      dispatch(setShowIndicators(true));
      dispatch(startGame({difficulty: Difficulty.EASY}));
      dispatch(switchPage(PageName.GAME));
      setHasClicked(true);
    }}
    disabled={disabled}
>
  PRACTICE
</button>
        {/* <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleTournamentClick}
          disabled={disabled}
        >
          TOURNAMENT
        </button> */}
        <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(switchPage(PageName.TOURNAMENT_LOGIN));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          TOURNAMENT
        </button>
        {/* <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(switchPage(PageName.HOW_TO_PLAY));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          HOW TO PLAY
        </button> */}
        {/* <button className={`${styles.cta} ${styles.primary}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (hasClicked) return;
            dispatch(switchPage(PageName.OPTIONS));
            setHasClicked(true);
          }}
          disabled={disabled}
        >
          OPTIONS
        </button> */}
        </div>
        
        </section>
      </div>
    </main>
  );
};

export default MainPage;
