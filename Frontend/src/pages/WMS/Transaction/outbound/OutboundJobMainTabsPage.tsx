import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { useOutboundJobState } from 'hooks/useOutboundJobState';
import { useLocation, useNavigate, useParams } from 'react-router';
import WmsServiceInstance from 'service/wms/service.wms';
import OrderEntryTab from './OrderEntryTab';
import OrderEntryFormDialog from './OrderEntryFormDialog';
import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
import { IEDIOrderDetail, IToOrderEntry, TOrderDetail } from './types/jobOutbound_wms.types';
import OrderDetailsTab from './OrderDetailsTab';
import OrderDetailsFormDialog from './OrderDetailsFormDialog';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
import PickingDetailsWmsTab from 'components/tabs/wms/transaction/outbound/PickingDetailsWmsTab';
import { ArrowLeftOutlined, PlusOutlined, PrinterOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Progress } from 'antd';
import { FormattedMessage } from 'react-intl';
import useAuth from 'hooks/useAuth';
import * as XLSX from 'xlsx';
import EDITable from 'components/tabs/wms/transaction/outbound/EDITable';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { openSnackbar } from 'store/reducers/snackbar';
import JobConfirmation from 'components/tabs/wms/transaction/outbound/JobConfirmation';
import CancelPicking from 'components/tabs/wms/transaction/outbound/CancelPicking';
import WmsReportView from 'components/reports/WmsReportView';

const OutboundJobMainTabsPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const rowDataUppercase = location.state?.rowData;
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const rowData = Object.fromEntries(Object.entries(rowDataUppercase).map(([key, value]) => [key.toLowerCase(), value]));

  console.log('rowDataLowercase', rowData);
  console.log('rowDataUppercase', rowDataUppercase);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleEDIClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleEDIClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    if (action === 'import') {
      setImportModalOpen(true);
      setAnchorEl(null);
    }
  };

  // State for import modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [percent, setPercent] = useState(0);

  const handleClose = () => {
    setViewModal(false);
  };

  const handleImportModalClose = () => {
    setImportModalOpen(false);
    setImportFile(null);
  };

  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  //   TABS
  const [activeTab, setActiveTab] = useState('order_entry');
  // Dialog states
  const [orderEntryDialog, setOrderEntryDialog] = useState(false);
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [orderDetailsdialogMode, setOrderDetailsdialogMode] = useState<'create' | 'edit'>('create');

  //   TABS
  const tabs = [
    { label: 'Order Entry', value: 'order_entry' },
    { label: 'Order Details', value: 'order_details' },
    { label: 'Picking Details', value: 'picking_details' },
    { label: 'Cancel Picking', value: 'cancel_picking' },
    { label: 'Job Confirmation', value: 'job_confirmation' },
  ];

  //   TABS
  const handleTabChange = (_event: any, newValue: React.SetStateAction<string>) => {
    setActiveTab(newValue);
  };

  //   TABS
  const renderTabContent = () => {
    switch (activeTab) {
      case 'order_entry':
        return (
          <OrderEntryTab
            data={(tableOrderDataLowerCase?.tableData as any[]) || []}
            loading={isOrderLoading}
            onAdd={handleAddOrderEntry}
            onEdit={handleEditOrderEntry}
            onDelete={handleDeleteOrderEntry}
          />
        );
      case 'order_details':
        return (
          <OrderDetailsTab
            data={(tableOrderDetailsLowerCase as any[]) || []}
            loading={isOrderDetailsLoading}
            onAdd={handleAddOrderDetail}
            onEdit={handleEditOrderDetail}
            onDelete={handleDeleteOrderDetails}
            handleEDIClick={handleEDIClick}
          />
        );
      case 'picking_details':
        return <PickingDetailsWmsTab job_no={id as string} prin_code={rowData?.prin_code as string} />;
      case 'cancel_picking':
        return <CancelPicking job_no={id as string} prin_code={rowData?.prin_code as string} />;
      case 'job_confirmation':
        return (
          <JobConfirmation job_no={id as string} prin_code={rowData?.prin_code as string} company_code={rowData?.company_code as string} />
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  // State management
  const {
    tableOrderData,
    isOrderLoading,
    invalidateQueries,
    refetchTableOrder,
    tableOrderDetailsData,
    refetchTableOrderDetails,
    isOrderDetailsLoading
  } = useOutboundJobState(rowData);

  const tableOrderDataLowerCase = tableOrderData
    ? {
        tableData: tableOrderData.tableData.map((item) =>
          Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]))
        ),
        count: tableOrderData.count
      }
    : {
        tableData: [],
        count: 0
      };

  const tableOrderDetailsLowerCase = tableOrderDetailsData
    ? tableOrderDetailsData.map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value])))
    : [];

  console.log('tableOrderDetailsLowerCase', tableOrderDetailsLowerCase);

  // Handlers Order Entry
  const handleAddOrderEntry = () => {
    setDialogMode('create');
    setSelectedOrder(null);
    setOrderEntryDialog(true);
  };

  const handleEditOrderEntry = (order: any) => {
    setDialogMode('edit');
    setSelectedOrder(order);
    setOrderEntryDialog(true);
  };

  const handleOrderEntrySubmit = async (formData: IToOrderEntry) => {
    try {
      if (dialogMode === 'create') {
        await OrderEntryServiceInstance.createOrderEntry(formData);
      } else {
        await OrderEntryServiceInstance.createOrderEntry(formData);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error; // Let Formik handle the error
    } finally {
      refetchTableOrder();
      setOrderEntryDialog(false); // This will close the dialog and refresh data
    }
  };

  const handleDeleteOrderEntry = async (formData: IToOrderEntry) => {
    try {
      let ls_job_no = formData.job_no ? `${formData.job_no}$$$DELETE` : '$$$DELETE';
      console.log('before calling delete', ls_job_no);
      formData.job_no = ls_job_no;
      console.log('after setting job_no', formData.job_no);
      await OrderEntryServiceInstance.createOrderEntry(formData);
      refetchTableOrder();
      // Show success notification
    } catch (error) {
      console.error('Delete failed:', error);
      // Show error notification
    }
  };
  const handleDeleteOrderDetails = async (detail: any) => {
    try {
      console.log('Deleting detail:', detail);
      await OutboundJobServiceInstance.deleteToOrderDetHandler(detail.company_code, detail.prin_code, detail.job_no, detail.serial_no);
      refetchTableOrderDetails();

      // Show success notification
    } catch (error) {
      console.error('Delete failed:', error);
      // Show error notification
    }
  };

  // Handlers Order Details
  const handleAddOrderDetail = () => {
    setOrderDetailsdialogMode('create');
    setSelectedOrderDetail(null);
    setOrderDetailsDialog(true);
  };

  const handleEditOrderDetail = (order: any) => {
    setOrderDetailsdialogMode('edit');
    setSelectedOrderDetail(order);
    setOrderDetailsDialog(true);
  };

  const handleOrderDetailsSubmit = async (formData: TOrderDetail) => {
    try {
      if (dialogMode === 'create') {
        console.log('Creating Order Detail with data:', formData);
        await OutboundJobServiceInstance.upsertOutboundOrderDetailManualHandler(formData);
        refetchTableOrderDetails();
      } else {
        // await OrderEntryServiceInstance.updateSingleOrderEntry(selectedOrder?.id || 0, formData);
        await OutboundJobServiceInstance.upsertOutboundOrderDetailManualHandler(formData);
        refetchTableOrderDetails();
      }
      // setOrderEntryDialog(false); // This will close the dialog and refresh data
      setOrderDetailsDialog(false);
      refetchTableOrderDetails();
      invalidateQueries();
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error; // Let Formik handle the error
    }
  };

  // EDI

  //--------------------------Modal------------------------
  const handleOk = async () => {
    dispatch(openBackdrop());
    try {
      const response: IApiResponse<TOrderDetail> = await axiosServices.post('api/wms/outbound/copyEDIToOrderDetailHandler', {
        login_id: user?.loginid ?? '',
        job_no: rowData?.job_no ?? '',
        prin_code: rowData?.prin_code ?? '',
        company_code: rowData?.company_code ?? ''
      });

      if (response.data.success) {
        setOrderDetailsDialog(false);
        invalidateQueries();
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'EDI copied to Order Detail successfully',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
      }

      return response.data.success;
    } catch (error: unknown) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Something went wrong while copying EDI to Order Detail',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return false;
    } finally {
      setViewModal(false);
      dispatch(closeBackdrop());
    }
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
  };
  //--------------------------IMPORT------------------------

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportFileClick = () => {
    document.getElementById('packing-import-file-input')?.click();
  };

  const handleImportSubmit = async () => {
    if (importFile) {
      try {
        // Parse Excel/CSV file
        setPercent(0);
        const data = await importFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Optionally, add job_no and prin_code to each row if needed
        const enrichedData = jsonData.map((row: any) => ({
          ...row,
          user_id: user?.loginid ?? '',
          company_code: user?.company_code ?? null,
          prin_code: rowData?.prin_code ?? '',
          job_no: rowData?.job_no ?? ''
        }));

        console.log('enrichedData:', enrichedData);

        const success = await handleImportData(enrichedData);
        if (success) {
          setPercent(0);
          setViewModal(true);
          setImportModalOpen(false);
          setImportFile(null);
        }
      } catch (error) {
        console.error('Failed to parse file:', error);
      }
    }
  };

  // Import handler: uploads parsed data to backend and refreshes table
  const handleImportData = async (values: unknown[]): Promise<boolean> => {
    try {
      setPercent(50);
      console.log('value', values);

      if (!Array.isArray(values) || values.length === 0) {
        console.error('No data to upload.');
        return false;
      }

      // Transform raw Excel data into typed IEDIOrderDetail[]
      const ediData = transformOrderDetailEDI(values as any[]);
      console.log('ediData', ediData);

      // Call backend bulk upload API

      const response = await OutboundJobServiceInstance.upsertEDIOrderDetailHandler(ediData);
      console.log('Data imported successfully:', response);

      if (response) {
        // Show success message
        console.log('Data imported successfully:', response);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error while importing data:', error);
      return false;
    }
  };

  // Helper functions (implement as per your project)
  const parseNumber = (val: any): number | undefined => {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  const parseDate = (val: any): Date | undefined => {
    const date = val ? new Date(val) : undefined;
    return date instanceof Date && !isNaN(date.getTime()) ? date : undefined;
  };

  const transformOrderDetailEDI = (rawData: any): IEDIOrderDetail => {
    return rawData.map((row: any, index: number) => ({
      company_code: user?.company_code ?? '',
      prin_code: row['prin_code']?.trim(),
      job_no: row['job_no']?.trim(),
      product_code: row['Product Code']?.trim(),
      site_code: row['site_code']?.trim() || undefined,
      puom: row['puom']?.trim() || undefined,
      qty1: parseNumber(row['qty1']),
      luom: row['luom']?.trim() || undefined,
      qty2: parseNumber(row['qty2']),
      lotno: row['lotno']?.trim() || undefined,
      location_from: row['location_from']?.trim() || undefined,
      location_to: row['location_to']?.trim() || undefined,
      salesman_code: row['salesman_code']?.trim() || undefined,
      expiry_date_from: parseDate(row['expiry_date_from']),
      expiry_date_to: parseDate(row['expiry_date_to']),
      batch_no: row['batch_no']?.trim() || undefined,
      mfg_date_from: parseDate(row['mfg_date_from']),
      mfg_date_to: parseDate(row['mfg_date_to']),
      customer_store_name: row['Customer/Store Name']?.trim() || undefined,
      order_no: row['Order No']?.trim(),
      cust_code: '0000', // Default value, can be changed as needed
      serial_no: index + 1,
      serial_number: row['serial_number']?.trim() || '-',
      created_at: new Date(),
      created_by: 'SYSTEM',
      updated_at: new Date(),
      updated_by: 'SYSTEM',
      user_id: user?.loginid ?? '',
      error_msg: row['error_msg']?.trim() || undefined
    }));
  };

  const BasicMenu = () => {
    return (
      <>
        <div>
          <Menu disableScrollLock={true} id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleEDIClose}>
            <MenuItem onClick={() => handleMenuAction('import')}>Import</MenuItem>
            <MenuItem onClick={() => handleMenuAction('export')}>Export</MenuItem>
            <MenuItem onClick={() => handleMenuAction('print')}>Print</MenuItem>
          </Menu>
        </div>
      </>
    );
  };

  const handlePrintClick = async () => {
    try {
      const reports = await WmsServiceInstance.getAllOutboundReports();
      if (reports && reports.length > 0) {
        setReportId(reports[0].reportid);
        setReportDialogOpen(true);
      } else {
        console.error('No outbound reports available.');
      }
    } catch (error) {
      console.error('Failed to fetch outbound reports:', error);
    }
  };

  const handleReportClose = () => {
    setReportDialogOpen(false);
    setReportId(null);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <div className="sm:flex sm:justify-between sm:items-center pb-2">
          <div className=" flex items-center justify-between  ">
            {/* Button to navigate back to the jobs list */}
            <IconButton onClick={() => navigate('/wms/transactions/outbound/jobs_oub')}>
              <ArrowLeftOutlined />
            </IconButton>
            {/* Display the job number */}
            {/* <Typography className="text-xl sm:text-3xl font-semibold ">{jobData?.job_no}</Typography> */}
            <div className="flex space-x-2">
              <Alert style={{ fontSize: '12px', padding: '6px 10px' }} message={`Job Number: ${rowData?.job_no}`} type="info" />
              <Alert style={{ fontSize: '12px', padding: '6px 10px' }} message={`Principal : ${rowData?.prin_code}`} type="info" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Action buttons */}
            <div className="flex items-center space-x-2 mb-2">
              {activeTab === 'order_entry' && (
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
                  onClick={handleAddOrderEntry}
                >
                  <FormattedMessage id="Add Order" />
                </Button>
              )}
              {activeTab === 'order_details' && (
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
                  onClick={handleAddOrderDetail}
                >
                  <FormattedMessage id="Add Order Details" />
                </Button>
              )}

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
                onClick={handlePrintClick}
              >
                <FormattedMessage id="Print" />
              </Button>

              {/* EDI menu */}
              <BasicMenu />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Box sx={{ bgcolor: 'background.paper' }}>
          <AppBar position="static">
            <Tabs
              //put this style in tabs
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
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="outbound job tabs"
            >
              {tabs.map((tab) => (
                <Tab className="font-semibold" key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </AppBar>

          <Paper elevation={3} className="rounded-none overflow-hidden h-full">
            {renderTabContent()}
          </Paper>
        </Box>
      </Box>

      {/* Dialogs */}
      <OrderEntryFormDialog
        open={orderEntryDialog}
        onClose={() => setOrderEntryDialog(false)}
        mode={dialogMode}
        initialData={selectedOrder}
        rowData={rowData}
        onSuccess={handleOrderEntrySubmit}
      />
      <OrderDetailsFormDialog
        open={orderDetailsDialog}
        onClose={() => setOrderDetailsDialog(false)}
        mode={orderDetailsdialogMode}
        initialData={selectedOrderDetail} // for editing existing details
        rowData={rowData} // job data from the previous page using link state
        onSuccess={handleOrderDetailsSubmit}
      />

      <Dialog
        open={importModalOpen}
        disableScrollLock={true}
        onClose={handleImportModalClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            background: '#173A5E',
            color: '#fff',
            px: 3,
            py: 2,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              fontWeight: 600,
              fontSize: 18,
              color: '#fff',
              background: 'transparent'
            }}
          >
            <FormattedMessage id="Import Packing Details" />
          </DialogTitle>
        </Box>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 260,
            background: '#f8fafc'
          }}
        >
          <Box
            sx={{
              border: '1.5px dashed #173A5E',
              borderRadius: 2,
              p: 4,
              width: '100%',
              maxWidth: 340,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#fff',
              boxShadow: 1
            }}
          >
            <input
              id="packing-import-file-input"
              type="file"
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              onChange={handleImportFileChange}
            />
            <IconButton
              onClick={handleImportFileClick}
              sx={{
                background: '#173A5E',
                color: '#fff',
                mb: 2,
                width: 64,
                height: 64,
                borderRadius: '50%',
                boxShadow: 2,
                '&:hover': { background: '#205081' }
              }}
              size="large"
            >
              <UploadOutlined style={{ fontSize: 32 }} />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              <FormattedMessage id={importFile ? 'Change File' : 'Choose File'} />
            </Typography>
            {importFile && <Progress percent={percent} status="active" />}
            {importFile && (
              <Typography variant="body2" sx={{ color: '#173A5E', mb: 1, wordBreak: 'break-all' }}>
                <UploadOutlined style={{ marginRight: 6 }} />
                {importFile.name}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
              <FormattedMessage id="Supported formats: .csv, .xlsx" />
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, background: '#f8fafc' }}>
          <Button onClick={handleImportModalClose} variant="outlined" sx={{ minWidth: 100 }}>
            <FormattedMessage id="Cancel" />
          </Button>
          <Button
            onClick={handleImportSubmit}
            disabled={!importFile}
            variant="contained"
            sx={{
              minWidth: 100,
              background: '#173A5E',
              color: '#fff',
              '&:hover': { background: '#205081' }
            }}
          >
            <FormattedMessage id="Upload" />
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={viewModal} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <EDITable
            loginid={(user?.loginid as string) ?? ''}
            job_no={(rowData?.job_no as string) ?? ''}
            prin_code={(rowData?.prin_code as string) ?? ''}
            company_code={(rowData?.company_code as string) ?? ''}
          />
          <div className="flex gap-2 items-center justify-end mt-4">
            {/* <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button> */}
            <Button
              variant="contained"
              onClick={handleOk}
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
            >
              OK
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Report View Dialog */}
      {reportDialogOpen && reportId && (
        <WmsReportView
          reportId={reportId}
          parameters={{
            job_no: rowData?.job_no as string,
            ReportTitle: 'DN Report',
            LOGINID: user?.loginid,
            Reportobject: reportId,
            company_code: user?.company_code,
            div_code: rowData?.div_code as string,
            prin_code: rowData?.prin_code as string
          }}
          onClose={handleReportClose}
        />
      )}
    </div>
  );
};

export default OutboundJobMainTabsPage;
