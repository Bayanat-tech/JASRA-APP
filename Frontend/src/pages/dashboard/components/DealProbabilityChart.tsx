import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DealData {
  probability: string;
  count: number;
}

interface Props {
  data: DealData[];
}

const DealProbabilityChart = ({ data }: Props) => {
  const theme = useTheme();

  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: data.map((item) => item.probability) || []
    },
    yaxis: {
      title: {
        text: 'Deal Count'
      }
    }
  };

  const series = [
    {
      name: 'Deals',
      data: data.map((item) => item.count) || []
    }
  ];

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
};

export default DealProbabilityChart;
