import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Paper, Tabs, Tab, Grid, ButtonGroup, Button, TextField, Autocomplete, Tooltip } from '@mui/material';
import { IoSendSharp } from 'react-icons/io5';
import CustomAlert from 'components/@extended/CustomAlert';
import { detailsTVendor, TVendorMain } from '../vendorTypes/TVendor';
import VendorItemDetails from './VendorItemDetails';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import VendorRequestService from '../services/VendorRequestService';
import { IRefDocNo } from '../services/VendorRequestService';
import { showAlert } from 'store/CustomAlert/alertSlice';
import VendorSerivceInstance from '../services/service.vendor';
import { IoIosAttach } from 'react-icons/io';
import { ImExit } from 'react-icons/im';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import { openBackdrop, closeBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import EnhancedVendorFilesDialog from '../components/EnhancedVendorFilesDialog';

interface VendorDetailsTabProps {
  ac_code: string;
  isEditMode: boolean;
  requestData: TVendorMain | null;
  requestNumber: string | null;
  onClose?: () => void;
  onTabChange?: (tabIndex: number) => void;
}

const VendorRequestForm: React.FC<VendorDetailsTabProps> = ({ ac_code, isEditMode, requestData, requestNumber, onClose, onTabChange }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedRefDoc, setSelectedRefDoc] = useState<IRefDocNo | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<{ DIV_CODE: string; DIV_NAME: string } | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [attachDisable, setAttachDisable] = useState(true)
  const [displayDoc, setDisplayDoc] = useState<any>('')
  const refDocInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files'
  });

  // dialogEditable: allow uploads when we have a request number (displayDoc) or when editing an existing request
  const dialogEditable = Boolean(displayDoc) || isEditMode;

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

  console.log('vendor division', vendorDivisionData);

  const { data: vendorAccountData, isLoading: isAccountLoading } = useQuery({
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
  const [updatedRows, setUpdatedRows] = useState<detailsTVendor[]>([]);

  console.log("vendor item details", vendorDetails)
  console.log("updateRow", updatedRows)

  const [vendorRequest, setVendorRequest] = useState<TVendorMain | null>(null);


  useEffect(() => {
    if (!isEditMode && !vendorRequest) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      console.log('Initializing dates with:', formattedDate);

      setVendorRequest({
        COMPANY_CODE: '',
        DOC_NO: '',
        items: [],
        INVOICE_DATE: formattedDate,
        DOC_DATE: formattedDate,
        INVOICE_NUMBER: '',
        REMARKS: '',
        REF_DOC_NO: '',
        DOC_TYPE: '',
        PDO_TYPE: '',
        CURR_CODE: '',
        AC_NAME: '',
        ADDRESS: '',
        FAX: '',
        PHONE: '',
        DIV_CODE: '',
        DIV_NAME: '',
        AC_CODE: '',
        LAST_ACTION: '',
        EDIT_USER: '',
        EX_RATE: 0
      });
    }
  }, [isEditMode, vendorRequest]);

  const getVendorDetails = useCallback(
    async (docNo: string) => {
      if (!docNo) return;

      const Detailsdata: detailsTVendor[] | undefined = await VendorRequestService.getDetails(company_code, user?.loginid ?? '', docNo);

      // Ensure we have an array before using map
      const safeDetails: detailsTVendor[] = Detailsdata ?? [];

      console.log('vendorDetails test', safeDetails);

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

  console.log('Detailsdata test', getVendorDetails)

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
    if (isAccountLoading) {
      dispatch(openBackdrop());
    } else {
      dispatch(closeBackdrop());
    }
  }, [isAccountLoading, dispatch]);

  const handleUploadPopup = () => {
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleSubmit = async (LAST_ACTION: string) => {
    // Debug current state before validation
    console.log('Before validation - vendorRequest:', vendorRequest);
    console.log('Before validation - INVOICE_DATE:', vendorRequest?.INVOICE_DATE);

    const totalQty = updatedRows.reduce((sum, row) => sum + (Number(row.QTY) || 0), 0);

    if (totalQty === 0) {
      dispatch(
        showAlert({
          open: true,
          message: 'Total Quantity cannot be 0. Please update at least one item.',
          severity: 'warning'
        })
      );
      return;
    }

    // validation  
    if (!isEditMode) {
      if (!selectedRefDoc?.DOC_NO) {
        dispatch(showAlert({ open: true, message: 'Ref Doc No is required!', severity: 'warning' }));
        return;
      }

      if (!vendorRequest?.INVOICE_NUMBER?.trim()) {
        dispatch(showAlert({ open: true, message: 'Invoice Number is required!', severity: 'warning' }));
        return;
      }

      if (!vendorRequest?.INVOICE_DATE) {
        dispatch(showAlert({ open: true, message: 'Invoice Date is required!', severity: 'warning' }));
        return;
      }
    }

    dispatch(openBackdrop());

    try {
      const formattedPayload: TVendorMain = {
        ...vendorRequest,
        DOC_NO:
          (LAST_ACTION === 'SAVEASDRAFT' || LAST_ACTION === 'SUBMITTED')
            ? displayDoc || ''
            : '',
        // DOC_NO:displayDoc,
        AC_CODE: vendorAccountData?.[0]?.AC_CODE || '',
        LAST_ACTION,
        EDIT_USER: user?.loginid || '',
        COMPANY_CODE: String(user?.company_code || ''),
        DOC_TYPE: selectedRefDoc?.DOC_TYPE || vendorRequest?.DOC_TYPE || '',
        REF_DOC_NO: selectedRefDoc?.DOC_NO || vendorRequest?.REF_DOC_NO || '',
        REF_DOC1: vendorRequest?.REF_DOC2 == null ? '' : String(vendorRequest.REF_DOC1),
        REF_DOC2: vendorRequest?.REF_DOC2 == null ? '' : String(vendorRequest.REF_DOC2),
        REF_DOC3: vendorRequest?.REF_DOC3 == null ? '' : String(vendorRequest.REF_DOC3),
        PDO_TYPE: selectedRefDoc?.PDO_TYPE || vendorRequest?.PDO_TYPE || '',
        EX_RATE:
          typeof selectedRefDoc?.EX_RATE === 'number'
            ? selectedRefDoc.EX_RATE
            : typeof selectedRefDoc?.EX_RATE === 'string'
              ? Number(selectedRefDoc.EX_RATE) || undefined
              : typeof vendorRequest?.EX_RATE === 'number'
                ? vendorRequest.EX_RATE
                : typeof vendorRequest?.EX_RATE === 'string'
                  ? Number(vendorRequest.EX_RATE) || undefined
                  : undefined,
        CURR_CODE: selectedRefDoc?.CURR_CODE || vendorRequest?.CURR_CODE || '',
        DOC_DATE: vendorRequest?.DOC_DATE || new Date().toISOString().slice(0, 10),
        AC_NAME: String(vendorAccountData?.[0]?.AC_NAME || vendorRequest?.AC_NAME || ''),
        ADDRESS: String(vendorAccountData?.[0]?.ADDRESS || vendorRequest?.ADDRESS || ''),
        FAX: String(vendorAccountData?.[0]?.FAX || vendorRequest?.FAX || ''),
        PHONE: String(vendorAccountData?.[0]?.PHONE || vendorRequest?.PHONE || ''),
        REMARKS: vendorRequest?.REMARKS == null ? '' : String(vendorRequest.REMARKS),
        INVOICE_NUMBER: vendorRequest?.INVOICE_NUMBER || '',
        INVOICE_DATE: vendorRequest?.INVOICE_DATE || '',
        DIV_CODE: selectedDivision?.DIV_CODE || vendorRequest?.DIV_CODE || '',
        DIV_NAME: selectedDivision?.DIV_NAME || vendorRequest?.DIV_NAME || '',

        items:
          (updatedRows ?? [])
            .filter((item) => {
              if (LAST_ACTION === "SAVEASDRAFT") {
                // include all items, even qty = 0
                return true;
              }
              // for submit or any other action, exclude qty = 0
              return item.QTY !== 0;
            })
            .map((item) => ({
              ...item,
              QTY: Number(item.QTY),
              DOC_DATE:
                item.DOC_DATE ||
                vendorRequest?.DOC_DATE ||
                new Date().toISOString().slice(0, 10),
              AC_CODE: String(item.AC_CODE || vendorRequest?.AC_CODE || ""),
              ORIGINAL_QTY: item.ORIGINAL_QTY ?? 0
            }))
      };

      console.log('Payload before sending:', formattedPayload);
      console.log('INVOICE_DATE in payload:', formattedPayload.INVOICE_DATE);

      console.log("formate payload doc no", formattedPayload.DOC_NO);
      console.log('fomated payload ac code', formattedPayload.AC_CODE);
       console.log('formattedPayload4 ' , formattedPayload);
      const requestNumber = await VendorSerivceInstance.updateVendorerequest(formattedPayload);

      console.log('Returned request number:', requestNumber);

      if (requestNumber) {
        formattedPayload.DOC_NO = requestNumber;
        setDisplayDoc(requestNumber);

        console.log('Second time calling with refdoc:5', formattedPayload);

        // await VendorSerivceInstance.updateVendorerequest(formattedPayload);
        if (isEditMode) {
          dispatch(
            showAlert({
              open: true,
              message: `${requestNumber} Saved Successfully!`,
              severity: 'success'
            })
          )
        } else {
          dispatch(
            showAlert({
              open: true,
              message: `${requestNumber} Document Generated Successfully!`,
              severity: 'success'
            })
          )
        }
        ;
        setAttachDisable(false);
        if (LAST_ACTION === 'SUBMITTED' && onClose) {
          // Give a small delay so the success alert shows first
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        throw new Error('Update returned false.');
      }
    } catch (error: any) {
      console.error('Error during vendor request update:', error?.message || error);
      dispatch(
        showAlert({
          open: true,
          message: 'Something went wrong while updating the vendor request!',
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
        console.log('vendorRequest for edit', vendorRequest);
        setDisplayDoc(vendorRequest?.DOC_NO);
        setVendorRequest(vendorRequest ?? null);
        setVendorDetails(vendorRequest?.items ?? []);
        setUpdatedRows(vendorRequest?.items ?? []);

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


  const convertToInputFormat = (dateStr: string | null | undefined): string => {
    if (!dateStr) {
      // Return today's date in YYYY-MM-DD format for input
      return new Date().toISOString().split('T')[0];
    }

    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Handle DD-MM-YYYY format
        if (parts[0].length === 2 && parts[2].length === 4) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        // Handle YYYY-MM-DD format (already correct)
        else if (parts[0].length === 4) {
          return dateStr;
        }
      }
    }

    // Fallback to today's date
    return new Date().toISOString().split('T')[0];
  };

  const handleDocDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // YYYY-MM-DD
    const [year, month, day] = newDate.split('-');
    const formattedDate = `${day}-${month}-${year}`; // DD-MM-YYYY

    setVendorRequest((prev) =>
      prev ? { ...prev, DOC_DATE: formattedDate } :
        { COMPANY_CODE: '', DOC_NO: '', items: [], DOC_DATE: formattedDate }
    );
  };

  const handleInvoiceDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const [year, month, day] = newDate.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    console.log('Setting invoice date:', formattedDate);

    setVendorRequest((prev) => {
      const updated = prev ?
        { ...prev, INVOICE_DATE: formattedDate } :
        { COMPANY_CODE: '', DOC_NO: '', items: [], INVOICE_DATE: formattedDate };
      console.log('Updated vendor request:', updated);
      return updated;
    });
  };

  // Debug current state
  useEffect(() => {
    console.log('Current vendorRequest state:', vendorRequest);
    console.log('Current INVOICE_DATE:', vendorRequest?.INVOICE_DATE);
  }, [vendorRequest]);

  // Update the TextField components in the render section
  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <CustomAlert />
        <Paper elevation={1}>
          <div>
            <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
              <Tab label="Invoice Information" />
              <Tab label="Invoice Details" />
            </Tabs>
          </div>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Doc No"
                    variant="outlined"
                    InputProps={{
                      disabled: true,
                      sx: {
                        color: 'grey'
                      }
                    }}
                    value={displayDoc || (isEditMode ? vendorRequest?.DOC_NO : '')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Doc Date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={convertToInputFormat(vendorRequest?.DOC_DATE)}
                    onChange={handleDocDateChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  {isEditMode ? (
                    showAutocomplete ? (
                      <Autocomplete
                        options={Array.isArray(vendorRefDoc) ? vendorRefDoc : []}
                        getOptionLabel={(option) => option.DOC_NO || ''}
                        value={selectedRefDoc}
                        isOptionEqualToValue={(option, value) => option.DOC_NO === value?.DOC_NO}
                        onChange={(event, newValue) => {
                          setSelectedRefDoc(newValue);
                          if (newValue) {
                            setVendorRequest((prev) =>
                              prev
                                ? { ...prev, REF_DOC_NO: newValue.DOC_NO || '' }
                                : { COMPANY_CODE: '', DOC_NO: '', REF_DOC_NO: newValue.DOC_NO || '', items: [] }
                            );

                            const division = vendorDivisionData?.find((div) => div.DIV_CODE === newValue.DIV_CODE);
                            setSelectedDivision(division || null);

                            getVendorDetails(newValue.DOC_NO);
                          } else {
                            setSelectedDivision(null);
                            setVendorDetails([]);
                          }
                        }}
                        renderInput={(params) => <TextField {...params} label="*Ref Doc No" variant="outlined" inputRef={refDocInputRef} />}
                        open={autoOpen} // force dropdown open
                        onOpen={() => setAutoOpen(true)}
                        onClose={() => setAutoOpen(false)}
                        autoHighlight
                        onBlur={() => setShowAutocomplete(false)}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="*Ref Doc No"
                        variant="outlined"
                        inputRef={refDocInputRef}
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
                      options={Array.isArray(vendorRefDoc) ? vendorRefDoc : []}
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
                      renderInput={(params) => <TextField {...params} label="Ref Doc No" variant="outlined" inputRef={refDocInputRef} />}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Well Id"
                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC1: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC1: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC1 || ''}
                  // onChange={handleInvoiceDateChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="RIG No"
                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC2: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC2: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC2 || ''}
                  // onChange={handleInvoiceDateChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Truck No"

                    type="text"
                    variant="outlined"
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev ? { ...prev, REF_DOC3: e.target.value } : { COMPANY_CODE: '', DOC_NO: '', items: [], REF_DOC3: e.target.value }
                      )
                    }
                    value={vendorRequest?.REF_DOC3 || ''}
                  // onChange={handleInvoiceDateChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="*Invoice No"
                    variant="outlined"
                    value={vendorRequest?.INVOICE_NUMBER || ''}
                    onChange={(e) =>
                      setVendorRequest((prev) =>
                        prev
                          ? { ...prev, INVOICE_NUMBER: e.target.value }
                          : { COMPANY_CODE: '', DOC_NO: '', items: [], INVOICE_NUMBER: e.target.value }
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="*Invoice Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    required
                    value={convertToInputFormat(vendorRequest?.INVOICE_DATE)}
                    onChange={handleInvoiceDateChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    variant="outlined"
                    value={vendorAccountData?.[0]?.AC_CODE || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Account Name"
                    variant="outlined"
                    value={vendorAccountData?.[0]?.AC_NAME || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}

                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Phone"
                    variant="outlined"
                    value={vendorAccountData?.[0]?.PHONE || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    value={vendorAccountData?.[0]?.ADDRESS || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fax"
                    variant="outlined"
                    value={vendorAccountData?.[0]?.FAX || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Division Code"
                    variant="outlined"
                    value={selectedDivision?.DIV_CODE || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Division Name"
                    variant="outlined"
                    value={selectedDivision?.DIV_NAME || ''}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        color: 'grey',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    variant="outlined"
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


          {activeTab === 1 && (
            <Box sx={{ p: 1, maxWidth: '100%' }}>
              <VendorItemDetails
                vendorDetails={vendorDetails}
                setUpdatedRows={setUpdatedRows}
                updatedRows={updatedRows}
                requestNumber={displayDoc || requestData?.DOC_NO || ''}
              />
            </Box>
          )}
        </Paper>

        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          {/* Left side: Save as Draft + Submit */}
          <ButtonGroup variant="contained" size="small">
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
              endIcon={<IoSendSharp />}
              onClick={() => handleSubmit('SAVEASDRAFT')}
            >
              Save As Draft
            </Button>
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
              endIcon={<IoSendSharp />}
              onClick={() => handleSubmit('SUBMITTED')}
            >
              Submit
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="outlined" size="medium" aria-label="Basic button group">
            {isEditMode ? (
              <Tooltip title="Attach & View">
                <Button onClick={() => setFilesDialogOpen(true)}>
                  <IoIosAttach />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Attach & View">
                <Button disabled={attachDisable} onClick={() => setFilesDialogOpen(true)}>
                  <IoIosAttach />
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Exit">
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
              requestNumber={displayDoc || requestData?.DOC_NO || ''}
              isViewMode={!dialogEditable}
              hideUploadButton={!dialogEditable}
              onClose={() => setFilesDialogOpen(false)}
            />
          </UniversalDialog>
        )}

        {filesDialogOpen && (
          <EnhancedVendorFilesDialog
            requestNumber={displayDoc || requestData?.DOC_NO || ''}
            isViewMode={!dialogEditable}
            hideUploadButton={!dialogEditable}
            onClose={() => setFilesDialogOpen(false)}
            title={`Attachments for Request: ${displayDoc || requestData?.DOC_NO || ''}`}
          />
        )}
      </Box>
    </div>
  );
};

export default VendorRequestForm;