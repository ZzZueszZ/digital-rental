import styles from "./styles.module.less";
import { Avatar, Space, Tooltip } from "antd";
import {CheckOutlined, ClockCircleOutlined, ExclamationCircleOutlined, WarningOutlined} from "@ant-design/icons";
import { useState } from "react";
import ColorStatus from "@/pages/map/components/ColorStatus";
import {WarningIndicatorComponentProps} from "@/pages/map/components/WarningIndicator/data";
import StatusBadge from "@/pages/map/components/StatusBadge";
import {useTranslation} from "react-i18next";
const WarningIndicator = ({ markers,isSelected, handleSelect }: WarningIndicatorComponentProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {t} = useTranslation();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleStatusSelect = (status: number) => {
    if (isSelected === status) {
      handleSelect(0);
    } else {
      handleSelect(status);
    }
  };

  const statuses = [
    { status: 1, icon: <CheckOutlined />, colorClass: styles.greenColor },
    { status: 2, icon: <WarningOutlined />, colorClass: styles.redColor },
    { status: 3, icon: <ClockCircleOutlined />, colorClass: styles.orangeColor },
  ];

  const filterMarkers = (status: number) => {
      const dataFiltered = markers.filter(marker => marker.status === status);
      return dataFiltered.length;
    }


  return (
    <div >
      <Space>
        <Tooltip title={t("Click for color status explanation")}>
          <Avatar icon={<ExclamationCircleOutlined />} onClick={showModal} className={styles.toolTip} />
        </Tooltip>

        {statuses.map(({ status, icon, colorClass }) => (
          <StatusBadge
            key={status}
            count={filterMarkers(status)}
            icon={icon}
            colorClass={colorClass}
            isSelected={isSelected === status}
            handleSelect={() => handleStatusSelect(status)}
          />
        ))}

      </Space>

      <ColorStatus visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} />
    </div>
  );
};

export default WarningIndicator;
