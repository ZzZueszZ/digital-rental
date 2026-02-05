import {ColorStatusModalProps} from "@/pages/map/components/ColorStatus/data";
import {Modal, Table} from "antd";
import styles from "./styles.module.less"
import {useTranslation} from "react-i18next";
import { useRef } from "react";

const ColorStatus = ({visible, onOk, onCancel} : ColorStatusModalProps) => {
  const {t} = useTranslation();
  const modalContainerRef = useRef(null);

  const dataSource = [
    {
      key: '1',
      color: (
        <div className={styles.iconWrapper}>
          <img 
            src="/images/leaflet/icons/charging-station-14-svgrepo-com_green.svg"
            className={styles.statusIcon}
            alt="Available"
          />
        </div>
      ),
      description: t('Available'),
    },
    {
      key: '2',
      color: (
        <div className={styles.iconWrapper}>
          <img 
            src="/images/leaflet/icons/charging-station-14-svgrepo-com_red.svg"
            className={styles.statusIcon}
            alt="In use"
          />
        </div>
      ),
      description: t('In use'),
    },
    {
      key: '3',
      color: (
        <div className={styles.iconWrapper}>
          <img 
            src="/images/leaflet/icons/charging-station-14-svgrepo-com_orange.svg"
            className={styles.statusIcon}
            alt="Offline"
          />
        </div>
      ),
      description: t('Offline'),
    },
  ];

  const columns = [
    {
      title: t("Color"),
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];
  return (
    <>
      <div ref={modalContainerRef}/>
      <Modal
        title={t("Color Status Explanation")}
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        centered
        getContainer={() => modalContainerRef.current || document.body}
        footer={(_, {OkBtn}) => (
          <>
            <OkBtn/>
          </>
        )}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowClassName="color-status-row"

        />
      </Modal>
    </>
  );
};

export default ColorStatus;
