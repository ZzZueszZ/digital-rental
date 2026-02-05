import { Button } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Data } from "./data";
import styles from './styles.module.less';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ChargerStatus = () => {
  const { t } = useTranslation();

  const data: Data = {
    available: 50,
    inUse: 20,
    offline: 10,
  };

  const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);

  const labels = [t('Available'), t('In use'), t('Offline')];
  const colors = ['#52c41a', '#1890ff', '#faad14'];
  const hoverColors = ['#46b149', '#1879d1', '#f7a513'];
  const values = [data.available, data.inUse, data.offline];

  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
         <h3>{t('Charger status')}</h3>
        <div className={styles.chartSection}>
          <div className={styles.chartContainer}>
            <Doughnut
              data={chartData}
              options={chartOptions}
            />
            <div className={styles.totalValue}>{total}</div>
          </div>

        </div>
      </div>

      <div className={styles.actionSection}>
        <Button type="default" className={styles.viewButton}>
          {t('View chargers')}
        </Button>
        <div className={styles.customLegend}>
            {labels.map((label, index) => (
              <div key={label} className={styles.legendItem}>
                <span
                  className={styles.dot}
                  style={{ backgroundColor: colors[index] }}
                />
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>
                  ({values[index]})
                </span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default ChargerStatus;
