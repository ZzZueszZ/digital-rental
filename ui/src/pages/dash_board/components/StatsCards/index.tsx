import { Card, Col, Row, Statistic, DatePicker } from 'antd';
import { DollarOutlined, ThunderboltOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import styles from './styles.module.less';

const StatsCards = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <DatePicker 
          picker="month"
          format="MMM YYYY"
          allowClear={false}
          defaultValue={dayjs()}
        />
      </div>
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={24} md={8}>
          <Card bordered={false} className={styles.card}>
            <Statistic
              title={t('Sessions')}
              value={48}
              prefix={<FieldTimeOutlined className={styles.icon} />}
              className={styles.statistic}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card bordered={false} className={styles.card}>
            <Statistic
              title={t('Energy used')}
              value={805}
              suffix="kWh"
              prefix={<ThunderboltOutlined className={styles.icon} />}
              className={styles.statistic}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card bordered={false} className={styles.card}>
            <Statistic
              title={t('Fees collected')}
              value={246.20}
              prefix={<DollarOutlined className={styles.icon} />}
              precision={2}
              className={styles.statistic}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatsCards;