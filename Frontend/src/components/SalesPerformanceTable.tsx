import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Props {
  data: Array<{
    sales_name: string;
    target: number;
    achievement: number;
    pipeline: number;
    performance: number;
  }>;
}

const SalesPerformanceTable = ({ data }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sales Person</TableCell>
            <TableCell align="right">Target</TableCell>
            <TableCell align="right">Achievement</TableCell>
            <TableCell align="right">Pipeline</TableCell>
            <TableCell align="right">Performance (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.sales_name}>
              <TableCell>{row.sales_name}</TableCell>
              <TableCell align="right">{row.target}</TableCell>
              <TableCell align="right">{row.achievement}</TableCell>
              <TableCell align="right">{row.pipeline}</TableCell>
              <TableCell align="right">{row.performance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SalesPerformanceTable;
