import React, { useEffect, useState } from 'react';
import { Box, Paper, Tabs, Tab, Grid, ButtonGroup, Button, TextField, Autocomplete, Tooltip } from '@mui/material';
import { IoSendSharp } from 'react-icons/io5';
import CustomAlert from 'components/@extended/CustomAlert';
import { detailsTVendor, TVendorMain } from '../vendorTypes/TVendor';

import VendorItemDetails from '../forms/VendorItemDetails';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import VendorRequestService from '../services/VendorRequestService';
import { IRefDocNo } from '../services/VendorRequestService';
import { showAlert } from 'store/CustomAlert/alertSlice';
// import VendorSerivceInstance from '.../VendorSystem/service.vendor';
import VendorSerivceInstance from '../services/service.vendor'
import { IoIosAttach } from 'react-icons/io';
import { ImExit } from 'react-icons/im';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import EnhancedVendorFilesDialog from '../components/EnhancedVendorFilesDialog';
import { openBackdrop, closeBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

interface VendorDetailsTabProps {
  ac_code: string;
  isEditMode: boolean;
  requestData: TVendorMain | null;
  requestNumber: string | null;
  onClose?: () => void;
  onTabChange?: (tabIndex: number) => void;
}

const VendorReqInProgress: React.FC<VendorDetailsTabProps> = ({
  ac_code,
  isEditMode,
  requestData,
  requestNumber,
  onClose,
  onTabChange
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedRefDoc, setSelectedRefDoc] = useState<IRefDocNo | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<{ DIV_CODE: string; DIV_NAME: string } | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const intl = useIntl();

  // const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: intl.formatMessage({ id: 'Upload Files' }) || 'Upload Files',
  });
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // console.log('selected val', selectedRefDocNo);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const { data: vendorDivisionData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => VendorRequestService.getDivisionList()
  });

  console.log('vendor division', vendorDivisionData);

  const { data: vendorAccountData } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return await VendorRequestService.getAccountsList('BSG', ac_code ?? undefined);
    },
    enabled: !!ac_code
  });

  console.log('vendor ac ', vendorAccountData);

  const company_code = 'BSG';

  const [vendorRefDoc, setVendorRefDoc] = useState<IRefDocNo[]>([]);
  const getVendorRefDoc = async () => {
    const data = await VendorRequestService.getRefDocNo(company_code, user?.loginid ?? '');
    console.log('vendorRefDoc', data);
    setVendorRefDoc(data || []);
  };

  const [vendorDetails, setVendorDetails] = useState<detailsTVendor[]>([]);
  const [vendorRequest, setVendorRequest] = useState<TVendorMain | null>(null);

  const getVendorDetails = async (docNo: string) => {
    if (!docNo) return;
    const Detailsdata = await VendorRequestService.getDetails(company_code, user?.loginid ?? '', docNo);
    console.log('vendorDetails', Detailsdata);
    setVendorDetails(Detailsdata || []);
  };

  // Call API whenever selectedDoc changes
  useEffect(() => {
    if (vendorAccountData?.[0]) {
      setVendorRequest((prev) => ({
        COMPANY_CODE: vendorAccountData?.[0]?.COMPANY_CODE || '',
        DOC_NO: prev?.DOC_NO || '',
        items: prev?.items || [],
        REMARKS: prev?.REMARKS || ''
        // Add other TVendorMain properties as needed, e.g. AC_CODE, AC_NAME, etc.
      }));
    }
  }, [vendorAccountData]);

  useEffect(() => {
    if (selectedRefDoc?.DOC_NO) {
      getVendorDetails(selectedRefDoc.DOC_NO);
    } else {
      setVendorDetails([]);
    }
  }, [selectedRefDoc]);

  const handleUploadPopup = () => {
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };
  const handleSubmit = async (LAST_ACTION: string) => {
    // ✅ Only validate if NOT in edit mode
    if (!isEditMode) {
      if (!selectedRefDoc?.DOC_NO) {
        dispatch(
          showAlert({
            open: true,
            message: intl.formatMessage({ id: 'RefDocNoRequired' }) || 'Ref Doc No is required!',
            severity: 'warning'
          })
        );
        return;
      }

      if (!vendorRequest?.INVOICE_NUMBER?.trim()) {
        dispatch(
          showAlert({
            open: true,
            message: intl.formatMessage({ id: 'InvoiceNumberRequired' }) || 'Invoice Number is required!',
            severity: 'warning'
          })
        );
        return;
      }
    }

    // Proceed with submit
    dispatch(openBackdrop());
    try {
      const formattedPayload: TVendorMain = {
        ...vendorRequest,
        LAST_ACTION: LAST_ACTION,
        EDIT_USER: user?.loginid || '',
        COMPANY_CODE: String(user?.company_code || ''),
        DOC_TYPE: selectedRefDoc?.DOC_TYPE || vendorRequest?.DOC_TYPE || '',
        DOC_NO: !isEditMode ? '' : String(vendorRequest?.DOC_NO ?? ''),
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
        items: ((vendorDetails && vendorDetails.length > 0) ? vendorDetails : (vendorRequest?.items ?? [])).map((item) => ({
          ...item,
          DOC_DATE: item.DOC_DATE || (vendorRequest?.DOC_DATE ?? new Date().toISOString().slice(0, 10)),
          AC_CODE: String(item.AC_CODE || vendorRequest?.AC_CODE || '')
        }))
      };

      console.log('Payload sending to API1:', formattedPayload);
      console.log('inside form before')
      const requestNumber = await VendorSerivceInstance.updateVendorerequest(formattedPayload);
      if (requestNumber) {
        dispatch(
          showAlert({
            open: true,
            message: `${requestNumber} Approved Successfully`,
            severity: 'success'
          })
        );

        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      } else {
        throw new Error('Update returned false.');
      }
    } catch (error: any) {
      console.error('Error during vendor request update:', error?.message || error);
      dispatch(
        showAlert({
          open: true,
          message: intl.formatMessage({ id: 'VendorRequestUpdateError' }) || 'Something went wrong while updating the vendor request!',
          severity: 'error'
        })
      );
    } finally {
      dispatch(closeBackdrop());
    }
  };

  const loadVendorRequest = async () => {
    if (requestData) {
      try {
        const combined = `${requestData.DOC_NO}$$$${user?.loginid ?? ''}`;
        const vendorRequest = await VendorSerivceInstance.getVendorrequest(combined);
        console.log('Received Vendor request data:', vendorRequest);
        setVendorRequest(vendorRequest ?? null);
        setVendorDetails(vendorRequest?.items ?? []);

        if (vendorRequest) {
          // ✅ pre-select Ref Doc
          const refDoc = vendorRefDoc?.find((doc) => doc.DOC_NO === vendorRequest.REF_DOC_NO);
          setSelectedRefDoc(refDoc || null);

          // ✅ pre-select Division
          const division = vendorDivisionData?.find((div) => div.DIV_CODE === vendorRequest.DIV_CODE);
          setSelectedDivision(division || null);
        }
      } catch (error) {
        console.error('Error loading Vendor request:', error);
      }
    }
  };

  useEffect(() => {
    getVendorRefDoc();
    if (isEditMode) {
      loadVendorRequest();
    }
  }, []);
  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <CustomAlert />
        {/* <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        
        </Typography> */}
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

                    disabled
                    value={
                      isEditMode
                        ? vendorRequest?.DOC_NO || '' // string
                        : '' // ensure fallback string
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={intl.formatMessage({ id: 'DocDate' }) || 'Doc Date'}
                    variant="outlined"
                    disabled
                    InputLabelProps={{ shrink: true }}
                    value={vendorRequest?.DOC_DATE || new Date().toISOString().split('T')[0]}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  {isEditMode ? (
                    showAutocomplete ? (
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
                                ? { ...prev, REF_DOC_NO: newValue.DOC_NO || '' }
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
                        renderInput={(params) => <TextField {...params} label="*Ref Doc No"
                          disabled variant="outlined" />}
                        open={autoOpen} // force dropdown open
                        onOpen={() => setAutoOpen(true)}
                        onClose={() => setAutoOpen(false)}
                        autoHighlight
                        onBlur={() => setShowAutocomplete(false)}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={`${intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No'} *`}
                        variant="outlined"
                        disabled
                        value={vendorRequest?.REF_DOC_NO || ''}
                        InputProps={{ readOnly: true }}
                        onClick={() => {
                          setShowAutocomplete(true);
                          setAutoOpen(true); // immediately open dropdown
                        }}
                      />
                    )
                  ) : (
                    <Autocomplete
                      options={vendorRefDoc || []}
                      getOptionLabel={(option) => option.DOC_NO || ''}
                      value={selectedRefDoc} // ✅ use selectedDoc here
                      isOptionEqualToValue={(option, value) => option.DOC_NO === value?.DOC_NO}
                      onChange={(event, newValue) => {
                        setSelectedRefDoc(newValue);
                        if (newValue) {
                          setVendorRequest((prev) =>
                            prev
                              ? { ...prev, DOC_NO: newValue.DOC_NO || '' }
                              : { COMPANY_CODE: '', DOC_NO: newValue.DOC_NO || '', items: [] }
                          );

                          // ✅ update division when Ref Doc changes
                          const division = vendorDivisionData?.find((div) => div.DIV_CODE === newValue.DIV_CODE);
                          setSelectedDivision(division || null);

                          getVendorDetails(newValue.DOC_NO);
                        } else {
                          setSelectedDivision(null);
                          setVendorDetails([]);
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="Ref Doc No" disabled variant="outlined" />}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Well Id"
                    type="text"
                    variant="outlined"
                    disabled
                    value={vendorRequest?.REF_DOC1 || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        color: '#9e9e9e'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="RIG No"
                    type="text"
                    variant="outlined"
                    disabled
                    value={vendorRequest?.REF_DOC2 || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        color: '#9e9e9e'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Truck No"
                    type="text"
                    variant="outlined"
                    disabled
                    value={vendorRequest?.REF_DOC3 || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        color: '#9e9e9e'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={`${intl.formatMessage({ id: 'InvoiceNo' }) || 'Invoice No'} *`}
                    variant="outlined"
                    disabled
                    value={vendorRequest?.INVOICE_NUMBER || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev
                          ? { ...prev, INVOICE_NUMBER: e.target.value }
                          : { COMPANY_CODE: '', DOC_NO: '', items: [], INVOICE_NUMBER: e.target.value }
                      )
                    }
                  />
                  {/* value={vendorRequest?.INVOICE_NUMBER || ''} */}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={`${intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date'} *`}
                    type="date"
                    disabled
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    value={vendorRequest?.INVOICE_DATE || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev
                          ? { ...prev, INVOICE_DATE: e.target.value }
                          : { COMPANY_CODE: '', DOC_NO: '', items: [], INVOICE_DATE: e.target.value }
                      )
                    }
                  />
                  {/* value={vendorRequest?.INVOICE_DATE || ''} */}
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'AccountNumber' }) || 'Account Number'}
                    variant="outlined"

                    disabled
                    value={vendorAccountData?.[0]?.AC_CODE || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        // backgroundColor: '#f5f5f5', // Light grey
                        color: '#9e9e9e' // Darker grey for text
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'AccountName' }) || 'Account Name'}
                    variant="outlined"
                    disabled
                    value={vendorAccountData?.[0]?.AC_NAME || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        // backgroundColor: '#f5f5f5', // Light grey
                        color: '#9e9e9e' // Darker grey for text
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Phone' }) || 'Phone'}
                    variant="outlined"
                    disabled
                    value={vendorAccountData?.[0]?.PHONE || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        // backgroundColor: '#f5f5f5', // Light grey
                        color: '#9e9e9e' // Darker grey for text
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Address' }) || 'Address'}
                    variant="outlined"
                    disabled
                    value={vendorAccountData?.[0]?.ADDRESS || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        // backgroundColor: '#f5f5f5', // Light grey
                        color: '#9e9e9e' // Darker grey for text
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Fax' }) || 'Fax'}
                    variant="outlined"
                    disabled
                    value={vendorAccountData?.[0]?.FAX || ''}
                    InputProps={{
                      disabled: true,
                      sx: {
                        // backgroundColor: '#f5f5f5', // Light grey
                        color: '#9e9e9e' // Darker grey for text
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'DivisionCode' }) || 'Division Code'}
                    variant="outlined"
                    disabled
                    value={selectedDivision?.DIV_CODE || ''}
                    InputProps={{ disabled: true, sx: { color: '#9e9e9e' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={intl.formatMessage({ id: 'Division Name' }) || 'Division Name'}
                    variant="outlined"
                    disabled
                    value={selectedDivision?.DIV_NAME || ''}
                    InputProps={{ disabled: true, sx: { color: '#9e9e9e' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextField

                    fullWidth
                    label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
                    variant="outlined"
                    disabled
                    value={vendorRequest?.REMARKS || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REMARKS: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REMARKS: e.target.value }
                      )
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && <Box sx={{ p: 2, maxWidth: '100%' }}>{<VendorItemDetails vendorDetails={vendorDetails} />}</Box>}
        </Paper>

        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          {/* Left side: Save as Draft + Submit */}
          <ButtonGroup variant="contained" size="small">
            <Button sx={{ backgroundColor: '#082a89' }} endIcon={<IoSendSharp />} disabled onClick={() => handleSubmit('SAVEASDRAFT')} >
              {intl.formatMessage({ id: 'SaveAsDraft' }) || 'Save As Draft'}
            </Button>
            <Button sx={{ backgroundColor: '#082a89' }} endIcon={<IoSendSharp />} disabled onClick={() => handleSubmit('SUBMITTED')}>
              {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="outlined" size="medium" aria-label="Basic button group">
            <Tooltip title={intl.formatMessage({ id: 'AttachView' }) || 'Attach & View'}>
              {isEditMode ? (
                <Button onClick={() => setFilesDialogOpen(true)}>
                  <IoIosAttach />
                </Button>
              ) : (
                <Button disabled>
                  <IoIosAttach />
                </Button>
              )}
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
          <EnhancedVendorFilesDialog requestNumber={requestData?.DOC_NO || ''} isViewMode={!isEditMode} onClose={() => setFilesDialogOpen(false)} />
        )}
      </Box>
    </div>
  );
};

export default VendorReqInProgress;
