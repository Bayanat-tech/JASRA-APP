import { ArrowLeftOutlined, EyeOutlined, PrinterOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';

import { AppBar, Button, IconButton, List, ListItem, Paper, Skeleton, Tab, Tabs, Typography, useTheme } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useQuery } from '@tanstack/react-query';
import WmsReportView from 'components/reports/WmsReportView';

import UniversalDialog from 'components/popup/UniversalDialog';

import ConfirmInboundJobWmsTab from 'components/tabs/wms/transaction/inbound/ConfirmInboundJobWmsTab';
import PackingDetailsWmsTab from 'components/tabs/wms/transaction/inbound/PackingDetailsWmsTab';
import TallyDetailsWmsTab from 'components/tabs/wms/transaction/inbound/TallyDetailsWmsTab';
import PutwayDetailsWmsTab from 'components/tabs/wms/transaction/inbound/PutwayDetailsWmsTab';
import PutwayManualWmsTab from 'components/tabs/wms/transaction/inbound/PutwayManualWmsTab';
import ReceivingDetailsWmsTab from 'components/tabs/wms/transaction/inbound/ReceivingDetailsWmsTab';
import QualityClearanceDetailsWmsTab from 'components/tabs/wms/transaction/inbound/QualityClearanceWmsTab';
import ShipmentDetailsWmsTab from 'components/tabs/wms/transaction/inbound/ShipmentDetailsWmsTab';
import AddShipmentWmsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundShipmentDetailsForm';
import AddInboundTallyDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundTallyDetailsForm';
import AddInboundPackingDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundPackingDetailsForm';
import AddInboundReceivingDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundReceivingDetailsForm';
import QualityClearanceModal from 'components/forms/Wms/Transaction/QualityClearanceModal';
import PutwayDetailsModal from 'components/forms/Wms/Transaction/PutwayDetailsModal';
import PutawayHHTDetails from 'components/tabs/wms/transaction/inbound/PutawayHHTDetails'; // Ensure this component forwards refs
import useAuth from 'hooks/useAuth';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import { useLocation, useNavigate, useParams } from 'react-router';

import WmsSerivceInstance from 'service/wms/service.wms';
import InboundJobServiceInstance from 'service/wms/transaction/inbound/service.inboundJobWms';
// import putwayServiceInstance from 'service/wms/transaction/inbound/service.putwayDetailsWms';
// import inbjobconfirmServiceInstance from 'service/wms/transaction/inbound/service.inboundConfirmWms';

import { useSelector } from 'store';

import { TPair } from 'types/common';
import { JobReportsT } from 'types/common.types';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

import ErrorBoundary from 'utils/ErrorHandlers/Erroroundary';

import { getPathNameList } from 'utils/functions';

