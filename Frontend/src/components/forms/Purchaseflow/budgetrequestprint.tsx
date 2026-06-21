import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TBasicBrequest, TMonthCostWiseInfo, TMonthProjectWiseInfo } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { ImExit } from 'react-icons/im';

interface BudgetRequestFormprintProps {
  open: boolean;
  onClose: () => void;
  requestNumber: string;
  onConfirm?: () => void;
}

const BudgetRequestFormprint: React.FC<BudgetRequestFormprintProps> = ({ open, onClose, requestNumber, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [TMonthCostWiseInfodata, setTMonthCostWiseInfodata] = useState<TMonthCostWiseInfo[]>([]);
  const [TMonthProjectWiseInfodata, setTMonthProjectWiseInfodata] = useState<TMonthProjectWiseInfo[]>([]);

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await GmPfServiceInstance.getBudgetRequestNumber(requestNumber);
        const { TMonthCostWiseInfodata, TMonthProjectWiseInfodata } = response as {
          budgetRequests: TBasicBrequest[];
          TMonthCostWiseInfodata: TMonthCostWiseInfo[];
          TMonthProjectWiseInfodata: TMonthProjectWiseInfo[];
        };

        const formattedCostWiseData: TMonthCostWiseInfo[] = (TMonthCostWiseInfodata || [])
          .map((item: any) => ({
            project_code: item.PROJECT_CODE, // Fix: Ensure correct field name
            project_name: item.PROJECT_NAME, // Fix: Ensure correct field name
            cost_code: item.COST_CODE,
            company_code: item.COMPANY_CODE,
            requested_amt: Number(item.REQUESTED_AMT) || 0,
            req_appr_amt: Number(item.REQ_APPROVED_AMT) || 0,
            req_approved_amt: Number(item.REQ_APPROVED_AMT) || 0,
            month_budget: item.MONTH_BUDGET as
              | 'Jan'
              | 'Feb'
              | 'Mar'
              | 'Apr'
              | 'May'
              | 'Jun'
              | 'Jul'
              | 'Aug'
              | 'Sep'
              | 'Oct'
              | 'Nov'
              | 'Dec',
            budget_year: item.BUDGET_YEAR,
            approved_amt: Number(item.APPROVED_AMT) || 0,
            po_amount: Number(item.PO_AMOUNT) || 0,
            pr_amount: Number(item.PR_AMOUNT) || 0,
            remarks: item.REMARKS || '-'
          }))
          .filter((item) => item.requested_amt > 0); // ✅ Filter applied

        const formattedProjectWiseData: TMonthProjectWiseInfo[] = (TMonthProjectWiseInfodata || [])
          .map((item: any) => ({
            project_code: item.PROJECT_CODE, // Fix: Ensure correct field name
            project_name: item.PROJECT_NAME, // Fix: Ensure correct field name
            company_code: item.COMPANY_CODE,
            requested_amt: Number(item.REQUESTED_AMT) || 0,
            req_appr_amt: Number(item.REQ_APPROVED_AMT) || 0,
            req_approved_amt: Number(item.REQ_APPROVED_AMT) || 0,
            month_budget: item.MONTH_BUDGET as
              | 'Jan'
              | 'Feb'
              | 'Mar'
              | 'Apr'
              | 'May'
              | 'Jun'
              | 'Jul'
              | 'Aug'
              | 'Sep'
              | 'Oct'
              | 'Nov'
              | 'Dec',
            budget_year: item.BUDGET_YEAR,
            approved_amt: Number(item.APPROVED_AMT) || 0,
            po_amount: Number(item.PO_AMOUNT) || 0,
            pr_amount: Number(item.PR_AMOUNT) || 0,
            remarks: item.REMARKS || '-'
          }))
          .filter((item) => item.requested_amt > 0); // ✅ Filter applied

        setTMonthCostWiseInfodata(formattedCostWiseData);
        setTMonthProjectWiseInfodata(formattedProjectWiseData);
      } catch (err) {
        setError('Unable to fetch budget request data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && requestNumber) {
      fetchData();
    }
  }, [open, requestNumber]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Budget Request Report</DialogTitle>
      <DialogContent ref={contentRef}>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && (
          <>
            {/* Display Request Number, Project Code, and Project Name */}
            <Typography variant="h6">Request Number: {requestNumber.replace(/\$/g, '/')}</Typography>

            {/* Cost-wise Budget Table */}
            <Typography variant="h6" mt={2}>
              Cost-wise Budget
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Code</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Cost Code</TableCell>
                    <TableCell>Requested Amt</TableCell>
                    <TableCell>Approved Amt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TMonthCostWiseInfodata.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.project_code}</TableCell>
                      <TableCell>{item.month_budget}</TableCell>
                      <TableCell>{item.budget_year}</TableCell>
                      <TableCell>{item.cost_code}</TableCell>
                      <TableCell>{item.requested_amt}</TableCell>
                      <TableCell>{item.req_approved_amt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Project-wise Budget Table */}
            <Typography variant="h6" mt={2}>
              Project-wise Budget
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Code</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Requested Amt</TableCell>
                    <TableCell>Approved Amt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TMonthProjectWiseInfodata.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.project_code}</TableCell>
                      <TableCell>{item.month_budget}</TableCell>
                      <TableCell>{item.budget_year}</TableCell>
                      <TableCell>{item.requested_amt}</TableCell>
                      <TableCell>{item.req_approved_amt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button size="large" color="secondary" onClick={onClose}>
          <ImExit />
        </Button>
        {/* <Button onClick={onConfirm} color="primary" variant="contained">
          Confirm
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default BudgetRequestFormprint;
