import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectPage } from "./data/menuSlice";
import { PageName, TRANSITION_HALF_LIFE, sleep } from "./global/utils";

import MainPage from "./features/menu/MainPage";
import OptionsPage from "./features/menu/OptionsPage";
import HowToPlayPage from "./features/menu/HowToPlayPage";
import PageTransition from "./features/menu/PageTransition";
import GamePage from "./features/game/GamePage";

function App() {
  const currentPage = useSelector(selectPage);
  const [pageElement, setPageElement] = useState();
  const [transitionElement, setTransitionElement] = useState();

  // Handle Page Transition
  useEffect(() => {
    (async () => {
      switch (currentPage.value) {
        case PageName.GAME:
          setTransitionElement(<PageTransition />);
          await sleep(TRANSITION_HALF_LIFE);
          setPageElement(<GamePage />);
          await sleep(TRANSITION_HALF_LIFE);
          setTransitionElement();
          break;
        case PageName.MAIN_MENU:
          setTransitionElement(<PageTransition />);
          await sleep(TRANSITION_HALF_LIFE);
          setPageElement(<MainPage />);
          await sleep(TRANSITION_HALF_LIFE);
          setTransitionElement();
          break;
        case PageName.OPTIONS:
          setTransitionElement(<PageTransition />);
          await sleep(TRANSITION_HALF_LIFE);
          setPageElement(<OptionsPage />);
          await sleep(TRANSITION_HALF_LIFE);
          setTransitionElement();
          break;
        case PageName.HOW_TO_PLAY:
          setTransitionElement(<PageTransition />);
          await sleep(TRANSITION_HALF_LIFE);
          setPageElement(<HowToPlayPage />);
          await sleep(TRANSITION_HALF_LIFE);
          setTransitionElement();
          break;
        case PageName.CREDITS:
          setTransitionElement(<PageTransition />);
          await sleep(TRANSITION_HALF_LIFE);
          setPageElement(<Credits />);
          await sleep(TRANSITION_HALF_LIFE);
          setTransitionElement();
          break;
      }
    })();
  }, [currentPage]);

  return (
    <>
      {transitionElement}
      {pageElement}
    </>
  );
}

export default App;
