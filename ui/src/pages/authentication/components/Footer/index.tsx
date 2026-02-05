import styles from "./styles.module.less";
import {useTranslation} from "react-i18next";

const Footer = () => {
  const {t} = useTranslation();
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footer}>
        <p>
          {t("This site is protected by")} <a href="#" className={styles.footerLink}>{t("Privacy Policy")}</a>
        </p>
        <ul>
          <li>
            <a href="/terms" className={styles.footerLink}>{t("Terms and Conditions")}</a>
          </li>
          <li>
            <a href="/privacy" className={styles.footerLink}>{t("Privacy Policy")}</a>
          </li>
          <li>
            <a href="/ca-privacy" className={styles.footerLink}>{t("CA Privacy Notice")}</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
