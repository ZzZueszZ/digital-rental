import { useTranslation } from "react-i18next";
import { Divider } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, IdcardOutlined } from '@ant-design/icons';
import styles from './styles.module.less';
import { PopupContentProps } from "./data";

const PopupContent = ({ 
  stationName, 
  status, 
  stationId, 
  address, 
  chargingInfo 
}: PopupContentProps) => {
  const { t } = useTranslation();

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t("Available");
      case 2:
        return t("In use");
      case 3:
        return t("Offline");
      default:
        return t("Unknown status");
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1:
        return styles.statusGreen;
      case 2:
        return styles.statusRed;
      case 3:
        return styles.statusOrange;
      default:
        return '';
    }
  };

  return (
    <div className={styles.popupContent}>
      <div className={styles.header}>
        <h3>{stationName}</h3>
        <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
          {getStatusText(status)}
        </span>
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
          <IdcardOutlined className={styles.icon} />
          <span className={styles.value}>{stationId}</span>
        </div>
        <div className={styles.infoItem}>
          <EnvironmentOutlined className={styles.icon} />
          <span className={styles.value}>{address}</span>
        </div>
      </div>

      {chargingInfo && (
        <>
          <Divider className={styles.divider}>{t("Xe đang sạc")}</Divider>
          <div className={styles.chargingSection}>
            {chargingInfo.image && (
              <div className={styles.imageContainer}>
                <img
                  src={chargingInfo.image}
                  alt={chargingInfo.licensePlate}
                  className={styles.carImage}
                />
              </div>
            )}
            <div className={styles.chargingDetails}>
              <div className={styles.infoItem}>
                <CarOutlined className={styles.icon} />
                <span className={styles.value}>{chargingInfo.licensePlate}</span>
              </div>
              <div className={styles.timeInfo}>
                <div className={styles.infoItem}>
                  <ClockCircleOutlined className={styles.icon} />
                  <span className={styles.value}>
                    {chargingInfo.startTime} ({chargingInfo.duration} {t("phút")})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PopupContent; 