import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { startGame } from "../../data/gameSlice";
import { switchPage } from "../../data/menuSlice";
import { Difficulty, PageName, TRANSITION_HALF_LIFE, sleep } from "../../global/utils";
import styles from "./TournamentRoundsPage.module.scss";

export default function TournamentRoundsPage() {
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState(true);

  // Progress shape you can evolve later:
  // { completed: 0|1|2|3, round1: { totalXP, totalGems }, round2: {...}, round3: {...}, round4: {...} }
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tournamentProgress") || "null") || { completed: 0 };
    } catch {
      return { completed: 0 };
    }
  });

  useEffect(() => {
    (async () => {
      await sleep(TRANSITION_HALF_LIFE);
      setDisabled(false);
    })();
  }, []);

  const rounds = useMemo(
    () => [
      { id: 1, key: "round1", label: "Recruit's Gauntlet", difficulty: Difficulty.NORMAL },
      { id: 2, key: "round2", label: "Veteran's Crucible", difficulty: Difficulty.HARD },
      { id: 3, key: "round3", label: "Champion's Trial", difficulty: Difficulty.INSANE },
      { id: 4, key: "round4", label: "The Final Stand", difficulty: Difficulty.DUOS },
    ],
    []
  );

  const startRound = (roundIdx) => {
    const round = rounds[roundIdx - 1];
    if (!round) return;

    // Remember which round is starting (useful later when saving results)
    localStorage.setItem("tournamentCurrentRound", String(roundIdx));

    dispatch(startGame({ difficulty: round.difficulty }));
    dispatch(switchPage(PageName.GAME));
  };

  const renderSummary = (key) => {
    const r = progress?.[key];
    if (!r) return <div className={styles.empty}>No results yet</div>;
    return (
      <div className={styles.summary}>
        <div>Total XP: <span>{r.totalXP ?? 0}</span></div>
        <div>Total Gems: <span>{r.totalGems ?? 0}</span></div>
      </div>
    );
  };

  return (
    <main className={styles.lobby}>
      <div className={styles.panel}>
        <h1 className={styles.heading}>Tournament Arena</h1>

        {/* Horizontal Timeline */}
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLine}></div>
          <div className={styles.timelineNumbers}>
            {rounds.map((round) => (
              <div key={round.id} className={styles.timelineNumber}>
                <div className={styles.numberCircle}>{round.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Round Cards - All in one row */}
        <div className={styles.rounds}>
          {rounds.map((round) => (
            <div key={round.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Round {round.id}</h2>
                <h3 className={styles.cardSubtitle}>{round.label}</h3>
              </div>
              
              {renderSummary(round.key)}
              
              <button
                className={styles.startButton}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => startRound(round.id)}
              >
                Start Round
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.backButton}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => dispatch(switchPage(PageName.MAIN_MENU))}
            disabled={disabled}
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}