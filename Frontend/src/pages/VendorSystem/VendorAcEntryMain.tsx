import { useState } from 'react';
import { Tabs, Tab, useTheme, Button } from '@mui/material';
import { useInitializeUserLevel } from '../../shared/global-state';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import CustomAlert from 'components/@extended/CustomAlert';
import VendorAcEntry from 'pages/VendorSystem/VendorAcEntry';
// import VendorInProgress from 'pages/VendorSystem/VendorInProgress';
// import VendorClose from 'pages/VendorSystem/VendorClose';
// import VendorCancel from 'pages/VendorSystem/VendorCancel';
// import VendorReject from 'pages/VendorSystem/VendorReject';
import { useIntl } from 'react-intl'

const VendorAcEntryMain = () => {
  useInitializeUserLevel();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
    const intl = useIntl();
  const [triggerAddPopup, setTriggerAddPopup] = useState(false);
  // For Add Vendor Request button (if needed later)
  // const [showFormDialog, setShowFormDialog] = useState(false);
  // const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | null>(null);

  return (
    <div>
      <CustomAlert />

      {/* Breadcrumbs */}
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
  {intl.formatMessage({ id: 'VendorRequest' }) || 'Vendor Request'}
</Typography>
      </Breadcrumbs>

      {/* Add Vendor Request Button */}
      <div className="flex justify-end space-x-2 ">
        <Button
          startIcon={<PlusOutlined />}
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
          variant="contained"
          onClick={() => setTriggerAddPopup(true)}
        >
          Add Invoice
        </Button>
      </div>

      {/* Tabs */}
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
        <Tab label={intl.formatMessage({ id: 'Draft' }) || 'Draft'} />
        {/* <Tab label="In Progress" />
        <Tab label="Closed" /> */}
      </Tabs>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && <VendorAcEntry triggerAddPopup={triggerAddPopup} onAddPopupHandled={() => setTriggerAddPopup(false)} />}
        {/* {activeTab === 1 && <VendorInProgress triggerAddPopup={triggerAddPopup} onAddPopupHandled={() => setTriggerAddPopup(false)} />} */}
        {/* {activeTab === 2 && <VendorClose triggerAddPopup={triggerAddPopup} onAddPopupHandled={() => setTriggerAddPopup(false)} />} */}
        {/* Uncomment when ready */}
        {/* {activeTab === 3 && <VendorCancel />} */}
        {/* {activeTab === 4 && <VendorReject />} */}
      </div>
    </div>
  );
};

export default VendorAcEntryMain;
