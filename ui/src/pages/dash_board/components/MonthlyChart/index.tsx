import { Card, Radio, Button, DatePicker } from 'antd';
import { Column } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import styles from './styles.module.less';

const { RangePicker } = DatePicker;

const MonthlyChart = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(11, 'month').startOf('month'),
    dayjs().endOf('month')
  ]);

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        dates[0].startOf('month'),
        dates[1].endOf('month')
      ]);
    }
  };

  const data = [
    { month: 'Oct', value: 100 },
    { month: 'Nov', value: 120 },
    { month: 'Dec', value: 90 },
    { month: 'Jan', value: 150 },
    { month: 'Feb', value: 180 },
    { month: 'Mar', value: 220 },
    { month: 'Apr', value: 160 },
    { month: 'May', value: 200 },
    { month: 'Jun', value: 140 },
    { month: 'Jul', value: 120 },
    { month: 'Aug', value: 140 },
    { month: 'Sep', value: 100 },
  ];

  const config = {
    data,
    xField: 'month',
    yField: 'value',
    columnWidthRatio: 0.3,
    color: '#1890ff',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      month: {
        alias: t('Month'),
      },
      value: {
        alias: t('Value'),
      },
    },
  };

  return (
    <Card className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <Radio.Group defaultValue="sessions">
          <Radio.Button value="sessions">{t('Sessions')}</Radio.Button>
          <Radio.Button value="energy">{t('Energy used')}</Radio.Button>
          <Radio.Button value="fees">{t('Fees collected')}</Radio.Button>
        </Radio.Group>

        <div className={styles.dateRange}>
          <RangePicker
            picker="month"
            value={dateRange}
            onChange={handleRangeChange}
            allowClear={false}
            format="MMM YYYY"
          />
          <Button>{t('Export CSV')}</Button>
        </div>
      </div>

      <Column {...config} height={300} />
    </Card>
  );
};

export default MonthlyChart;