import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { TInboundjobconfirm } from 'pages/WMS/Transaction/Inbound/types/confirmjobInbound_wms.types';
import Alert from 'antd/es/alert';
import AddManualPutawayForm from 'components/forms/Wms/Transaction/Inbound/AddManualPutawayForm';
import ActivityBillingTab from 'components/tabs/wms/transaction/inbound/ActivityBillingTab';
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  value: string;
}
const InboundJobTabsWmsPage = () => {
  //--------------------------constants------------------------

  const { user_permission, permissions } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const { tab, id } = useParams();
  const allTabs: TPair<''>[] = [
    { label: 'Shipment Details', value: 'shipment_details' },
    { label: 'Packing Details', value: 'packing_details' },
    { label: 'Receiving Details', value: 'receiving_details' },
    { label: 'Tally Details', value: 'tally_details' },
    { label: 'Putaway Details', value: 'putway_details' },
    { label: 'Putaway Manual', value: 'putway_manual' },
    { label: 'Putaway (HHT/RFID/AR)', value: 'putway_hht' },
    { label: 'Job Confirmation', value: 'job_confirmation' },
    { label: 'Activity Billing', value: 'activity_billing' }
  ];
  // Tabs for manual putaway jobs
  const manualPutawayTabs: TPair<''>[] = [
    { label: 'Shipment Details', value: 'shipment_details' },
    { label: 'Putaway Manual', value: 'putway_manual' },
    { label: 'Job Confirmation', value: 'job_confirmation' },
    { label: 'Activity Billing', value: 'activity_billing' }
  ];

  // Tabs for normal (HHT/RFID/AR) jobs
  const normalHhtTabs: TPair<''>[] = [
    { label: 'Shipment Details', value: 'shipment_details' },
    { label: 'Packing Details', value: 'packing_details' },
    { label: 'Quality Clearance', value: 'quality_clearance' },
    { label: 'Tally Details', value: 'tally_details' },
    { label: 'Putaway (HHT/RFID/AR)', value: 'putway_hht' },
    { label: 'Job Confirmation', value: 'job_confirmation' },
    { label: 'Activity Billing', value: 'activity_billing' }
  ];

  // Tabs for normal jobs
  const normalJobTabs: TPair<''>[] = [
    { label: 'Shipment Details', value: 'shipment_details' },
    { label: 'Packing Details', value: 'packing_details' },
    { label: 'Receiving Details', value: 'receiving_details' },
    { label: 'Quality Clearance', value: 'quality_clearance' },
    { label: 'Putaway Details', value: 'putway_details' },
    { label: 'Job Confirmation', value: 'job_confirmation' },
    { label: 'Activity Billing', value: 'activity_billing' }
  ];

  const [selectedTab, setSelectedTab] = useState<string>('shipment_details');
  const [printPopup, setPrintPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: <FormattedMessage id="Print Job" />,
    data: { isPrintMode: false }
  });
  const [previewReportPopup, setPreviewReportPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: { selectedReport: null }
  });
  // Add state for Add Shipment popup
  const [shipmentFormPopup, setShipmentFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Shipment Detail" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for Add Tally Detail popup
  const [tallyFormPopup, setTallyFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Tally Detail" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for Add Packing popup
  const [packingFormPopup, setPackingFormPopup] = useState<TUniversalDialogProps>({
    action: {
      fullWidth: false,
      open: false,
      maxWidth: 'xs'
    },
    // title: <FormattedMessage id="Add Packing Detail" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for Add Receivables popup
  const [receivablesFormPopup, setReceivablesFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Receivables" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for selected rows from quality clearance tab
  const [selectedQualityClearanceRows, setSelectedQualityClearanceRows] = useState<TPackingDetails[]>([]);
  const qualityClearanceTabRef = useRef<any>(null);

  // Add state for Quality Clearance modal
  const [qualityClearanceFormPopup, setQualityClearanceFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Process Quality Clearance" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for putway details
  // const [putwayDetails, setPutwayDetails] = useState<{ site_to: string; site_from: string; location_from: string; location_to: string }>({
  //   site_to: '',
  //   site_from: '',
  //   location_from: '',
  //   location_to: ''
  // });
  // Add state for selected putway rows
  const [selectedPutwayRows, setSelectedPutwayRows] = useState<any[]>([]);
  const putwayTabRef = useRef<any>(null);

  // Add state for selected manual putway rows
  const [selectedManualPutwayRows, setSelectedManualPutwayRows] = useState<any[]>([]);
  const putwayManualTabRef = useRef<any>(null);

  // Add state for Putway modal
  const [putwayFormPopup, setPutwayFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Process Putaway" />,
    data: { existingData: {}, isEditMode: false }
  });
  // Add state for selected confirmation rows
  const [selectedConfirmationRows, setSelectedConfirmationRows] = useState<TInboundjobconfirm[]>([]);
  const confirmationTabRef = useRef<any>(null);

  // Add state for Manual Putaway form (separate from putway form)
  const [manualPutawayFormPopup, setManualPutawayFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: false, // Make modal not full width
      maxWidth: 'sm' // Make modal extra small
    },
    title: <FormattedMessage id="Add Manual Putaway" />,
    data: { existingData: {}, isEditMode: false }
  });

  // Add a state for HHT putaway modal
  // const [hhtPutawayModal, setHhtPutawayModal] = useState<TUniversalDialogProps>({
  //   action: {
  //     open: false,
  //     fullWidth: true,
  //     maxWidth: 'md'
  //   },
  //   title: <FormattedMessage id="Process HHT Putaway" />,
  //   data: { existingData: {}, isEditMode: false }
  // });

  // Add state for selected HHT rows
  const [, setSelectedHhtRows] = useState<any[]>([]);
  const hhtPutawayTabRef = useRef<any>(null);

  //--------------------------useQuery--------------
  const { data: jobData } = useQuery({
    queryKey: ['single_job_data', id],
    queryFn: () => InboundJobServiceInstance.getInboundJob(id as string),
    enabled: !!id
  });
  const {
    data: reportData,
    isLoading: reportsLoading,
    isError: reportsError,
    refetch: refetchReportListData
  } = useQuery({
    queryKey: ['report_list'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getAllReports();
        if (!response) {
          throw new Error('No reports data received');
        }
        return {
          data: response.map((report) => ({
            reportid: report.reportid,
            reportname: report.reportname
          })) as JobReportsT[]
        };
      } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
    },
    enabled: !!printPopup.action.open,
    retry: 2
  });
  // const { data: selectedReportData } = useQuery({
  //   queryKey: ['report_data', previewReportPopup.data.selectedReport],
  //   queryFn: () => InboundJobServiceInstance.getInboundReport(previewReportPopup.data.selectedReport, jobData?.prin_code, jobData?.job_no),
  //   enabled: !!previewReportPopup.action.open && previewReportPopup.data.selectedReport.length > 0
  // });

  //--------------------------handlers------------------------
  const TabPanel = (props: TabPanelProps) => {
    const { children, value, ...other } = props;
    return (
      <div role="tabpanel" hidden={value !== selectedTab} id={value} {...other}>
        {value === selectedTab && <Typography>{children}</Typography>}
      </div>
    );
  };
  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
    navigate(`/wms/transactions/inbound/jobs/view/${id}/${tabValue}`);
  };
  // Determine which tabs to display based on job classification
  const availableTabs = useMemo(() => {
    if (jobData?.job_class === 'M') {
      return manualPutawayTabs;
    } else if (jobData?.job_class === 'NP') {
      return normalHhtTabs;
    } else if (jobData?.job_class === 'N') {
      return normalJobTabs;
    }
    return allTabs;
  }, [jobData]);

  const togglePrintJob = () => {
    if (!printPopup.action.open) {
      refetchReportListData();
    }
    setPrintPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open }
    }));
  };
  // Adjust togglePreviewPopup function
  const togglePreviewPopup = (report?: JobReportsT | null) => {
    setPreviewReportPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open },
      data: { selectedReport: report ?? null }
    }));
  };
  // Handler to toggle Add Shipment popup
  const toggleShipmentPopup = () => {
    setShipmentFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };
  // Handler to toggle Add Tally Detail popup
  const toggleTallyPopup = () => {
    setTallyFormPopup((prev) => ({
      ...prev,
      title: <FormattedMessage id="Add Tally Detail" />,
      data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };
  // Handler to toggle Add Packing popup
  // const toggleManualPutawayPopup = () => {
  //   setPutwayFormPopup((prev) => ({
  //     ...prev,
  //     data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
  //     action: { ...prev.action, open: !prev.action.open }
  //   }));
  // };
  // Handler to toggle Add Receivables popup
  const toggleReceivablesPopup = () => {
    setReceivablesFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };
  // Handler to toggle Quality Clearance modal
  const toggleQualityClearancePopup = (shouldRefresh?: boolean) => {
    if (qualityClearanceFormPopup.action.open && shouldRefresh) {
      // Use the ref to refresh data properly
      qualityClearanceTabRef.current?.refreshData();
      // Clear selection after successful processing
      setTimeout(() => {
        qualityClearanceTabRef.current?.clearSelection();
        setSelectedQualityClearanceRows([]);
      }, 1000);
    }

    // Get current selection when opening modal and normalize the data
    const currentSelection = qualityClearanceTabRef.current?.getSelectedRows() || selectedQualityClearanceRows;
    
    // Normalize the rows to ensure consistent field names
    const normalizedSelection = currentSelection.map((row: any) => ({
      ...row,
      packdet_no: row.packdet_no || row.PACKDET_NO,
      prod_code: row.prod_code || row.PROD_CODE,
      job_no: row.job_no || row.JOB_NO,
      prin_code: row.prin_code || row.PRIN_CODE,
      company_code: row.company_code || row.COMPANY_CODE,
      clearance: row.clearance || row.CLEARANCE
    }));

    console.log('Normalized selection for modal:', normalizedSelection);

    setQualityClearanceFormPopup((prev) => ({
      ...prev,
      data: {
        selectedRows: normalizedSelection,
        prin_code: jobData?.prin_code ?? '',
        job_no: jobData?.job_no ?? ''
      },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  // Separate handler for toggling Manual Putaway form
  const toggleManualPutawayFormPopup = () => {
    setManualPutawayFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  // Handler to toggle Putway modal
  const togglePutwayPopup = (shouldRefresh?: boolean, isManual?: boolean) => {
    if (putwayFormPopup.action.open && shouldRefresh) {
      if (isManual) {
        putwayManualTabRef.current?.refreshData();
        setTimeout(() => {
          putwayManualTabRef.current?.clearSelection();
          setSelectedManualPutwayRows([]);
        }, 1000);
      } else {
        putwayTabRef.current?.refreshData();
        setTimeout(() => {
          putwayTabRef.current?.clearSelection();
          setSelectedPutwayRows([]);
        }, 1000);
      }
    }

    if (!putwayFormPopup.action.open) {
      // Opening modal - get current selection and normalize
      // Get selection from ref, but if it's empty or undefined, fall back to state
      const refSelection = isManual
        ? putwayManualTabRef.current?.getSelectedRows()
        : putwayTabRef.current?.getSelectedRows();
      
      const stateSelection = isManual ? selectedManualPutwayRows : selectedPutwayRows;
      
      // Use ref selection only if it has items, otherwise use state
      const currentSelection = (refSelection && refSelection.length > 0) ? refSelection : stateSelection;

      console.log('Ref selection:', refSelection);
      console.log('State selection:', stateSelection);
      console.log('Current selection before normalization:', currentSelection);
      console.log('Current selection length:', currentSelection.length);

      // Normalize the rows to ensure consistent field names
      const normalizedSelection = currentSelection.map((row: any) => ({
        ...row,
        packdet_no: row.packdet_no || row.PACKDET_NO,
        prod_code: row.prod_code || row.PROD_CODE,
        job_no: row.job_no || row.JOB_NO,
        prin_code: row.prin_code || row.PRIN_CODE,
        company_code: row.company_code || row.COMPANY_CODE,
        location_from: row.location_from || row.LOCATION_FROM,
        location_to: row.location_to || row.LOCATION_TO,
        site_from: row.site_from || row.SITE_FROM,
        site_to: row.site_to || row.SITE_TO
      }));

      console.log('Normalized putaway selection for modal:', normalizedSelection);
      console.log('Normalized selection length:', normalizedSelection.length);

      setPutwayFormPopup((prev) => ({
        ...prev,
        title: isManual ? <FormattedMessage id="Process Manual Putaway" /> : <FormattedMessage id="Process Putaway" />,
        data: {
          selectedRows: normalizedSelection,
          prin_code: jobData?.prin_code ?? '',
          job_no: jobData?.job_no ?? '',
          isManual: isManual || false
        },
        action: { ...prev.action, open: true }
      }));
    } else {
      // Closing modal
      setPutwayFormPopup((prev) => ({
        ...prev,
        action: { ...prev.action, open: false }
      }));
    }
  };

  // Add handler for HHT putaway modal
  const toggleHhtPutawayModal = (shouldRefresh?: boolean) => {
    if (shouldRefresh) {
      hhtPutawayTabRef.current?.refreshData();
    }
    
    // Trigger the edit modal in the HHT component
    if (hhtPutawayTabRef.current?.openProcessModal) {
      hhtPutawayTabRef.current.openProcessModal();
    }
  };

  // Handler for quality clearance row selection with debouncing
  const handleQualityClearanceSelection = useCallback((selectedRows: TPackingDetails[]) => {
    setSelectedQualityClearanceRows(selectedRows);
  }, []);

  // Handler for putway row selection
  const handlePutwaySelection = useCallback((selectedRows: any[]) => {
    console.log('=== PARENT: handlePutwaySelection ===');
    console.log('Received selectedRows length:', selectedRows.length);
    console.log('selectedRows:', selectedRows);
    setSelectedPutwayRows(selectedRows);
  }, []);

  // Add handler for manual putway row selection
  const handleManualPutwaySelection = useCallback((selectedRows: any[]) => {
    setSelectedManualPutwayRows(selectedRows);
  }, []);

  // Add handler for HHT row selection
  const handleHhtSelection = useCallback((selectedRows: any[]) => {
    setSelectedHhtRows(selectedRows);
  }, []);

  // Update confirmation handlers
  const handleConfirmationSelection = useCallback((selectedRows: TInboundjobconfirm[]) => {
    console.log('Parent: Confirmation selection changed:', selectedRows);
    setSelectedConfirmationRows(selectedRows);
  }, []);

  const handleConfirmProcess = async () => {
    try {
      console.log('=== PARENT: START CONFIRMATION ===');
      console.log('1. Parent state - selectedConfirmationRows:', selectedConfirmationRows);
      console.log('2. Parent state - selectedConfirmationRows length:', selectedConfirmationRows.length);
      console.log('3. Parent state - selectedConfirmationRows data:', JSON.stringify(selectedConfirmationRows, null, 2));
      
      // Get the actual selected rows from the child component
      const childSelectedRows = confirmationTabRef.current?.getSelectedRows();
      console.log('4. Child component selected rows:', childSelectedRows);
      console.log('5. Child component selected rows length:', childSelectedRows?.length || 0);
      
      if (!childSelectedRows || childSelectedRows.length === 0) {
        console.warn('No rows selected in child component');
        return;
      }
      
      // Use the ref method which has better logic
      const result = await confirmationTabRef.current?.processSelectedConfirmations();
      
      console.log('6. Process result:', result);
      
      if (result) {
        console.log('=== PARENT: CONFIRMATION COMPLETED ===');
      } else {
        console.warn('=== PARENT: CONFIRMATION RETURNED FALSE ===');
      }
    } catch (error) {
      console.error('=== PARENT: CONFIRMATION FAILED ===');
      console.error('Error in parent confirmation handler:', error);
    }
  };

  const renderTab = () => {
    switch (selectedTab) {
      case 'shipment_details':
        return (
          <ErrorBoundary>
            <ShipmentDetailsWmsTab job_no={id as string} prin_code={jobData?.prin_code as string} />
          </ErrorBoundary>
        );
      case 'packing_details':
        return (
          <ErrorBoundary>
            <PackingDetailsWmsTab
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              company_code={jobData?.company_code as string}
            />
          </ErrorBoundary>
        );
      case 'receiving_details':
        return (
          <ErrorBoundary>
            <ReceivingDetailsWmsTab
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              company_code={jobData?.company_code as string}
            />
          </ErrorBoundary>
        );
      case 'quality_clearance':
        return (
          <ErrorBoundary>
            <QualityClearanceDetailsWmsTab
              ref={qualityClearanceTabRef}
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              onSelectionChange={handleQualityClearanceSelection}
            />
          </ErrorBoundary>
        );
      case 'tally_details':
        return (
          <ErrorBoundary>
            <TallyDetailsWmsTab job_no={id as string} prin_code={jobData?.prin_code as string} onAddTallyDetail={toggleTallyPopup} />
          </ErrorBoundary>
        );
      case 'putway_hht':
        return (
          <ErrorBoundary>
            <PutawayHHTDetails 
              ref={hhtPutawayTabRef}
              job_no={id as string} 
              prin_code={jobData?.prin_code as string}
              onSelectionChange={handleHhtSelection}
            />
          </ErrorBoundary>
        );
      case 'putway_details':
        return (
          <ErrorBoundary>
            <PutwayDetailsWmsTab
              ref={putwayTabRef}
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              onSelectionChange={handlePutwaySelection}
            />
          </ErrorBoundary>
        );
      case 'putway_manual':
        return (
          <ErrorBoundary>
            <PutwayManualWmsTab
              ref={putwayManualTabRef}
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              onSelectionChange={handleManualPutwaySelection}
            />
          </ErrorBoundary>
        );
      case 'job_confirmation':
        return (
          <ErrorBoundary>
            <ConfirmInboundJobWmsTab
              ref={confirmationTabRef}
              job_no={id as string}
              prin_code={jobData?.prin_code as string}
              onSelectionChange={handleConfirmationSelection}
            />
          </ErrorBoundary>
        );
      case 'activity_billing':
        return (
          <ErrorBoundary>
            <ActivityBillingTab prin_code={jobData?.prin_code as string} />
          </ErrorBoundary>
        );
      default:
        return <></>;
    }
  };

  //--------------------------useEffect------------------------
  useEffect(() => {
    // If current tab is not available in the filtered tabs, redirect to shipment_details
    if (tab && availableTabs.findIndex((t) => t.value === tab) === -1) {
      navigate(`/wms/transactions/inbound/jobs/view/${id}/shipment_details`);
    } else if (tab) {
      setSelectedTab(tab);
    }
  }, [tab, availableTabs, id, navigate]);

  function togglePackingPopup() {
    setPackingFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: { prin_code: jobData?.prin_code, job_no: jobData?.job_no } },
      action: { ...prev.action, open: !prev.action.open }
    }));
  }

  return (
    <>
    <div className="w-full h-full">
      <div className="sm:flex sm:justify-between sm:items-center">
        <div className="mt-2 mb-3 flex items-center space-x-4">
          <IconButton onClick={() => navigate('/wms/transactions/inbound/jobs')}>
            <ArrowLeftOutlined />
          </IconButton>

          <div className="flex flex-row items-center justify-center">
            <div className="flex items-center space-x-2">
              <Alert message={`Job Number: ${jobData?.job_no}`} type="info" />
            </div>
            <div className="flex items-center space-x-2 pl-2">
              <Alert message={`Principal: ${jobData?.prin_code}`} type="info" />
            </div>
            {/* {jobData?.job_class && (
              <div className="flex items-center space-x-2 pl-2">
                <Alert message={`Classification: ${jobData.job_class === 'M' ? 'Manual Putaway' : 'Normal'}`} type="info" />
              </div>
            )} */}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedTab === 'putway_details' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<SettingOutlined />}
              variant="contained"
              onClick={() => togglePutwayPopup(false, false)}
              disabled={selectedPutwayRows.length === 0}
            >
              <FormattedMessage id="Process Putway" />
            </Button>
          ) : selectedTab === 'putway_hht' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<SettingOutlined />}
              variant="contained"
              onClick={() => toggleHhtPutawayModal(false)}
            >
              <FormattedMessage id="Process HHT Putway" />
            </Button>
          ) : selectedTab === 'putway_manual' ? (
            <>
              <Button
                size="small"
                sx={{
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
                startIcon={<PlusOutlined />}
                variant="contained"
                onClick={toggleManualPutawayFormPopup}
              >
                <FormattedMessage id="Add Manual Putaway" />
              </Button>
            </>
          ) : selectedTab === 'quality_clearance' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<SettingOutlined />}
              variant="contained"
              onClick={() => toggleQualityClearancePopup(false)}
              disabled={selectedQualityClearanceRows.length === 0}
            >
              <FormattedMessage id="Process Clearance" />
            </Button>
          ) : selectedTab === 'job_confirmation' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<SettingOutlined />}
              variant="contained"
              onClick={handleConfirmProcess}
              disabled={selectedConfirmationRows.length === 0}
            >
              <FormattedMessage id="Process Confirm Selected" />
            </Button>
          ) : selectedTab === 'tally_details' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<PlusOutlined />}
              variant="contained"
              onClick={toggleTallyPopup}
            >
              <FormattedMessage id="Add Tally Detail" />
            </Button>
          ) : selectedTab === 'packing_details' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<PlusOutlined />}
              variant="contained"
              onClick={togglePackingPopup}
            >
              <FormattedMessage id="Add Packing" />
            </Button>
          ) : selectedTab !== 'receiving_details' && selectedTab !== 'putway_hht' ? (
            <Button
              size="small"
              sx={{
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
              startIcon={<PlusOutlined />}
              variant="contained"
              onClick={toggleShipmentPopup}
            >
              <FormattedMessage id="Add Shipment" />
            </Button>
          ) : null}
          <Button
            size="small"
            sx={{
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
            startIcon={<PrinterOutlined />}
            variant="contained"
            onClick={() => togglePrintJob()}
          >
            <FormattedMessage id="Print" />
          </Button>
        </div>
      </div>
      <div>
        <Tabs
          component={AppBar}
          position="static"
          sx={{
            backgroundColor: theme.palette.grey[100],
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
          value={selectedTab}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {availableTabs.map((eachTab: TPair<''>) => {
            return !!user_permission &&
              Object.keys(user_permission)?.includes(
                permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
              ) ? (
              <Tab
                className="font-semibold"
                aria-label="secondary tabs example"
                value={eachTab.value}
                label={eachTab.label}
                onClick={() => handleTabChange(eachTab.value)}
              />
            ) : (
              <></>
            );
          })}
        </Tabs>

        <Paper elevation={3} className="rounded-none overflow-hidden h-full">
          {availableTabs.map((eachTab: TPair<''>) => {
            return (
              <TabPanel value={eachTab.value} dir={theme.direction}>
                {!!jobData && renderTab()}
              </TabPanel>
            );
          })}
        </Paper>
      </div>

      {!!printPopup && printPopup.action.open && (
        <UniversalDialog action={{ ...printPopup.action }} onClose={togglePrintJob} title={printPopup.title} hasPrimaryButton={false}>
          {reportsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={50} />
              ))}
            </div>
          ) : reportsError ? (
            <div className="p-4 text-red-500">Failed to load reports. Please try again.</div>
          ) : (
            <List>
              {reportData?.data.map((report) => (
                <ListItem disablePadding key={report.reportid}>
                  <ListItemButton onClick={() => togglePreviewPopup(report)}>
                    <ListItemText
                      primary={
                        <span
                          style={{ fontWeight: previewReportPopup.data.selectedReport?.reportid === report.reportid ? 'bold' : 'normal' }}
                        >
                          {report.reportname}
                        </span>
                      }
                    />
                    <EyeOutlined className="hover:text-blue-900 ml-2" />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </UniversalDialog>
      )}

      {!!previewReportPopup && previewReportPopup.action.open && (
        <UniversalDialog
          action={{ ...previewReportPopup.action }}
          onClose={() => togglePreviewPopup()}
          title={previewReportPopup.title}
          hasPrimaryButton={false}
        >
          <ErrorBoundary>
            {previewReportPopup.data.selectedReport && jobData ? (
              <WmsReportView
                reportId={previewReportPopup.data.selectedReport.reportid}
                parameters={{
                  job_no: jobData.job_no,
                  ReportTitle: previewReportPopup.data.selectedReport.reportname,
                  LOGINID: user?.loginid,
                  Reportobject: previewReportPopup.data.selectedReport.reportid,
                  company_code: user?.company_code,
                  div_code: jobData.div_code,
                  prin_code: jobData.prin_code
                }}
                onClose={() => togglePreviewPopup()}
              />
            ) : (
              <Typography>No report selected or job data unavailable</Typography>
            )}
          </ErrorBoundary>
        </UniversalDialog>
      )}

      {!!tallyFormPopup && tallyFormPopup.action.open && (
        <UniversalDialog
          action={{ ...tallyFormPopup.action }}
          onClose={toggleTallyPopup}
          title={tallyFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundTallyDetailsForm
            job_no={jobData?.job_no ?? ''}
            packdet_no={tallyFormPopup?.data.existingData.packdet_no}
            prin_code={jobData?.prin_code ?? ''}
            onClose={toggleTallyPopup}
            isEditMode={tallyFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}

      {!!shipmentFormPopup && shipmentFormPopup.action.open && (
        <UniversalDialog
          action={{ ...shipmentFormPopup.action }}
          onClose={toggleShipmentPopup}
          title={shipmentFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddShipmentWmsForm
            container_no={shipmentFormPopup?.data.existingData.container_no}
            prin_code={jobData?.prin_code ?? ''}
            job_no={jobData?.job_no ?? ''}
            onClose={toggleShipmentPopup}
            isEditMode={shipmentFormPopup?.data?.isEditMode}
            existingData={shipmentFormPopup?.data?.existingData}
          />
        </UniversalDialog>
      )}

      {!!packingFormPopup && packingFormPopup.action.open && (
        <UniversalDialog
          action={{ ...packingFormPopup.action }}
          onClose={togglePackingPopup}
          title={packingFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundPackingDetailsForm
            job_no={jobData?.job_no ?? ''}
            packdet_no={packingFormPopup?.data.existingData.packdet_no}
            prin_code={jobData?.prin_code ?? ''}
            onClose={togglePackingPopup}
            isEditMode={packingFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}

      {!!manualPutawayFormPopup && manualPutawayFormPopup.action.open && (
        <UniversalDialog
          action={{ ...manualPutawayFormPopup.action }}
          onClose={toggleManualPutawayFormPopup}
          title={manualPutawayFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddManualPutawayForm
            job_no={jobData?.job_no ?? ''}
            packdet_no={manualPutawayFormPopup?.data.existingData.packdet_no ?? ''}
            prin_code={jobData?.prin_code ?? ''}
            onClose={toggleManualPutawayFormPopup}
            isEditMode={manualPutawayFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}

      {!!putwayFormPopup && putwayFormPopup.action.open && (
        <UniversalDialog
          action={{ ...putwayFormPopup.action }}
          onClose={() => togglePutwayPopup(false, putwayFormPopup.data.isManual)}
          title={putwayFormPopup.title}
          hasPrimaryButton={false}
        >
          <PutwayDetailsModal
            selectedRows={putwayFormPopup.data.selectedRows || []}
            prin_code={jobData?.prin_code ?? ''}
            job_no={jobData?.job_no ?? ''}
            onClose={(shouldRefresh?: boolean) => togglePutwayPopup(shouldRefresh, putwayFormPopup.data.isManual)}
            isManual={putwayFormPopup.data.isManual}
          />
        </UniversalDialog>
      )}

      {!!receivablesFormPopup && receivablesFormPopup.action.open && (
        <UniversalDialog
          action={{ ...receivablesFormPopup.action }}
          onClose={toggleReceivablesPopup}
          title={receivablesFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundReceivingDetailsForm
            job_no={jobData?.job_no ?? ''}
            packdet_no={receivablesFormPopup?.data.existingData.packdet_no}
            prin_code={jobData?.prin_code ?? ''}
            onClose={toggleReceivablesPopup}
            isEditMode={receivablesFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}

      {!!qualityClearanceFormPopup && qualityClearanceFormPopup.action.open && (
        <UniversalDialog
          action={{ ...qualityClearanceFormPopup.action }}
          onClose={() => toggleQualityClearancePopup(false)}
          title={qualityClearanceFormPopup.title}
          hasPrimaryButton={false}
        >
          <QualityClearanceModal
            selectedRows={selectedQualityClearanceRows}
            prin_code={jobData?.prin_code ?? ''}
            job_no={jobData?.job_no ?? ''}
            onClose={toggleQualityClearancePopup}
          />
        </UniversalDialog>
      )}
    </div>
    </>
  );
};

export default InboundJobTabsWmsPage;