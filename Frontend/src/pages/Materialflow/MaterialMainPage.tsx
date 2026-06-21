import { useState, useEffect } from 'react';
import { Tabs, Tab, Breadcrumbs, Link, Typography } from '@mui/material';
import useAuth from 'hooks/useAuth';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useInitializeUserLevel } from '../../shared/global-state';
// import MaterialrequestheaderPfPage from './MaterialrequestheaderPfPage';
// import MaterialrequestheaderPfPage from '../type/MaterialrequestheaderPfPage';
import MaterialrequestheaderPfPage from '../Materialflow/MaterialrequestheaderPfPage';
import InProgress from './MatInProgress';
import MatClosed from '../Materialflow/MatClosed';
import MatCancel from '../Materialflow/MatCancel';
import MatReject from '../Materialflow/MatReject';
// import PurchaseRequestTab1 from './PurchaseRequestTab1';
// import MyTaskClosedRequestTab from './MyTaskClosedRequestTab';
// import MyitemPOConfirm from '../Purchasefolder/MyitemPOConfirm';
// import MyitemPOCancel from '../Purchasefolder/MyitemPOCancel';
// import RejectedTab3 from '../Purchasefolder/RejectedTab3';

//import MyitemPOConfirm from './MyitemPOConfirm';
//import MyitemPOCancel from './MyitemPOCancel';

const MaterialMainPage = () => {
  useInitializeUserLevel();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [, setCostUser] = useState(null);

  useEffect(() => {
    const fetchCostUser = async () => {
      if (!user) return;

      try {
        const result = await GmPfServiceInstance.CheckCostcontroller(user.loginid, user.company_code);
        setCostUser(result);
      } catch (error) {
        console.error('Error fetching costUser:', error);
      }
    };

    fetchCostUser();
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/pf/activity">
            Activity
          </Link>
          <Link underline="hover" color="inherit" href="/pf/activity/request">
            Request
          </Link>
          <Typography color="text.primary">Material Request</Typography>
        </Breadcrumbs>
        <Tabs
          TabIndicatorProps={{
            style: { display: 'none' }
          }}
          sx={{
            mb: 1,
            // borderBottom: '1px solid #082A89',
            minHeight: '32px',
            '& .MuiTab-root': {
              color: '#082A89',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              minHeight: '32px',
              padding: '10px 12px',
              fontSize: '0.95rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#E8EBF7',
                color: '#082A89'
              },
              '&.Mui-selected': {
                color: '#082A89',
                backgroundColor: '#C5CDE8'
              }
            }
          }}
          value={activeTab}
          variant="scrollable"
          scrollButtons="auto"
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          {['Pending', 'In Progress', 'Closed', 'Cancel', 'Rejected'].map((label, index) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <div className="">
          {activeTab === 0 && <MaterialrequestheaderPfPage />}
          {activeTab === 1 && <InProgress />}
          {activeTab === 2 && <MatClosed />}
          {activeTab === 3 && <MatCancel />}
          {activeTab === 4 && <MatReject />}
        </div>
      </div>
    </div>
  );
};

export default MaterialMainPage;
