import {Spin} from 'antd';
import styles from "./styles.module.less"

const Loader = () => (
    <div className={styles.loaderWrapper}>
        <Spin size="large"/>
    </div>
);

export default Loader;