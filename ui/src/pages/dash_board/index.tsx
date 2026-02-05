import { PageContainer } from '@ant-design/pro-layout';
import { Card, Col, Row, Select } from 'antd';
import ChargerStatus from '@/pages/dash_board/components/ChargerStatus';
import StatsCards from '@/pages/dash_board/components/StatsCards';
import RecentSessions from '@/pages/dash_board/components/RecentSessions';
import MonthlyChart from '@/pages/dash_board/components/MonthlyChart';

const DashBoard = () => {

  return (
    <PageContainer
      header={{
        title: 'Overview',
        extra: [
          <Select
            key="location"
            defaultValue="all"
            style={{ width: 200 }}
            options={[
              { label: 'All Locations', value: 'all' },
              { label: 'Hilton Kennedy', value: 'hilton' },
            ]}
          />,
        ],
      }}
    >
      <div>
        <Row gutter={[10, 10]}>
          <Col span={6}>
            <Card bordered={false} style={{ height: '100%' }}>
              <ChargerStatus />
            </Card>
          </Col>
          <Col span={18}>
            <Card bordered={false} style={{ height: '100%' }}>
              <StatsCards />
            </Card>
          </Col>
        </Row>
        <MonthlyChart />
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card bordered={false}>
              <RecentSessions />
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default DashBoard;
