import { useState } from 'react';
import { Tabs, Tab, useTheme } from '@mui/material';
import { useInitializeUserLevel } from '../../../shared/global-state';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import CustomAlert from 'components/@extended/CustomAlert';
import LeaveResumptionApprovalPage from './LeaveResumptionApprovalPage';
import HRLeaveResumptionInProgress from './HRLeaveResumptionInProgress';
import HRLeaveResumptionClosedRequest from './HRLeaveResumptionClosedRequest';
import HRLeaveResumptionCancelRequest from './HRLeaveResumptionCancelRequest';
// import HRLeaveResumptionRejectedRequest from './HRLeaveResumptionRejectedRequest';
import { useIntl } from 'react-intl';

const HRLeaveResumptionMainPage = () => {
  useInitializeUserLevel();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
 const intl = useIntl();
  return (
    <div>
      <CustomAlert />
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
        {intl.formatMessage({ id: 'Home' }) || 'Home'}
      </Link>
      <Link underline="hover" color="inherit" href="/pf/activity">
        {intl.formatMessage({ id: 'Activity' }) || 'Activity'}
      </Link>
      <Link underline="hover" color="inherit" href="/pf/activity/request">
        {intl.formatMessage({ id: 'Request' }) || 'Request'}
      </Link>
         <Typography color="text.primary">
      {intl.formatMessage({ id: 'Leave Resumption' }) || 'Leave Resumption'}
    </Typography>
      </Breadcrumbs>

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
        <Tab sx={{ textTransform: 'none' }} label={intl.formatMessage({ id: 'Leave Resumption' }) || 'Leave Resumption'} />
      <Tab label={intl.formatMessage({ id: 'In Progress' }) || 'In Progress'} />
      <Tab label={intl.formatMessage({ id: 'Closed' }) || 'Closed'} />
      <Tab label={intl.formatMessage({ id: 'CancelN' }) || 'CancelN'} />
      {/* <Tab label={intl.formatMessage({ id: 'Rejected' }) || 'Rejected'} /> */}
      </Tabs>

      <div className="">
        {activeTab === 0 && <LeaveResumptionApprovalPage />}
        {activeTab === 1 && <HRLeaveResumptionInProgress />}
        {activeTab === 2 && <HRLeaveResumptionClosedRequest />}
        {activeTab === 3 && <HRLeaveResumptionCancelRequest />}
        {/* {activeTab === 4 && <HRLeaveResumptionRejectedRequest />} */}
      </div>
    </div>
  );
};

export default HRLeaveResumptionMainPage;
