import styles from "./PageTransition.module.scss";

const PageTransition = () => {
  return (
    <div className={styles.transition}>
      <div className={styles.topTeeth}></div>
      <div className={styles.transitionBody}></div>
      <div className={styles.bottomTeeth}></div>
    </div>
  );
};

export default PageTransition;
