import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { Print, PictureAsPdf } from '@mui/icons-material';
import HrServiceInstance from 'service/Service.hr';
import { convertToWords } from 'react-number-to-words';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import useAuth from 'hooks/useAuth';

// Interface for employee data
interface IHrEmployee {
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  RPT_NAME: string;
}

const ViewPayslipReport = () => {
  const { employeeId, month, year } = useParams<{ employeeId: string; month: string; year: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPrintView = searchParams.get('print') === 'true';
  const { user } = useAuth();

  // Validate if the selected year is current year
const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;
const isAllowedYear = year === currentYear.toString() || year === previousYear.toString();

  console.log('🔍 ViewPayslipReport - Initial params:', {
    employeeId,
    month, 
    year,
    currentUser: user?.loginid1,
    isAllowedYear
  });

  // Fetch supervisor employees data for permission check
  const { data: currentSupervisorEmployeeData, isLoading: isLoadingSupervisor } = useQuery<IHrEmployee[]>({
    queryKey: ['currentSupervisorEmployeeData', user?.loginid1],
    queryFn: async (): Promise<IHrEmployee[]> => {
      if (!user?.loginid1) {
        console.log(' No user ID for supervisor check');
        return [];
      }
      console.log('🔄 Fetching supervisor team for:', user.loginid1);
      
      try {
        // SQL query to get employees under this supervisor
        const sql = `
              SELECT DISTINCT *
              FROM (
                  SELECT *
                  FROM VW_HR_EMPLOYEE_AWARE
                  WHERE EMP_STATUS <> 'S'
                  START WITH 
                      EMPLOYEE_ID = '${user.loginid1}'
                      OR SUPERVISOR_EMPID = '${user.loginid1}'
                      OR DEPT_HEAD_EMPID = '${user.loginid1}'
                      OR MANGR_EMPID = '${user.loginid1}'
                  CONNECT BY NOCYCLE PRIOR EMPLOYEE_ID = SUPERVISOR_EMPID
                      OR PRIOR EMPLOYEE_ID = DEPT_HEAD_EMPID
                      OR PRIOR EMPLOYEE_ID = MANGR_EMPID
              )
        `;
        console.log('Supervisor SQL:', sql);
        
        const data = await HrServiceInstance.executeRawSql(sql);
        console.log('Supervisor team response:', data);
        
        if (Array.isArray(data)) {
          console.log(`✅ Found ${data.length} team members:`, data.map(e => `${e.EMPLOYEE_ID} - ${e.RPT_NAME}`));
          return data;
        }
        
        console.log(' No team members found');
        return [];
      } catch (err) {
        console.error('Error fetching supervisor team:', err);
        return [];
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  // Check if user has permission to view this payslip
  const hasPermission = React.useMemo(() => {
    console.log(' Checking permission...');
    console.log(' Current user:', user?.loginid1);
    console.log(' Requested employee:', employeeId);
    console.log(' Supervisor data loaded:', !isLoadingSupervisor);
    console.log(' Team members count:', currentSupervisorEmployeeData?.length || 0);
    console.log(' Team member IDs:', currentSupervisorEmployeeData?.map(e => e.EMPLOYEE_ID));

    // User can always view their own payslip
    if (user?.loginid1 === employeeId) {
      console.log(' Permission GRANTED: User viewing own payslip');
      return true;
    }
    
    // Supervisor can view payslips of employees under them
    if (!isLoadingSupervisor && currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0) {
      const isTeamMember = currentSupervisorEmployeeData.some(emp => {
        const isMatch = emp.EMPLOYEE_ID === employeeId;
        console.log(` Checking ${emp.EMPLOYEE_ID} === ${employeeId}: ${isMatch}`);
        return isMatch;
      });
      
      if (isTeamMember) {
        console.log('Permission GRANTED: Supervisor viewing team member payslip');
        return true;
      } else {
        console.log(' Permission DENIED: Employee not in supervisor team');
      }
    } else {
      console.log('Permission DENIED: Not supervisor or no team data');
    }
    
    console.log(' FINAL: Permission DENIED');
    return false;
  }, [user?.loginid1, employeeId, currentSupervisorEmployeeData, isLoadingSupervisor]);

  // SQL queries for payslip data (always defined, but conditionally enabled)
  const headerSql = `
    SELECT DISTINCT *
    FROM VW_BOHC_PAYSLIP_HDR 
    WHERE EMPLOYEE_ID = '${employeeId}' 
    AND PAY_MONTH = '${month}' 
    AND PAY_YEAR = '${year}'
  `;
  
  const earningsSql = `
    SELECT DISTINCT PAY_COMP_DESC, PAY_COMP_AMT, SORT_ORDER
    FROM VW_BOHC_PAYSLIP_DTL_EARNINGS 
    WHERE EMPLOYEE_ID = '${employeeId}' 
    AND PAY_MONTH = '${month}' 
    AND PAY_YEAR = '${year}'
    ORDER BY SORT_ORDER
  `;
  
  const deductionsSql = `
    SELECT DISTINCT PAY_COMP_DESC, PAY_COMP_AMT, SORT_ORDER
    FROM VW_BOHC_PAYSLIP_DTL_DEDUCTIONS 
    WHERE EMPLOYEE_ID = '${employeeId}' 
    AND PAY_MONTH = '${month}' 
    AND PAY_YEAR = '${year}'
    ORDER BY SORT_ORDER
  `;

  // Fetch data using useQuery - conditionally enabled based on permission
  const { data: headerData, isLoading: headerLoading, error: headerError } = useQuery({
    queryKey: ['payslip_header', employeeId, month, year],
    queryFn: () => HrServiceInstance.executeRawSql(headerSql),
    enabled: hasPermission && !!employeeId && !!month && !!year && isAllowedYear,
    refetchOnWindowFocus: false
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['payslip_earnings', employeeId, month, year],
    queryFn: () => HrServiceInstance.executeRawSql(earningsSql),
    enabled: hasPermission && !!employeeId && !!month && !!year && isAllowedYear,
    refetchOnWindowFocus: false
  });

  const { data: deductionsData, isLoading: deductionsLoading } = useQuery({
    queryKey: ['payslip_deductions', employeeId, month, year],
    queryFn: () => HrServiceInstance.executeRawSql(deductionsSql),
    enabled: hasPermission && !!employeeId && !!month && !!year && isAllowedYear,
    refetchOnWindowFocus: false
  });

  // Define isLoading here 
  const isLoading = headerLoading || earningsLoading || deductionsLoading;

  // Auto-print if in print view 
  React.useEffect(() => {
    if (isPrintView && !isLoading && headerData?.[0]) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isPrintView, isLoading, headerData]);

  // Show loading while checking permissions
  if (isLoadingSupervisor) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Checking access permissions...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show permission error if user doesn't have access
  if (!hasPermission) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Access Denied</Typography>
          You don't have permission to view this employee's payslip
        </Alert>
        
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            <strong>Debug Information:</strong><br />
            Current User: {user?.loginid1}<br />
            Requested Employee: {employeeId}<br />
            Is Supervisor: {currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0 ? 'Yes' : 'No'}<br />
            Team Members: {currentSupervisorEmployeeData?.length || 0}<br />
            Team IDs: {currentSupervisorEmployeeData?.map(e => e.EMPLOYEE_ID).join(', ') || 'None'}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
            size="large"
          >
            Back to Payslip Search
          </Button>
        </Box>
      </Container>
    );
  }

  // Show error if trying to access non-current year
  if (!isAllowedYear) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          You can only access payslips for the current year ({currentYear}). 
          Selected year: {year}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
          >
            Back to Search
          </Button>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (headerError || !headerData?.[0]) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {headerError ? 'Failed to load payslip data' : 'No payslip data found for the selected criteria'}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
          >
            Back to Search
          </Button>
        </Box>
      </Container>
    );
  }

  const header = headerData[0];
  const earnings = earningsData || [];
  const deductions = deductionsData || [];

  // Calculate totals
  const grossEarnings = header.GROSS_EARNINGS || earnings.reduce((sum: number, item: any) => sum + (item.PAY_COMP_AMT || 0), 0);
  const grossDeductions = header.GROSS_DEDUCTIONS || deductions.reduce((sum: number, item: any) => sum + (item.PAY_COMP_AMT || 0), 0);
  const netSalary = header.NET_SALARY || (grossEarnings - grossDeductions);

// Function to convert amount to words with dynamic currency
const convertAmountToWords = (amount: number, currency: string = 'RIALS'): string => {
  try {
    if (amount === 0) return `ZERO ${currency.toUpperCase()} ONLY`;
    
    // For Omani Rial (OMR) - use Rials and Baisa
    if (currency === 'OMR' || currency === 'RIALS') {
      const rials = Math.floor(amount);
      const baisa = Math.round((amount - rials) * 1000);
      
      let words = '';
      
      if (rials > 0) {
        words += convertToWords(rials).toUpperCase() + ' RIALS';
      }
      
      if (baisa > 0) {
        if (rials > 0) {
          words += ' AND ';
        }
        words += convertToWords(baisa).toUpperCase() + ' BAISA';
      }
      
      return words + ' ONLY';
    } 
    // For Indian Rupee (INR) - use Rupees and Paise
    else if (currency === 'INR' || currency === 'INDIAN RUPEE') {
      const rupees = Math.floor(amount);
      const paise = Math.round((amount - rupees) * 100);
      
      let words = '';
      
      if (rupees > 0) {
        words += convertToWords(rupees).toUpperCase() + ' RUPEES';
      }
      
      if (paise > 0) {
        if (rupees > 0) {
          words += ' AND ';
        }
        words += convertToWords(paise).toUpperCase() + ' PAISE';
      }
      
      return words + ' ONLY';
    }
    // For other currencies - use generic format
    else {
      const mainUnit = Math.floor(amount);
      const fractional = Math.round((amount - mainUnit) * 100);
      
      let words = '';
      
      if (mainUnit > 0) {
        words += convertToWords(mainUnit).toUpperCase() + ` ${currency.toUpperCase()}`;
      }
      
      if (fractional > 0) {
        if (mainUnit > 0) {
          words += ' AND ';
        }
        words += convertToWords(fractional).toUpperCase() + ' CENTS';
      }
      
      return words + ' ONLY';
    }
  } catch (error) {
    console.error('Error converting amount to words:', error);
    return 'AMOUNT IN WORDS UNAVAILABLE';
  }
};

  // Function to export PDF with improved styling
  const exportToPDF = async () => {
    const element = document.getElementById('payslip-content');
    if (!element) {
      alert('Cannot generate PDF: Payslip content not found');
      return;
    }

    try {
      // Create a clone of the element to modify for PDF without affecting the UI
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove only the back button from the clone, keep the header
      const backButton = clone.querySelector('.no-print');
      if (backButton) {
        backButton.remove();
      }
      
      // Smaller font size increase for PDF 
      const allElements = clone.querySelectorAll('*');
      allElements.forEach((el: any) => {
        if (el.style) {
          const computedStyle = window.getComputedStyle(el);
          const currentFontSize = computedStyle.fontSize;
          const currentSize = parseFloat(currentFontSize);
          
          if (!isNaN(currentSize)) {
            // 10% font size increase for PDF
            let newSize = currentSize * 1.1;
            
            // Apply different scaling for different element types
            if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6') {
              newSize = currentSize * 1.15; // headings
            }
            
            el.style.fontSize = `${newSize}px`;
            el.style.fontFamily = '"Segoe UI", Arial, sans-serif';
          }
        }
      });

      // Add the clone to the document temporarily (hidden)
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.backgroundColor = 'white';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: clone.scrollWidth,
        height: clone.scrollHeight,
      });

      // Remove the clone from document
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Payslip_${employeeId}_${month}_${year}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Function to print directly
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number): string => {
    return amount?.toFixed(3) || '0.000';
  };

  const getMonthName = (monthNum: string) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[parseInt(monthNum) - 1] || monthNum;
  };

  return (
    <Container maxWidth="lg">
      {/* Print buttons - hidden during actual printing */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 1, 
        mb: 2,
        '@media print': {
          display: 'none'
        }
      }}>
        <Tooltip title="Print">
          <IconButton onClick={handlePrint} color="primary">
            <Print />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download PDF">
          <IconButton onClick={exportToPDF} color="secondary">
            <PictureAsPdf />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper 
        id="payslip-content"
        elevation={3} 
        sx={{ 
          p: 3, 
          margin: '20px auto',
          '@media print': {
            boxShadow: 'none',
            margin: 0,
            p: 2,
            '& .no-print': {
              display: 'none !important'
            }
          }
        }}
      >
        {/* Header section - Properly centered */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1,
          borderBottom: '2px solid #1976d2',
          pb: 1,
        }}>
          <Button 
            className="no-print"
            variant="outlined" 
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
            sx={{ minWidth: '120px' }}
          >
            Back to Search
          </Button>
          
          {/* Centered header title */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#1976d2',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textAlign: 'center'
              }}
            >
              Employee Payslip
            </Typography>
          </Box>
          
          <Box sx={{ minWidth: '120px' }}></Box>
        </Box>

        {/* Employee Details - Split layout with left and right sections */}
        <Box sx={{ mb: 2, lineHeight: 1.1 }}>
          <Grid container spacing={1}>
            {/* Left Column - Employee Information */}
            <Grid item xs={12} md={7}>
              {/* Employee ID and Name */}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.85rem', 
                  mb: 1, 
                  fontWeight: 'bold'
                }}
              >
                Employee: {header.EMPLOYEE_ID} - {header.RPT_NAME}
              </Typography>
              
              {/* Employee Details */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Designation:</strong> {header.DESG_NAME}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Division:</strong> {header.DIV_NAME}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Department:</strong> {header.DEPT_NAME}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Section:</strong> {header.SECTION_NAME}
                </Typography>
              </Box>
            </Grid>
            
            {/* Right Column - Payment Information */}
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0.3,
                textAlign: 'right'
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Payment Mode:</strong> {header.PAYMENT_MODE} - {header.SALARY_ACCT_NO}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Period:</strong> {getMonthName(header.PAY_MONTH)} / {header.PAY_YEAR}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <strong>Currency:</strong> {header.CURR_NAME}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Earnings and Deductions Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
          <Table>
            <TableBody>
              <TableRow>
                {/* Earnings Column */}
                <TableCell width="50%" sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top', py: 0.5 }}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: '1rem', mb: 0.5, fontWeight: 'bold' }}>
                    Earnings
                  </Typography>
                  
                  <Box sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                      CURRENT MONTH PAY:
                    </Typography>
                  </Box>
                  
                  {earnings.length > 0 ? (
                    earnings.map((earning: any, index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{earning.PAY_COMP_DESC}</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>{formatCurrency(earning.PAY_COMP_AMT)}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>No earnings data available</Typography>
                  )}
                </TableCell>
                
                {/* Deductions Column */}
                <TableCell width="50%" sx={{ verticalAlign: 'top', py: 0.5 }}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: '1rem', mb: 0.5, fontWeight: 'bold' }}>
                    Deductions
                  </Typography>
                  
                  <Box sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                      &nbsp;
                    </Typography>
                  </Box>
                  
                  {deductions.length > 0 ? (
                    deductions.map((deduction: any, index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{deduction.PAY_COMP_DESC}</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>{formatCurrency(deduction.PAY_COMP_AMT)}</Typography>
                      </Box>
                    ))
                  ) : ( 
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>No deductions data available</Typography>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ minHeight: '45px', display: 'flex', alignItems: 'center' }}>
              <CardContent sx={{ textAlign: 'center', py: 0.25, width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 'bold', mb: 0.25 }}>
                  Gross Earnings
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                  {formatCurrency(grossEarnings)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ minHeight: '45px', display: 'flex', alignItems: 'center' }}>
              <CardContent sx={{ textAlign: 'center', py: 0.25, width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 'bold', mb: 0.25 }}>
                  Gross Deductions
                </Typography>
                <Typography variant="h6" color="error" sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                  {formatCurrency(grossDeductions)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Net Salary */}
        <Card sx={{ backgroundColor: '#e8f5e8', border: '2px solid #4caf50' }}>
          <CardContent sx={{ textAlign: 'center', py: 0.5 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 0.5 }}>
              Net Salary: {formatCurrency(netSalary)}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
              <Typography variant="body2" sx={{ 
                fontStyle: 'italic', 
                fontSize: '0.8rem',
                textAlign: 'center',
                color: '#49b436ff',
                lineHeight: 1.1,
                fontWeight: 'medium'
              }}>
              <strong>Amount : </strong>{convertAmountToWords(netSalary, header.CURR_NAME)} 
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default ViewPayslipReport;