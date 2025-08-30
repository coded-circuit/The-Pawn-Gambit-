import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { startGame } from "../../data/gameSlice";
import { switchPage } from "../../data/menuSlice";
import { Difficulty, PageName, TRANSITION_HALF_LIFE, sleep } from "../../global/utils";
import styles from "./TournamentLoginPage.module.scss";

const TournamentLoginPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [avatarName, setAvatarName] = useState("");
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const dispatch = useDispatch();

  // Generate random avatar on page load
  useEffect(() => {
    const generateRandomAvatar = () => {
      // Using DiceBear API for random avatars (free and reliable)
      const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'croodles', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const randomSeed = Math.random().toString(36).substring(2, 15);
      return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&size=128`;
    };

    (async () => {
      await sleep(TRANSITION_HALF_LIFE);
      
      // Generate new random avatar each time
      setAvatarUrl(generateRandomAvatar());
      
      try {
        const saved = JSON.parse(localStorage.getItem("tournamentUser") || "null");
        if (saved) {
          setAvatarName(saved.avatarName || "");
        }
      } catch {}
      setDisabled(false);
    })();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!avatarName.trim()) {
      setError("Please enter your avatar name.");
      return;
    }
    localStorage.setItem(
      "tournamentUser",
      JSON.stringify({ 
        avatarName: avatarName.trim()
      })
    );
    if (isExiting) return;
    setIsExiting(true);
    dispatch(startGame({ difficulty: Difficulty.INSANE }));
    dispatch(switchPage(PageName.GAME));
  };

  return (
    <main className={styles.loginMenu}>
      <div className={styles.panel}>
        <h1 className={styles.heading}>TOURNAMENT LOGIN</h1>
        <p className={styles.tagline}>Prepare for Battle, Champion!</p>
        
        {/* Random Avatar */}
        <div className={styles.imageContainer}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Random Avatar" 
              className={styles.avatar}
              onError={(e) => {
                // Fallback if avatar fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={styles.avatarFallback}>
            🎮
          </div>
        </div>
        
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label}>
            Avatar Name
            <input
              className={styles.input}
              type="text"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              disabled={disabled}
              required
              placeholder="Enter your warrior name..."
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backButton}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (isExiting) return;
                setIsExiting(true);
                dispatch(switchPage(PageName.MAIN_MENU));
              }}
              disabled={disabled}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (isExiting) return;
                setIsExiting(true);
                dispatch(switchPage(PageName.TOURNAMENT_ROUNDS));
              }}
              disabled={disabled}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default TournamentLoginPage;