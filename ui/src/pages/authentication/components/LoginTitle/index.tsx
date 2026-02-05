import styles from "./styles.module.less"
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const LoginTitle = () => {
  const {t} = useTranslation();
  return (
    <div className={styles.loginTitle}>
      <div className={styles.languageSwitcher}>
        <LanguageSwitcher/>
      </div>
      <h3 className={styles.title}>{t("Login")}</h3>
      <div className={styles.centerText}>
        <a>
          {t("Don't have an account?")}
        </a>
      </div>
    </div>
  )
}
export default LoginTitle;
