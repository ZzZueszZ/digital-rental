import { useNetwork } from 'ahooks';
import styles from './styles.module.less';

const NetworkStatus = () => {
  const networkState = useNetwork();
  const ranges = [
    { max: 51, key: "very_good" },
    { max: 101, key: "good" },
    { max: 201, key: "average" },
    { max: Infinity, key: "poor" }
  ];

  return (
    <>
      <div className={styles.wifiSignal}>
        <span className={[styles.bar, styles.bar1, (networkState.rtt || 0) < ranges[3].max ? styles.barActive : undefined].join(' ')}></span>
        <span className={[styles.bar, styles.bar2, (networkState.rtt || 0) < ranges[2].max ? styles.barActive : undefined].join(' ')}></span>
        <span className={[styles.bar, styles.bar3, (networkState.rtt || 0) < ranges[1].max ? styles.barActive : undefined].join(' ')}></span>
        <span className={[styles.bar, styles.bar4, (networkState.rtt || 0) < ranges[0].max ? styles.barActive : undefined].join(' ')}></span>
      </div>
    </>
  );
};

export default NetworkStatus;
