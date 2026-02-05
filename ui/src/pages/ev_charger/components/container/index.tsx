import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useTranslation } from 'react-i18next';
import EditForm from '../edit-form';
import { EvChargerContainerProps, ChargingStation } from './data';


const   EvChargerContainer = ({ stations, onAdd, onUpdate } : EvChargerContainerProps) => {
  const actionRef = useRef<ActionType>();
  const { t } = useTranslation();

  const [visibleForm, setVisibleForm] = useState<{
    action: 'ADD' | 'UPDATE';
    visible: boolean;
    data: ChargingStation | undefined;
  }>({
    action: 'ADD',
    visible: false,
    data: undefined,
  });

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <Tag color="success">{t("Available")}</Tag>;
      case 2:
        return <Tag color="error">{t("In use")}</Tag>;
      case 3:
        return <Tag color="warning">{t("Offline")}</Tag>;
      default:
        return <Tag>{t("Unknown status")}</Tag>;
    }
  };

  const columns: ProColumns<ChargingStation>[] = [
    {
      title: t('Mã trạm'),
      dataIndex: 'stationId',
    },
    {
      title: t('Tên trạm'),
      dataIndex: 'stationName',
    },
    {
      title: t('Địa chỉ'),
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: t('Vị trí'),
      render: (_, record) => `${record.pos.lat}, ${record.pos.lng}`,
    },
    {
      title: t('Xe đang sạc'),
      render: (_, record) => record.chargingInfo ? record.chargingInfo.licensePlate : '-',
    },
    {
      title: t('Action'),
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setVisibleForm({
                action: 'UPDATE',
                visible: true,
                data: record,
              });
            }}
          >
            {t('Edit')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<ChargingStation>
        actionRef={actionRef}
        rowKey="stationId"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => setVisibleForm({
              action: 'ADD',
              visible: true,
              data: undefined,
            })}
          >
            <PlusOutlined /> {t("Thêm trạm sạc")}
          </Button>,
        ]}
        dataSource={stations.map(station => ({
          ...station,
          address: station.address || ''
        }))}
        columns={columns}
      />
      <EditForm
        showForm={visibleForm}
        onFinish={(values) => {
          if (values) {
            if (visibleForm.action === 'ADD') {
              onAdd(values);
            } else {
              onUpdate(values.stationId, values);
            }
          }
          setVisibleForm({
            action: 'ADD',
            visible: false,
            data: undefined,
          });
        }}
      />
    </>
  );
};

export default EvChargerContainer;
