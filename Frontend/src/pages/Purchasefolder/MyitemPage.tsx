import { useState, useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';
import useAuth from 'hooks/useAuth';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useInitializeUserLevel, gs_userlevel } from '../../shared/global-state';
import PurchaseRequest from './PurchaseRequestTab1';
import MyTaskClosedRequestTab from './MyTaskClosedRequestTab';
import MyitemPOConfirm from '../Purchasefolder/MyitemPOConfirm';
import MyitemPOCancel from '../Purchasefolder/MyitemPOCancel';
import RejectedTab3 from '../Purchasefolder/RejectedTab3';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import CustomAlert from 'components/@extended/CustomAlert';

const MyItemPage = () => {
  useInitializeUserLevel();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [costUser, setCostUser] = useState(null);

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
    <div>
      <CustomAlert />
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
        <Typography color="text.primary">My Item</Typography>
      </Breadcrumbs>{' '}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
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
      >
        <Tab sx={{ textTransform: 'none' }} label="Pending" />
        <Tab label="In Progress " />
        <Tab label="Closed " />

        <Tab label="Cancel" />
        <Tab label="Rejected" />
      </Tabs>
      <div className="">
        {activeTab === 0 && <PurchaseRequest costUser={costUser} userlevel={gs_userlevel ?? 0} />}
        {activeTab === 1 && <MyTaskClosedRequestTab costUser={costUser} />}
        {activeTab === 2 && <MyitemPOConfirm costUser={costUser} />}
        {activeTab === 3 && <MyitemPOCancel costUser={costUser} />}
        {activeTab === 4 && <RejectedTab3 costUser={costUser} />}
      </div>
    </div>
  );
};

export default MyItemPage;
