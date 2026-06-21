import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface Props {
  data: any[];
}

const SegmentPerformanceChart = ({ data }: Props) => {
  const theme = useTheme();

  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      height: 400
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true
      }
    },
    colors:  [
      theme.palette.primary.main,
      '#808080', '#00E396', '#FF4560', '#FEB019', '#00BFFF', '#00b0fbaa', '#A3A3A3'
    ],
    
    xaxis: {
      categories: data.map((item) => item.segment) || []
    }
  };

  const series = [
    {
      name: 'Performance',
      data: data.map((item) => item.performance) || []
    }
  ];

  return <ReactApexChart options={options} series={series} type="bar" height={400} />;
};

export default SegmentPerformanceChart;
