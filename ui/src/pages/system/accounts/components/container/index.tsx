import { EditOutlined,PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useRef, useEffect, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useTranslation } from 'react-i18next';
import type { Location } from '@remix-run/router';
import { useLocation } from 'react-router-dom';
import useQuery from '@/utils/useQuery';
import { ShowForm, TableItem } from '@/pages/system/accounts/data';
import { query } from '@/pages/system/accounts/service';
import EditForm from '@/pages/system/accounts/components/EditForm';

const AccountContainer = () => {
  const actionRef = useRef<ActionType>();
  const { t } = useTranslation();

  const currentPage = Number(useQuery('page', 1));
  const pageSize = Number(useQuery('pageSize', 20));
  const location: Location = useLocation();

  useEffect(() => {
    if (actionRef) actionRef.current?.reload();
  }, [location.search]);
  const [visibleForm, setVisibleForm] = useState<ShowForm>({
    action: 'ADD',
    visible: false,
  });
  // const mockApiCall = (params: { a: number }): Promise<string> =>
  //     new Promise((resolve, reject) => {
  //         setTimeout(() => {
  //             // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  //             Math.random() > 0.5 ? resolve('Data fetched successfully!') : reject(new Error('Error fetching data!'));
  //         }, 2000);
  //     });

  const columns: ProColumns<TableItem>[] = [
    {
      width: 40,
      renderText: (_text, _record, index) => (currentPage - 1) * pageSize + 1 + index,
      search: false,
    },
    {
      title: t('Action'),
      valueType: 'option',
      width: 140,
      render: (_text, record) => (
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
      search: false,
    },
    {
      title: t('User Name'),
      dataIndex: 'userName',
    },
    {
      title: t('Email'),
      dataIndex: 'email',
    },
  ];

  return (
    <>
      <ProTable<TableItem>
        search={{
          searchText: 'Search',
          defaultCollapsed: false,
          span: 12,
          labelWidth: 150,
        }}
        headerTitle={t('User management')}
        actionRef={actionRef}
        rowKey="userId"
        request={(params, sorter, filter) =>
          query({ ...params, sorter, filter })
        }
        columns={columns}
        toolBarRender={() => [

          <Button
            type="primary"
            onClick={() =>
              setVisibleForm({
                action: 'ADD',
                visible: true,
              })
            }
          >
            <PlusOutlined /> {t("Add")}
          </Button>,
        ]}
      />
      <EditForm
        showForm={visibleForm}
        onFinish={() => {
          actionRef.current?.reload();
          setVisibleForm({
            action: 'ADD',
            visible: false,
          });
        }}
      />
    </>
  );
};

export default AccountContainer;
