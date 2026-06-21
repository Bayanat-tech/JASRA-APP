import { useEffect, useState } from 'react';
import { Tabs, Tab, useTheme, Button } from '@mui/material';
//import useAuth from 'hooks/useAuth';
//import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useInitializeUserLevel } from '../../../shared/global-state';
// import PurchaseRequest from './PurchaseRequestTab1';
// import MyTaskClosedRequestTab from './MyTaskClosedRequestTab';
// import MyitemPOConfirm from '../Purchasefolder/MyitemPOConfirm';
// import MyitemPOCancel from '../Purchasefolder/MyitemPOCancel';
// import RejectedTab3 from '../Purchasefolder/RejectedTab3';
import HRLLeaveApprovalPage from '../HRFlow/HRLLeaveApprovalPage';
import { useIntl } from 'react-intl';
import { Breadcrumbs, Link, Typography } from '@mui/material';
//import CustomAlert from 'components/@extended/CustomAlert';
import HRLClosedRequest from './HRLClosedRequest';
import HRLInProgress from './HRLInProgress';
import HRLCancelRequest from './HRLCancelRequest';
import HRLRejectedRequest from './HRLRejectedRequest';
import { useQuery } from '@tanstack/react-query';
import useAuth from 'hooks/useAuth';
import HrRequestServiceInstance, { IHrEmployee } from 'service/services.hr';

const HRMainPage = () => {
  useInitializeUserLevel();

  const intl = useIntl();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [CreateMode, setCreateMode] = useState(false);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | null>(null);

  // Query to get logged-in user's employee data only
  const { data: currentUserEmployeeData } = useQuery<IHrEmployee | null, Error>({
    queryKey: ['current-user-employee', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      try {
        const data = await HrRequestServiceInstance.getEmployees(user?.loginid1 || '');
        return data[0] || null;
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  console.log('employeeData', currentUserEmployeeData);
  const [supervisor, setSupervisor] = useState<boolean>(false);
  console.log('supervisor', supervisor);

  // Fixed safeCompare function
  const safeCompare = (a: string | undefined | null | {}, b: string | undefined | null | {}) => {
    // Handle empty objects {} by converting to string and checking if they're empty
    const stringA = typeof a === 'object' && Object.keys(a || {}).length === 0 ? '' : String(a || '');
    const stringB = typeof b === 'object' && Object.keys(b || {}).length === 0 ? '' : String(b || '');

    return stringA.trim() === stringB.trim() && stringA.trim() !== '';
  };

  useEffect(() => {
    if (!user?.loginid1) return;

    // Improved helper function to handle empty objects {}
    const isEmptyValue = (value: any) => {
      if (value === undefined || value === null) return true;
      if (typeof value === 'object' && Object.keys(value).length === 0) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      return false;
    };

    // Check if any of the supervisor names are empty (handling empty objects)
    const namesEmpty =
      isEmptyValue(currentUserEmployeeData?.SUPERVISOR_NAME) ||
      isEmptyValue(currentUserEmployeeData?.DEPT_HEAD_NAME) ||
      isEmptyValue(currentUserEmployeeData?.MANAGER_NAME);

    // Check if current user is a supervisor based on employee ID matches
    const isSupervisor =
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.DEPT_HEAD_EMPID) ||
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.SUPERVISOR_EMPID) ||
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.MANGR_EMPID) ||
      namesEmpty;

    console.log('Supervisor check details:', {
      isSupervisor,
      namesEmpty,
      employeeId: currentUserEmployeeData?.EMPLOYEE_ID,
      deptHead: currentUserEmployeeData?.DEPT_HEAD_EMPID,
      supervisor: currentUserEmployeeData?.SUPERVISOR_EMPID,
      manager: currentUserEmployeeData?.MANGR_EMPID,
      supervisorName: currentUserEmployeeData?.SUPERVISOR_NAME,
      deptHeadName: currentUserEmployeeData?.DEPT_HEAD_NAME,
      managerName: currentUserEmployeeData?.MANAGER_NAME
    });

    setSupervisor(isSupervisor);
  }, [user?.loginid1, currentUserEmployeeData]);

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Home' }) || 'Home'}
        </Link>

        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Activity' }) || 'Activity'}
        </Link>

        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Request' }) || 'Request'}
        </Link>

        <Typography color="text.primary">{intl.formatMessage({ id: 'Leave Request' }) || 'Leave Request'}</Typography>
      </Breadcrumbs>{' '}
      <div className="flex justify-end space-x-2 mb-4">
        <Button
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          disabled={activeTab === 0 ? false : true}
          variant="contained"
          onClick={() => {
            setSelectedRequestNumber?.(null);
            setShowFormDialog?.(true);
            setCreateMode?.(true);
          }}
        >
          {intl.formatMessage({ id: 'Add Leave Request' }) || 'Add Leave Request'}
        </Button>
      </div>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          backgroundColor: theme.palette.grey[100],
          '& .MuiTabs-indicator': {
            backgroundColor: '#082A89',
            height: '3px'
          },
          '& .MuiTab-root': {
            transition: 'all 0.3s ease',
            borderRadius: '8px 8px 0 0',
            margin: '0 2px',
            textTransform: 'none',
            fontWeight: 500,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(8, 42, 137, 0.08)',
              color: '#082A89'
            }
          },
          '& .Mui-selected': {
            backgroundColor: '#fff',
            color: '#082A89 !important',
            fontWeight: 600,
            border: '2px solid #082A89',
            borderBottom: 'none',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: '-2px',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: '#fff',
              zIndex: 1
            }
          }
        }}
      >
       
        {/* {supervisor && (
          <Tab sx={{ textTransform: 'none' }} label={intl.formatMessage({ id: 'Approve Leave Request' }) || 'Approve Leave Request'} />
        )}
        {supervisor && (
          <Tab sx={{ textTransform: 'none' }} label={intl.formatMessage({ id: 'Approve Leave Resumption' }) || 'Approve Leave Request'} />
        )} */}
        <Tab label={intl.formatMessage({ id: 'Leave Request' }) || 'Leave Request'} />
        <Tab label={intl.formatMessage({ id: 'In Progress' }) || 'In Progress'} />
        <Tab label={intl.formatMessage({ id: 'Closed' }) || 'Closed'} />
        <Tab label={intl.formatMessage({ id: 'CancelN' }) || 'CancelN'} />
        <Tab label={intl.formatMessage({ id: 'Rejected' }) || 'Rejected'} />
      </Tabs>
      <div>
        {activeTab === 0 && (
          <HRLLeaveApprovalPage
            LeavePage={true}
            CreateMode={CreateMode}
            showFormDialog={showFormDialog}
            setShowFormDialog={setShowFormDialog}
            selectedRequestNumber={selectedRequestNumber}
            setSelectedRequestNumber={setSelectedRequestNumber}
          />
        )}
        {/* {supervisor && activeTab === 1 && (
          <HRLLeaveApprovalPageBySupervisor
            showFormDialog={showFormDialog}
            setShowFormDialog={setShowFormDialog}
            selectedRequestNumber={selectedRequestNumber}
            setSelectedRequestNumber={setSelectedRequestNumber}
          />
        )} */}
        {/* {activeTab ===  1 && <ApproveLeaveResumption />} */}
        {activeTab === 1 && <HRLInProgress />}
        {activeTab === 2 && <HRLClosedRequest />}
        {activeTab === 3 && <HRLCancelRequest />}
        {activeTab === 4 && <HRLRejectedRequest />}
      </div>
    </div>
  );
};

export default HRMainPage;
