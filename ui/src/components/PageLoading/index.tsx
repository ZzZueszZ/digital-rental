import { ScaleLoader } from 'react-spinners';
import styles from './styles.module.less';
import {useAppSelector} from "@/store";
import {selectPageLoading} from "@/store/commonSlice";

const PageLoading = () => {
	const loading = useAppSelector(selectPageLoading)
  return (
    <>
      {loading && (
        <div className={styles.loading}>
          <ScaleLoader color="#3f5bc5" height={60} width={8} />
        </div>
      )}
    </>
  )
}
export default PageLoading
