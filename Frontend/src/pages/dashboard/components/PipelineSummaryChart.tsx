import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface PipelineData {
  status: string;
  value: number;
  data?: any;
  id?: string;
  name?: string;
}

interface Props {
  data: PipelineData[];
}
// Check your types/dashboard.types.ts file
export interface DashboardResponse {
  // What properties does this have?
  data?: PipelineData[];
  tableData?: PipelineData[];
  items?: PipelineData[];
  // or maybe it extends an array?
}

const PipelineSummaryChart = ({ data }: Props) => {
  const theme = useTheme();

  //mapping deal_status into 3 groups:
  const statusdata: Record<string, string> = {
    Qualify: "New",
    Negotiation: "New",
    Quoted: "In Progress",
    Delayed: "Delayed", 
    Won: "Closed",
    Lost: "Closed",
    Cancelled: "Closed"
  };

  // Grouping data
 const grouped = data.reduce<Record<string, number>>((acc, item) => {
    const status = statusdata[item.status] || 'Unknown';
    acc[status] = (acc[status] || 0) + (Number(item.value) || 0);
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const series = Object.values(grouped);

  const options: ApexOptions = {
    chart: {
      type: 'donut' as const,
      height: 350
    },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main,theme.palette.error.main],
    // labels: ['New', 'In Progress', 'Closed'],
     labels:labels, 
    legend: {
      show: true,
      position: 'bottom' as const
    }
  };

  // const series = data.map((item) => item.value) || [0, 0, 0];


  return <ReactApexChart options={options} series={series} type="donut" height={350} />;
};

export default PipelineSummaryChart;
