import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Tabs, Tab, Grid, ButtonGroup, Button, TextField, Autocomplete, Tooltip } from '@mui/material';
import { IoSendSharp } from 'react-icons/io5';
import CustomAlert from 'components/@extended/CustomAlert';
import { detailsTVendor, TVendorMain } from '../vendorTypes/TVendor';
// import VendorItemDeletRemove from './VendorItemDeletRemove';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import VendorRequestService, { IRefDocNo } from '../services/VendorRequestService';
import { showAlert } from 'store/CustomAlert/alertSlice';
import VendorSerivceInstance from '../services/service.vendor';
import { IoIosAttach } from 'react-icons/io';
import { ImExit } from 'react-icons/im';
import { FaPrint } from 'react-icons/fa';
import WmsReportView from 'components/reports/WmsReportView';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import { openBackdrop, closeBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { convertToInputFormat } from 'utils/dateFormatter';
import EnhancedVendorFilesDialog from '../components/EnhancedVendorFilesDialog';
import VendorItemDetails from './VendorItemDetails';


interface VendorDetailsTabProps {
  ac_code: string;
  isEditMode: boolean;
  requestData: TVendorMain | null;
  requestNumber: string | null;
  onClose?: () => void;
  onTabChange?: (tabIndex: number) => void;
  hideAttachIcon?: boolean;
  disableActions?: boolean;
}

const VendorRequestFormDisAct: React.FC<VendorDetailsTabProps> = ({
  ac_code,
  isEditMode,
  requestData,
  requestNumber,
  onClose,
  onTabChange,
  hideAttachIcon,
  disableActions
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedRefDoc, setSelectedRefDoc] = useState<IRefDocNo | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<{ DIV_CODE: string; DIV_NAME: string } | null>(null);
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [GenReqNum, setgenReqNum] = useState<any>('');

  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: intl.formatMessage({ id: 'Upload Files' }) || 'Upload Files',
  });

  const [previewReportPopup, setPreviewReportPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'lg' },
    title: intl.formatMessage({ id: 'Print Invoice' }) || 'Print Invoice',
    data: { reportId: null, params: null }
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const { data: vendorDivisionData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => VendorRequestService.getDivisionList()
  });

  const { data: vendorAccountData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return await VendorRequestService.getAccountsList('BSG', ac_code ?? undefined);
    },
    enabled: !!ac_code
  });

  const company_code = 'BSG';

  const [vendorRefDoc, setVendorRefDoc] = useState<IRefDocNo[]>([]);
  const getVendorRefDoc = async () => {
    const data = await VendorRequestService.getRefDocNo(company_code, user?.loginid ?? '');
    setVendorRefDoc(data || []);
  };

  const [vendorDetails, setVendorDetails] = useState<detailsTVendor[]>([]);
  const [updatedRows, setUpdatedRows] = useState<detailsTVendor[]>([]);
  const [vendorRequest, setVendorRequest] = useState<TVendorMain | null>(null);

  const getVendorDetails = useCallback(
    async (docNo: string) => {
      if (!docNo) return;

      const Detailsdata: detailsTVendor[] | undefined = await VendorRequestService.getDetails(company_code, user?.loginid ?? '', docNo);

      const safeDetails: detailsTVendor[] = Detailsdata ?? [];

      console.log('vendorDetails', safeDetails);

      // Extract AC_CODE and QTY into a new array
      const qtyActulVal = safeDetails.map((item) => ({
        ac_code: item.AC_CODE,
        qty: item.QTY
      }));

      console.log('qtyActulVal', qtyActulVal);

      setVendorDetails(safeDetails);
      setUpdatedRows(safeDetails)
    },
    [company_code, user?.loginid]
  );

  // Call API whenever selectedDoc changes
  useEffect(() => {
    if (selectedRefDoc?.DOC_NO) {
      getVendorDetails(selectedRefDoc.DOC_NO);
    } else {
      setVendorDetails([]);
      setUpdatedRows([]);
    }
  }, [selectedRefDoc?.DOC_NO, getVendorDetails]);

  // Only call loadVendorRequest when all required data is loaded
  useEffect(() => {
    if (isEditMode && vendorRefDoc.length > 0 && (vendorDivisionData?.length ?? 0) > 0) {
      loadVendorRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, vendorRefDoc, vendorDivisionData]);



  useEffect(() => {
    getVendorRefDoc();
  }, []);

  useEffect(() => {
    if (isEditMode && vendorRequest?.DOC_NO && !GenReqNum) {
      setgenReqNum(vendorRequest.DOC_NO);
    }
  }, [isEditMode, vendorRequest, GenReqNum]);


  const handleUploadPopup = () => {
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // Print handler: call backend proc then open Bold report viewer component
  const handleInvoicePrint = async () => {
    const docNo =
      GenReqNum ||
      vendorRequest?.DOC_NO ||
      selectedRefDoc?.DOC_NO ||
      requestData?.DOC_NO ||
      '';
    const companyCode = String(
      vendorRequest?.COMPANY_CODE ||
      vendorAccountData?.[0]?.COMPANY_CODE ||
      company_code
    );
    const loginUser = user?.loginid || '';

    if (!docNo) {
      dispatch(
        showAlert({
          open: true,
          message:
            intl.formatMessage({ id: 'DocNoRequiredForPrint' }) ||
            'Doc No is required for printing',
          severity: 'warning'
        })
      );
      return;
    }

    dispatch(openBackdrop());
    try {
      const res = await VendorSerivceInstance.executeVendorInvoicePrint(
        companyCode,
        docNo,
        loginUser
      );
      if (res?.success) {
        const reportId = '401423cf-53f9-4a69-b06a-fb9034925c46';
        setPreviewReportPopup((prev) => ({
          ...prev,
          action: { ...prev.action, open: true },
          data: { reportId, params: { DOC_NO: docNo, COMPANY_CODE: companyCode } }
        }));
      } else {
        dispatch(
          showAlert({
            open: true,
            message:
              res?.message ||
              intl.formatMessage({ id: 'InvoicePrintFailed' }) ||
              'Invoice print failed',
            severity: 'error'
          })
        );
      }
    } catch (error: any) {
      console.error('Invoice print error:', error);
      dispatch(
        showAlert({
          open: true,
          message:
            error?.message ||
            intl.formatMessage({ id: 'InvoicePrintError' }) ||
            'Error while printing invoice',
          severity: 'error'
        })
      );
    } finally {
      dispatch(closeBackdrop());
    }
  };

  const handleSubmit = async (LAST_ACTION: string) => {
    if (!isEditMode) {
      if (!selectedRefDoc?.DOC_NO) {
        dispatch(showAlert({
          open: true, message: intl.formatMessage({ id: 'RefDocNoRequired' }) || 'Ref Doc No is required!',
          severity: 'warning'
        }));
        return;
      }
      if (!vendorRequest?.INVOICE_NUMBER?.trim()) {
        dispatch(showAlert({
          open: true, message: intl.formatMessage({ id: 'InvoiceNumberRequired' }) || 'Invoice Number is required!',
          severity: 'warning'
        }));
        return;
      }
    }

    dispatch(openBackdrop());
    try {
      const formattedPayload: TVendorMain = {
        ...vendorRequest,
        LAST_ACTION,
        EDIT_USER: user?.loginid || '',
        COMPANY_CODE: String(user?.company_code || ''),
        DOC_TYPE: selectedRefDoc?.DOC_TYPE || vendorRequest?.DOC_TYPE || '',
        DOC_NO: GenReqNum,
        REF_DOC_NO: selectedRefDoc?.DOC_NO || vendorRequest?.REF_DOC_NO || '',
        DOC_DATE: vendorRequest?.DOC_DATE || new Date().toISOString().slice(0, 10),
        AC_CODE: String(vendorAccountData?.[0]?.AC_CODE || vendorRequest?.AC_CODE || ''),
        AC_NAME: String(vendorAccountData?.[0]?.AC_NAME || vendorRequest?.AC_NAME || ''),
        ADDRESS: String(vendorAccountData?.[0]?.ADDRESS || vendorRequest?.ADDRESS || ''),
        FAX: String(vendorAccountData?.[0]?.FAX || vendorRequest?.FAX || ''),
        PHONE: String(vendorAccountData?.[0]?.PHONE || vendorRequest?.PHONE || ''),
        REMARKS: vendorRequest?.REMARKS == null ? '' : String(vendorRequest.REMARKS),
        INVOICE_NUMBER: vendorRequest?.INVOICE_NUMBER || '',
        INVOICE_DATE: vendorRequest?.INVOICE_DATE || '',
        DIV_CODE: selectedDivision?.DIV_CODE || vendorRequest?.DIV_CODE || '',
        DIV_NAME: selectedDivision?.DIV_NAME || vendorRequest?.DIV_NAME || '',
        items: ((updatedRows && updatedRows.length > 0) ? updatedRows : (vendorRequest?.items ?? [])).map((item) => ({
          ...item,
          DOC_DATE: item.DOC_DATE || (vendorRequest?.DOC_DATE ?? new Date().toISOString().slice(0, 10)),
          AC_CODE: String(item.AC_CODE || vendorRequest?.AC_CODE || '')
        }))
      };
      console.log('inside form before')
      console.log('formattedPayload6 ', formattedPayload);
      const newRequestNumber = await VendorSerivceInstance.updateVendorerequest(formattedPayload);
      console.log('inside form', newRequestNumber);

      if (newRequestNumber) {
        setgenReqNum(newRequestNumber);  // <-- update state
        dispatch(showAlert({
          open: true, message: intl.formatMessage({ id: 'VendorRequestSavedDraft' }) || 'Vendor Request saved as draft!',
          severity: 'success'
        }));
      } else {
        throw new Error(intl.formatMessage({ id: 'UpdateReturnedFalse' }) || 'Update returned false.');
      }
    } catch (error: any) {
      dispatch(showAlert({
        open: true, message: intl.formatMessage({ id: 'UpdateVendorRequestError' }) || 'Something went wrong while updating the vendor request!',
        severity: 'error'
      }));
    } finally {
      dispatch(closeBackdrop());
    }
  };

  const loadVendorRequest = async () => {
    if (requestData) {
      try {
        const combined = `${requestData.DOC_NO}$$$${user?.loginid ?? ''}`;
        const vendorRequest = await VendorSerivceInstance.getVendorrequest(combined);
        setVendorRequest(vendorRequest ?? null);
        setVendorDetails(vendorRequest?.items ?? []);
        setUpdatedRows(vendorRequest?.items ?? []);

        if (vendorRequest) {
          const refDoc = vendorRefDoc?.find((doc) => doc.DOC_NO === vendorRequest.REF_DOC_NO);
          setSelectedRefDoc(refDoc || null);

          const division = vendorDivisionData?.find((div) => div.DIV_CODE === vendorRequest.DIV_CODE);
          setSelectedDivision(division || null);
        }
      } catch (error) {
        console.error('Error loading Vendor request:', error);
      }
    }
  };

  // useEffect(() => {
  //   getVendorRefDoc();
  //   if (isEditMode) {
  //     loadVendorRequest();
  //   }
  // }, []);

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <CustomAlert />
        <Paper elevation={1}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label={intl.formatMessage({ id: 'InvoiceInformation' }) || 'Invoice Information'} />
            <Tab label={intl.formatMessage({ id: 'InvoiceDetails' }) || 'Invoice Details'} />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'DocNo' }) || 'Doc No'}
                    variant="outlined"
                    value={GenReqNum}
                    InputProps={{
                      readOnly: true, // Makes it non-editable but keeps normal styling
                      sx: {
                        color: 'grey', // Dark grey text
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={intl.formatMessage({ id: 'DocDate' }) || 'Doc Date'}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={convertToInputFormat(vendorRequest?.DOC_DATE) || ''}
                    InputProps={{
                      readOnly: true, // Makes it non-editable but keeps normal styling
                      sx: {
                        color: 'grey', // Dark grey text
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  {isEditMode ? (
                    <TextField
                      fullWidth
                      label={intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No'}
                      variant="outlined"
                      value={vendorRequest?.REF_DOC_NO || ''}
                      InputProps={{ readOnly: isEditMode, sx: { color: 'grey' } }}
                    />
                  ) : (
                    <Autocomplete
                      options={vendorRefDoc || []}
                      getOptionLabel={(option) => option.DOC_NO || ''}
                      value={selectedRefDoc}
                      isOptionEqualToValue={(option, value) => option.DOC_NO === value?.DOC_NO}
                      onChange={(event, newValue) => {
                        setSelectedRefDoc(newValue);
                        if (newValue) {
                          setVendorRequest((prev) =>
                            prev
                              ? { ...prev, DOC_NO: newValue.DOC_NO || '' }
                              : { COMPANY_CODE: '', DOC_NO: newValue.DOC_NO || '', items: [] }
                          );

                          const division = vendorDivisionData?.find((div) => div.DIV_CODE === newValue.DIV_CODE);
                          setSelectedDivision(division || null);
                          getVendorDetails(newValue.DOC_NO);
                        } else {
                          setSelectedDivision(null);
                          setVendorDetails([]);
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No'} variant="outlined" />}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Well Id' }) || 'Well Id'}
                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC1: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC1: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC1 || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'RIG No' }) || 'RIG No'}
                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC2: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC2: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC2 || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Truck No' }) || 'Truck No'}
                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC3: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC3: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC3 || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'InvoiceNo' }) || 'Invoice No'}
                    variant="outlined"
                    value={vendorRequest?.INVOICE_NUMBER || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev
                          ? { ...prev, INVOICE_NUMBER: e.target.value }
                          : { COMPANY_CODE: '', DOC_NO: '', items: [], INVOICE_NUMBER: e.target.value }
                      )
                    }
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  // InputProps={{ readOnly: isEditMode, sx: { color: '#9e9e9e' }  }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date'}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    value={convertToInputFormat(vendorRequest?.INVOICE_DATE) || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'AccountNumber' }) || 'Account Number'}
                    variant="outlined"
                    value={vendorAccountData?.[0]?.AC_CODE || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={10}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'AccountName' }) || 'Account Name'}
                    variant="outlined"
                    value={vendorAccountData?.[0]?.AC_NAME || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Phone' }) || 'Phone'}
                    variant="outlined"
                    value={vendorAccountData?.[0]?.PHONE || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Address' }) || 'Address'}
                    variant="outlined"
                    value={vendorAccountData?.[0]?.ADDRESS || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Fax' }) || 'Fax'}
                    variant="outlined"
                    value={vendorAccountData?.[0]?.FAX || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'DivisionCode' }) || 'Division Code'}
                    variant="outlined"
                    value={selectedDivision?.DIV_CODE || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Division Name' }) || 'Division Name'}
                    variant="outlined"
                    value={selectedDivision?.DIV_NAME || ''}
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
                    variant="outlined"
                    value={vendorRequest?.REMARKS || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REMARKS: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REMARKS: e.target.value }
                      )
                    }
                    InputProps={{
                      readOnly: isEditMode,
                      sx: isEditMode ? { color: 'grey' } : {}
                    }}
                  // InputProps={{ readOnly: isEditMode, sx: { color: '#9e9e9e' } }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 1, maxWidth: '100%' }}>
              <VendorItemDetails
                vendorDetails={vendorDetails}
                setUpdatedRows={setUpdatedRows}
                updatedRows={updatedRows}
                hideReset={isEditMode}
                disabled={isEditMode}
              />
            </Box>
          )}
        </Paper>

        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <ButtonGroup variant="contained" size="small">
            <Button
              sx={{ backgroundColor: '#082a89' }}
              endIcon={<IoSendSharp />}
              onClick={() => handleSubmit('SAVEASDRAFT')}
              disabled={isEditMode}
            >
              {intl.formatMessage({ id: 'SaveAsDraft' }) || 'Save As Draft'}
            </Button>
            <Button
              sx={{ backgroundColor: '#082a89' }}
              endIcon={<IoSendSharp />}
              onClick={() => handleSubmit('SUBMITTED')}
              disabled={isEditMode}
            >
              {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="outlined" size="medium" aria-label="Basic button group">
            <Tooltip title={intl.formatMessage({ id: 'AttachAndView' }) || 'Attach & View'}>
              {/* {!hideAttachIcon && isEditMode ? (
                    ) : (
                <Button disabled>
                  <IoIosAttach />
                </Button>
              )} */}


              <Button onClick={() => setFilesDialogOpen(true)}>
                <IoIosAttach />
              </Button>

            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'PrintInvoice' }) || 'Print Invoice'}>
              <span>
                <Button
                  onClick={handleInvoicePrint}
                  disabled={!(GenReqNum || vendorRequest?.DOC_NO || selectedRefDoc?.DOC_NO || requestData?.DOC_NO)}
                >
                  <FaPrint />
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'Exit' }) || 'Exit'}>
              <Button onClick={onClose}>
                <ImExit />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Grid>

        {uploadFilesPopup && uploadFilesPopup.action.open && (
          <UniversalDialog
            action={{ ...uploadFilesPopup.action }}
            onClose={handleUploadPopup}
            title={uploadFilesPopup.title}
            hasPrimaryButton={false}
          >
            <EnhancedVendorFilesDialog
              requestNumber={requestData?.DOC_NO || ''}
              isViewMode={!isEditMode}
              onClose={() => setFilesDialogOpen(false)}
            />
          </UniversalDialog>
        )}
        {filesDialogOpen && (
          <EnhancedVendorFilesDialog
            requestNumber={requestData?.DOC_NO || ''}
            isViewMode={!isEditMode} onClose={() => setFilesDialogOpen(false)}
            title={`Attachments for Request: ${requestData?.DOC_NO || ''}`}
          />
        )}

        {/* Bold report preview dialog */}
        {previewReportPopup.action.open && (
          <UniversalDialog
            action={previewReportPopup.action}
            onClose={() =>
              setPreviewReportPopup((p) => ({ ...p, action: { ...p.action, open: false } }))
            }
            title={previewReportPopup.title}
            hasPrimaryButton={false}
          >
            <WmsReportView
              reportId={previewReportPopup.data.reportId}
              parameters={{
                DOC_NO: previewReportPopup.data?.params?.DOC_NO,
                COMPANY_CODE: previewReportPopup.data?.params?.COMPANY_CODE
              }}
              onClose={() =>
                setPreviewReportPopup((p) => ({ ...p, action: { ...p.action, open: false } }))
              }
            />
          </UniversalDialog>
        )}
      </Box>
    </div>
  );
};

export default VendorRequestFormDisAct;
