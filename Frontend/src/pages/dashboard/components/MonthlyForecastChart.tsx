import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface Props {
  data: any[];
}

const MonthlyForecastChart = ({ data }: Props) => {
  const theme = useTheme();

  const options: ApexOptions = {
    chart: {
      type: 'line' as const,
      height: 350
    },
    stroke: {
      curve: 'smooth' as const
    },
    colors: [theme.palette.primary.main, theme.palette.success.main],
    xaxis: {
      categories: data.map((item) => item.month) || []
    },
    yaxis: {
      title: {
        text: 'Value (AED)'
      }
    }
  };

  const series = [
    {
      name: 'Forecast',
      data: data.map((item) => item.forecast) || []
    },
    {
      name: 'Actual',
      data: data.map((item) => item.actual) || []
    }
  ];

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
};

export default MonthlyForecastChart;
