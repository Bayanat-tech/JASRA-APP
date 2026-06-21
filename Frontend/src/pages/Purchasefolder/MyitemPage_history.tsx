import { useState, useEffect } from 'react';
import { Tabs, Tab, Breadcrumbs, Link, Typography } from '@mui/material';
import useAuth from 'hooks/useAuth';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useInitializeUserLevel, gs_userlevel } from '../../shared/global-state';
import MyitemPOConfirm from './MyItemPOconfirmhistory';
import MyitemPOCancel from './MyItemPOCancel_history';
import RejectedTab3 from './RejectedTab3_history';
const MyitemPage_history = () => {
  useInitializeUserLevel();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [costUser, setCostUser] = useState(null);
  console.log('gs_userlevel in MyTaskPage:', gs_userlevel);
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
          <Typography color="text.primary">My Task</Typography>
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
          {[
            // 'Pending',
            // 'In Progress',
            'Closed',
            'Cancel',
            'Rejected',
            // ...(gs_userlevel === 5 ? ['PO Gen Pending'] : [])
          ].map((label, index) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <div className="">
          {activeTab === 0 && <MyitemPOConfirm costUser={costUser} userlevel={gs_userlevel ?? 0} />}
          {activeTab === 1 && <MyitemPOCancel costUser={costUser} />}
          {activeTab === 2 && <RejectedTab3 costUser={costUser} />}
          {/* {gs_userlevel === 5 && activeTab === 5 && <Ponotgenerated costUser={costUser} userlevel={gs_userlevel} />} */}
        </div>
      </div>
    </div>
  );
};

export default MyitemPage_history;
