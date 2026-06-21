import { SaveOutlined } from '@ant-design/icons';
import {
  Button,
  // FormControl,
  Grid,
  IconButton,
  InputAdornment,
  // MenuItem,
  // Select,
  TextField,
  // Typography
  FormControl,
  // InputLabel,
  MenuItem,
  Select,
  // CircularProgress,
  // Typography,
  // FormHelperText,
  OutlinedInput,
  Autocomplete,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  Typography
  // Snackbar
} from '@mui/material';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import * as Yup from 'yup';
import useAuth from 'hooks/useAuth';
import { SearchOutlined } from '@ant-design/icons';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import DataSelection from 'components/popup/DataSelection';
import { TPair } from 'types/common';
// import { ISearch } from 'components/filters/SearchFilter';
import ManualPutwayServiceInstance from 'service/wms/transaction/inbound/service.inboundManualPutaway';
import { TPutawaymanual } from 'pages/WMS/Transaction/Inbound/types/manualputaway_wms.types';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
// import { TSite } from 'pages/WMS/types/site-wms.types';
import { openSnackbar } from 'store/reducers/snackbar';
import { ISearch } from 'components/filters/SearchFilter';

interface IAddInboundReceivingDetailsFormProps {
  isEditMode: boolean;
  onClose: (isSuccess: boolean) => void;
  job_no: string;
  prin_code: string;
  packdet_no?: string
  initialData?: {
    qty1_arrived: number;
    qty2_arrived: number;
    quantity_arrived: number;
    prod_code: string;
    prod_name: string;
    pack_qty: number;
    qty_luom: number;
    qty_puom: number;
    received_qty: number;
    container_no: string;
    batch_no: string;
    lot_no: string;
    mfg_date: Date;
    exp_date: Date;
    manu_code: string;
    origin_country: string;
    doc_ref: string;
    gross_weight: number;
    volume: number;
    shelf_life_days: number;
    shelf_life_date: Date;
    po_no: string;
    p_uom: string;
    l_uom: string;
    uppp: number;
    uom_count: number;
    quantity: number;
    // New fields
    site_code: string;
    location_code: string;
    qty_confirmed: number;
    pqty_confirmed: number;
    lqty_confirmed: number;
    puom_confirmed: string;
    luom_confirmed: string;
    upp: number;
    confirm_date: Date | null;
    cust_code: string;
    order_no: string;
    vessel_name: string;
    seal_no: string;
    bl_no: string;
    pallet_id: string;
    pallet_serial_no: string;
    curr_code: string;
    ex_rate: number;
    unit_price: number;
    selected: string;
    allocated: string;
    confirmed: string;
  };
}

const AddManualPutawayForm = (props: IAddInboundReceivingDetailsFormProps) => {
  console.log('AddManualPutawayForm rendered'); // Confirm component renders
  const [isProductDataSelection, setIsProductDataSelection] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ prod_name: string; uom_count: number; uppp: number }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [, setProductSelectError] = useState<string>('');
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [siteLoading, setSiteLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const dispatch = useDispatch();

  const filter: ISearch = {
    search: [[{ field_name: 'prin_code', field_value: props.prin_code, operator: 'exactmatch' }]]
  };

  // Fetch site data when dropdown opens - EXACTLY like PutwayDetailsModal
  const fetchSites = async () => {
    setSiteLoading(true);
    try {
      const sql_string = 'SELECT * FROM MS_SITE';
      const response = await WmsSerivceInstance.executeRawSql(sql_string) as any[] | { success?: boolean; data?: any[] };
      console.log('Site Raw SQL Response:', response);
      
      // Handle the response structure: { success: true, data: [...] }
      if (response && !Array.isArray(response) && response.success && response.data && Array.isArray(response.data)) {
        const mappedSites = response.data.map((site: any) => ({
          site_code: site.SITE_CODE || site.site_code,
          site_name: site.SITE_NAME || site.site_name,
          site_desc: site.SITE_DESC || site.site_desc
        }));
        
        console.log('Mapped Site Data:', mappedSites);
        setSiteOptions(mappedSites);
      } else if (response && Array.isArray(response)) {
        // Fallback: if response is directly an array
        const mappedSites = response.map((site: any) => ({
          site_code: site.SITE_CODE || site.site_code,
          site_name: site.SITE_NAME || site.site_name,
          site_desc: site.SITE_DESC || site.site_desc
        }));
        
        console.log('Mapped Site Data:', mappedSites);
        setSiteOptions(mappedSites);
      } else {
        console.warn('Unexpected response format:', response);
        setSiteOptions([]);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSiteOptions([]);
    } finally {
      setSiteLoading(false);
    }
  };

  // Fetch container data based on job_no and prin_code
  const { data: containerData } = useQuery({
    queryKey: ['container_no', props.prin_code, props.job_no],
    queryFn: async () => {
      const sql = `SELECT * FROM TI_CONTAINER WHERE PRIN_CODE = '${props.prin_code}' AND JOB_NO = '${props.job_no}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      console.log('Raw SQL Response:', response);
      if (response && Array.isArray(response) && response.length > 0) {
        // Map uppercase fields to lowercase
        const mappedData = response.map((item: any) => ({
          container_no: item.CONTAINER_NO || item.container_no,
          po_no: item.PO_NO || item.po_no,
          ...item
        }));
        console.log('Mapped Container Data:', mappedData);
        return {
          tableData: mappedData,
          count: mappedData.length
        };
      }
      return { tableData: [], count: 0 };
    },
    enabled: !!props.job_no && !!props.prin_code
  });

  const formik = useFormik({
    initialValues: {
      prod_code: '',
      pack_qty: 0,
      qty_puom: 0,
      qty_luom: 0,
      received_qty: 0,
      container_no: '',
      qty1_arrived: 0,
      qty2_arrived: 0,
      quantity_arrived: 0,
      batch_no: '',
      lot_no: '',
      mfg_date: null as unknown as Date,
      exp_date: null as unknown as Date,
      manu_code: '',
      origin_country: '',
      doc_ref: '',
      gross_weight: null as unknown as number,
      volume: null as unknown as number,
      shelf_life_days: null as unknown as number,
      shelf_life_date: null as unknown as Date,
      po_no: '',
      p_uom: '',
      l_uom: '',
      uppp: 0,
      submit: '',

      // New fields
      site_code: '',
      location_code: '',
      qty_confirmed: 0,
      pqty_confirmed: 0,
      lqty_confirmed: 0,
      puom_confirmed: '',
      luom_confirmed: '',
      upp: 0,
      confirm_date: null as unknown as Date,
      cust_code: '',
      order_no: '',
      vessel_name: '',
      seal_no: '',
      bl_no: '',
      pallet_id: '',
      pallet_serial_no: '',
      curr_code: '',
      ex_rate: 0,
      unit_price: 0,
      selected: 'Y',
      allocated: 'Y',
      confirmed: 'N'
    },
    validationSchema: Yup.object().shape({
      prod_code: Yup.string().required('Product is required'),
      pack_qty: Yup.number().min(0, 'Cannot be negative').required('Packing quantity is required'),
      qty_luom: Yup.number().min(0, 'Cannot be negative'),
      received_qty: Yup.number().min(0, 'Cannot be negative').required('Received quantity is required'),
      quantity_arrived: Yup.number().min(0, 'Cannot be negative').required('Quantity is required'),
      site_code: Yup.string().required('Site code is required'),
      location_code: Yup.string().required('Location code is required'),
      pallet_id: Yup.string().required('Pallet ID is required'),
      qty_confirmed: Yup.number().min(0, 'Cannot be negative').required('Confirmed quantity is required'),
      pqty_confirmed: Yup.number().min(0, 'Cannot be negative').required('Primary confirmed quantity is required'),
      lqty_confirmed: Yup.number().min(0, 'Cannot be negative').required('Lowest confirmed quantity is required'),
      puom_confirmed: Yup.string().required('Primary UOM is required'),
      luom_confirmed: Yup.string().required('Lowest UOM is required'),
      ex_rate: Yup.number().min(0, 'Cannot be negative'),
      unit_price: Yup.number().min(0, 'Cannot be negative')
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        console.log('Form submission started with values:', values);
        setSubmitting(true);

        // Check if required props are available
        if (!props.job_no || !props.prin_code) {
          throw new Error('Missing required data: job_no or prin_code');
        }

        if (!user?.company_code) {
          throw new Error('Company code is not available');
        }

        // Convert and normalize input values
        const qty1_arrived = Number(values.qty1_arrived);
        const qty2_arrived = Number(values.qty2_arrived);
        // Important: Ensure we're using the calculated quantity_arrived as received_qty
        const received_qty = Number(values.quantity_arrived);

        console.log('Calling updatePackingDetailsQuantity with:', {
          companyCode: user?.company_code,
          prinCode: props.prin_code,
          jobNo: props.job_no,
          qty1Arrived: qty1_arrived,
          qty2Arrived: qty2_arrived,
          receivedQty: received_qty
        });

        // Step 1: Update packing details quantity using raw SQL
        const updateResult = await updatePackingDetailsQuantity({
          companyCode: user?.company_code,
          prinCode: props.prin_code,
          jobNo: props.job_no,
          qty1Arrived: qty1_arrived,
          qty2Arrived: qty2_arrived,
          receivedQty: received_qty
        });

        console.log('updatePackingDetailsQuantity result:', updateResult);

        // Success - close the form
        props.onClose(true);
      } catch (error: any) {
        console.error('Form submission failed:', error);
        setFieldError('submit', error.message || 'Failed to submit form');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // List of required fields (asterisk/star fields)
  const requiredFields = [
    'container_no',
    'prod_code',
    'pallet_id',
    'qty1_arrived',
    'qty2_arrived',
    'quantity_arrived',
    'site_code',
    'location_code'
  ];

  // Helper to check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return requiredFields.every((field) => {
      const value = formik.values[field as keyof typeof formik.values];
      // For numbers, check not null/undefined and >= 0
      if (typeof value === 'number') return value !== null && value !== undefined && value >= 0;
      // For strings, check not empty
      return !!value;
    });
  };

  // Show snackbar error for missing required fields
  const showMissingFieldsSnackbar = () => {
    const missingFields = requiredFields.filter((field) => {
      const value = formik.values[field as keyof typeof formik.values];
      if (typeof value === 'number') return value === null || value === undefined;
      return !value;
    });
    if (missingFields.length > 0) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Please fill all required fields: ${missingFields.join(', ')}`,
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      return true;
    }
    return false;
  };

  // Fetch locations when site_code changes - EXACTLY like PutwayDetailsModal
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formik.values.site_code) {
        setLocationOptions([]);
        return;
      }

      setLocationLoading(true);
      try {
        const sql_string = `SELECT * FROM MS_LOCATION WHERE SITE_CODE = '${formik.values.site_code}'`;
        const response:any = await WmsSerivceInstance.executeRawSql(sql_string);
        console.log('Location Response:', response);

        // Handle the response structure: { success: true, data: [...] }
        let dataArray = [];
        if (response && !Array.isArray(response)) {
          dataArray = response.data;
        } else if (response && Array.isArray(response)) {
          dataArray = response;
        }

        const mappedLocations = dataArray.map((location: any) => ({
          location_code: location.LOCATION_CODE || location.location_code,
          loc_desc: location.LOC_DESC || location.loc_desc || location.location_name,
          site_code: location.SITE_CODE || location.site_code,
          loc_type: location.LOC_TYPE || location.loc_type,
          loc_stat: location.LOC_STAT || location.loc_stat
        }));

        console.log('Mapped Location Options:', mappedLocations);
        setLocationOptions(mappedLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocationOptions([]);
      } finally {
        setLocationLoading(false);
      }
    };
    fetchLocations();
  }, [formik.values.site_code]);

  // Helper function to update packing details quantity
  const updatePackingDetailsQuantity = async ({
    companyCode,
    prinCode,
    jobNo,
    qty1Arrived,
    qty2Arrived,
    receivedQty
  }: {
    companyCode?: string;
    prinCode: string;
    jobNo: string;
    qty1Arrived: number;
    qty2Arrived: number;
    receivedQty: number;
  }) => {
    try {
      if (!companyCode) {
        throw new Error('Company code is required');
      }

      console.log('Executing SQL update with parameters:', {
        companyCode,
        prinCode,
        jobNo,
        qty1Arrived,
        qty2Arrived,
        receivedQty
      });

      const query_parameter = `Inbound-PackdetUpd_Qty$$$${companyCode}`;
      const query_where = `\`1$string\` = '${user?.company_code}' AND \`2$string\` = '${props.prin_code}' AND \`3$string\` = '${props.job_no}'`;
      const query_updatevalues = `${qty1Arrived}$$$${qty2Arrived}$$$CURRENT_DATE()$$$${receivedQty}`;

      console.log('SQL parameters:', { query_parameter, query_where, query_updatevalues });

      type UpdateResponseType = { success?: boolean; [key: string]: any } | Array<{ success?: boolean; [key: string]: any }>;
      const updateResponse = (await WmsSerivceInstance.executeRawSqlbody(
        query_parameter,
        query_where,
        query_updatevalues
      )) as UpdateResponseType;

      console.log('SQL update response:', updateResponse);

      if (!updateResponse || (Array.isArray(updateResponse) ? !updateResponse[0]?.success : !updateResponse.success)) {
        throw new Error('Failed to update packing details quantity');
      }

      return updateResponse;
    } catch (error) {
      console.error('Error in updatePackingDetailsQuantity:', error);
      throw error;
    }
  };

  // Handle product selection from DataSelection component
  const handlePreferenceSelection = (data: TPair<'uom_count' | 'uppp' | 'p_uom' | 'l_uom'>) => {
    if (!formik.values.container_no) {
      setProductSelectError('Please select Container No. first');
      return;
    }
    // setProductSelectError('');
    formik.setFieldValue('prod_code', data.value);
    formik.setFieldValue('p_uom', data.p_uom);
    formik.setFieldValue('l_uom', data.l_uom);
    formik.setFieldValue('uppp', data.uppp as number);

    // Set UOM for confirmation fields
    formik.setFieldValue('puom_confirmed', data.p_uom);
    formik.setFieldValue('luom_confirmed', data.l_uom || data.p_uom);

    // Update UPP value
    formik.setFieldValue('upp', data.uppp as number);

    setSelectedProduct({ prod_name: data.label, uom_count: data.uom_count, uppp: data.uppp });
    setIsProductDataSelection(false);
  };

  // Calculate quantity based on primary and lowest UOM quantities
  useEffect(() => {
    if (!!selectedProduct) {
      if (selectedProduct?.uom_count <= 1) {
        formik.setFieldValue('quantity_arrived', Number(formik.values?.qty1_arrived) + Number(formik.values.qty2_arrived));
        return;
      }
      formik.setFieldValue(
        'quantity_arrived',
        Number(formik.values?.qty1_arrived) * selectedProduct?.uppp + Number(formik.values.qty2_arrived)
      );
    }
  }, [formik.values.qty1_arrived, formik.values.qty2_arrived, selectedProduct]);

  // Reset qty2_arrived if selected product's UPPP is 1
  useEffect(() => {
    if (selectedProduct?.uppp === 1) {
      formik.setFieldValue('qty2_arrived', 0);
    }
  }, [selectedProduct]);

  // Set confirmed quantities to match entered quantities
  useEffect(() => {
    // Set confirmed quantities to match the input quantities
    formik.setFieldValue('qty_confirmed', formik.values.quantity_arrived);
    formik.setFieldValue('pqty_confirmed', formik.values.qty1_arrived);
    formik.setFieldValue('lqty_confirmed', formik.values.qty2_arrived);
  }, [formik.values.quantity_arrived, formik.values.qty1_arrived, formik.values.qty2_arrived]);

  useEffect(() => {
    if (props.isEditMode && props.initialData) {
      formik.setValues({
        ...props.initialData,
        mfg_date: props.initialData.mfg_date || new Date(),
        exp_date: props.initialData.exp_date || new Date(),
        shelf_life_date: props.initialData.shelf_life_date || new Date(),
        confirm_date: props.initialData.confirm_date ?? new Date(),
        submit: ''
      });

      setSelectedProduct({
        prod_name: props.initialData.prod_name,
        uom_count: props.initialData.uom_count,
        uppp: props.initialData.uppp
      });
    }
  }, [props.isEditMode, props.initialData]);

  const { user } = useAuth();

  console.log('User data from useAuth:', user); // Debug user data

  // Add this function to directly call the update without form validation
  const directSubmit = async () => {
    try {
      setFormError(null);

      // Validate required fields before submit
      if (showMissingFieldsSnackbar()) {
        return;
      }

      // Check if all required fields are available
      if (!user?.company_code) {
        setFormError("Company code is missing. Please ensure you're logged in with proper credentials.");
        dispatch(
          openSnackbar({
            open: true,
            message: "Company code is missing. Please ensure you're logged in with proper credentials.",
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      if (!props.prin_code) {
        setFormError('Principal code is missing. Please ensure principal is selected.');
        dispatch(
          openSnackbar({
            open: true,
            message: 'Principal code is missing. Please ensure principal is selected.',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      if (!props.job_no) {
        setFormError('Job number is missing. Please ensure job is selected.');
        dispatch(
          openSnackbar({
            open: true,
            message: 'Job number is missing. Please ensure job is selected.',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      if (!formik.values.prod_code) {
        setFormError('Product code is required. Please select a product.');
        dispatch(
          openSnackbar({
            open: true,
            message: 'Product code is required. Please select a product.',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      if (!formik.values.site_code) {
        setFormError('Site code is required.');
        dispatch(
          openSnackbar({
            open: true,
            message: 'Site code is required.',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      if (!formik.values.p_uom) {
        setFormError('Primary UOM is required.');
        dispatch(
          openSnackbar({
            open: true,
            message: 'Primary UOM is required.',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return;
      }

      // Format dates for API submission
      const formatDate = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return new Date(date).toISOString().split('T')[0];
      };

      // Create identity number if not already present
      const identityNumber = Math.floor(Math.random() * 1000000);

      // Create payload according to NEW API structure
      const putawayPayload: TPutawaymanual = {
        COMPANY_CODE: user.company_code || '',
        PRIN_CODE: props.prin_code || '',
        JOB_NO: props.job_no || '',
        TXN_TYPE: 'PUT',
        TXN_DATE: new Date(),
        PACKDET_NO: 0,
        // NEW FIELD: KEY_NUMBER - empty string as per your payload
        KEY_NUMBER: '',

        PROD_CODE: formik.values.prod_code || '',
        SITE_CODE: formik.values.site_code || '',
        LOCATION_CODE: formik.values.location_code || '',

        QUANTITY: Number(formik.values.quantity_arrived) || 0,
        QTY_PUOM: Number(formik.values.qty1_arrived) || 0,
        QTY_LUOM: Number(formik.values.qty2_arrived) || 0,
        P_UOM: formik.values.p_uom || '',
        L_UOM: formik.values.l_uom || '',

        QTY_CONFIRMED: Number(formik.values.qty_confirmed) || 0,
        PQTY_CONFIRMED: Number(formik.values.pqty_confirmed) || 0,
        LQTY_CONFIRMED: Number(formik.values.lqty_confirmed) || 0,
        PUOM_CONFIRMED: formik.values.puom_confirmed || '',
        LUOM_CONFIRMED: formik.values.luom_confirmed || '',

        UPP: Number(formik.values.upp) || 0,
        UPPP: Number(formik.values.uppp) || 0,
        CONFIRM_DATE: formik.values.confirm_date,

        CUST_CODE: formik.values.cust_code || '',
        ORDER_NO: formik.values.order_no || '',
        VESSEL_NAME: formik.values.vessel_name || '',
        CONTAINER_NO: formik.values.container_no || '',
        SEAL_NO: formik.values.seal_no || '',
        PO_NO: formik.values.po_no || '',
        BL_NO: formik.values.bl_no || '',
        DOC_REF: formik.values.doc_ref || '',
        LOT_NO: formik.values.lot_no || '',
        PALLET_ID: formik.values.pallet_id || '',
        MANU_CODE: formik.values.manu_code || '',

        MFG_DATE: formatDate(formik.values.mfg_date),
        EXP_DATE: formatDate(formik.values.exp_date),

        CURR_CODE: formik.values.curr_code || '',
        EX_RATE: Number(formik.values.ex_rate) || 0,
        UNIT_PRICE: Number(formik.values.unit_price) || 0,

        SELECTED: formik.values.selected || 'Y',
        ALLOCATED: formik.values.allocated || 'Y',
        CONFIRMED: formik.values.confirmed || 'Y',

        IDENTITY_NUMBER: identityNumber,

        USER_ID: user.username ? String(user.username) : '',
        USER_DT: new Date(),

        ORIGIN_COUNTRY: formik.values.origin_country || '',
        SHELF_LIFE_DAYS: Number(formik.values.shelf_life_days) || 0,
        SHELF_LIFE_DATE: formatDate(formik.values.shelf_life_date),

        BATCH_NO: formik.values.batch_no || '',
        GROSS_WT: formik.values.gross_weight || 0,
        NET_VOLUME: formik.values.volume || 0,

        updated_by: user.updated_by ? String(user.updated_by) : ''
      };

      console.log('Submitting manual putaway data with NEW API format:', putawayPayload);

      // Call the API with the payload
      const result = await ManualPutwayServiceInstance.upsertPutawaymanualHandler(putawayPayload);

      console.log('API Response:', result);

      // Success - close the form
      if (result) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Putaway successful',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        props.onClose(true);
      }
    } catch (error) {
      console.error('API Submission Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormError(errorMsg);
      dispatch(
        openSnackbar({
          open: true,
          message: errorMsg,
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        directSubmit();
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center" sx={{ flexDirection: 'row', py: 1 }}>
            <Grid item xs={12} sm={9} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ color: '#222222', fontWeight: 600, fontSize: '1.15rem' }}>
                Product Information
              </Typography>
            </Grid>
            {formError && (
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pl: 2 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fdecea',
                    color: '#d32f2f',
                    fontWeight: 'normal',
                    fontSize: '0.82rem',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Error: {formError}
                </span>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div className="bg-white border rounded-lg overflow-hidden" style={{ margin: '0 auto' }}>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                    Container No.<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1" colSpan={3}>
                    <Autocomplete
                      id="container_no"
                      value={
                        !!formik.values.container_no
                          ? containerData?.tableData?.find(
                              (eachContainer) => 
                                eachContainer.container_no === formik.values.container_no || 
                                eachContainer.CONTAINER_NO === formik.values.container_no
                            ) || null
                          : null
                      }
                      onChange={(event, value: any | null) => {
                        const containerNo = value?.container_no || value?.CONTAINER_NO;
                        const poNo = value?.po_no || value?.PO_NO;
                        console.log('Selected Container:', value);
                        formik.setFieldValue('container_no', containerNo || '');
                        formik.setFieldValue('po_no', poNo || '');
                      }}
                      size="small"
                      options={containerData?.tableData ?? []}
                      fullWidth={false}
                      autoHighlight
                      getOptionLabel={(option) => option.container_no || option.CONTAINER_NO || ''}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputProps={{
                            ...params.inputProps,
                            style: { 
                              color: '#222222', 
                              fontSize: '0.75rem', 
                              padding: '6px 8px', 
                              height: 40, 
                              minHeight: 40,
                              boxSizing: 'border-box'
                            }
                          }}
                          InputLabelProps={{ style: { color: '#444444', fontSize: '0.95rem' } }}
                          sx={{ 
                            width: 300, 
                            minHeight: 40, 
                            height: 40,
                            '& .MuiInputBase-root': {
                              minHeight: 40,
                              height: 40,
                              boxSizing: 'border-box'
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '6px 8px',
                              minHeight: 40,
                              height: 40,
                              boxSizing: 'border-box'
                            }
                          }}
                        />
                      )}
                      sx={{
                        '& .MuiInputBase-input': { color: '#222222', fontSize: '0.95rem', padding: '6px 8px', height: 40, minHeight: 40, boxSizing: 'border-box' },
                        '& .MuiOutlinedInput-root': { color: '#222222', fontSize: '0.95rem', padding: '6px 8px', height: 40, minHeight: 40, boxSizing: 'border-box' },
                        '& .MuiAutocomplete-tag': { color: '#222222' },
                        width: 200,
                        minHeight: 40,
                        height: 40,
                        boxSizing: 'border-box'
                      }}
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                    Product / SKU<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1 w-1/6">
                    <TextField
                      size="small"
                      id="prod_code"
                      fullWidth
                      disabled
                      sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'gray' } }}
                      InputProps={{
                        style: { color: '#222222' },
                        endAdornment: (
                          <IconButton
                            onClick={() => {
                              if (!formik.values.container_no) {
                                setProductSelectError('Please select Container No. first');
                                dispatch(
                                  openSnackbar({
                                    open: true,
                                    message: 'Please select Container No. first',
                                    variant: 'alert',
                                    alert: { color: 'error' },
                                    close: true
                                  })
                                );
                              } else {
                                setProductSelectError('');
                                setIsProductDataSelection(true); // <-- Open modal here
                              }
                            }}
                          >
                            <SearchOutlined style={{ color: '#444444' }} />
                          </IconButton>
                        )
                      }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                      value={formik.values.prod_code}
                    />
                    {/* Product selection modal */}
                    {isProductDataSelection && (
                      <DataSelection
                        selectedItem={{ label: 'Product', value: 'product' }}
                        handleSelection={handlePreferenceSelection}
                        filter={filter}
                        prinCode={props.prin_code}
                      />
                    )}
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Product Name</td>
                  <td className="px-3 py-1 w-1/2">
                    <TextField
                      size="small"
                      id="prod_name"
                      fullWidth
                      disabled
                      sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'gray' } }}
                      value={selectedProduct?.prod_name}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                    Pallet ID<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1 w-1/6">
                    <TextField
                      size="small"
                      id="pallet_id"
                      name="pallet_id"
                      fullWidth
                      value={formik.values.pallet_id}
                      onChange={formik.handleChange}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">
                    {/* Empty cell for alignment */}
                  </td>
                  <td className="px-3 py-1 w-1/2">{/* Empty cell for alignment */}</td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 border-r text-xs" colSpan={1}>
                    Quantity 1(Primary)<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 border-r text-xs" colSpan={1}>
                    Quantity 2(Lowest)<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 border-r text-xs" colSpan={1}>
                    Total Quantity<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1" />
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-1" colSpan={1}>
                    <TextField
                      fullWidth={false}
                      size="small"
                      name="qty1_arrived"
                      type="number"
                      variant="outlined"
                      value={formik.values.qty1_arrived}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        if (inputValue.charAt(0) !== '-') {
                          formik.setFieldValue('qty1_arrived', inputValue);
                        }
                      }}
                      disabled={!selectedProduct}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>
                              {formik.values.p_uom}
                            </Typography>
                          </InputAdornment>
                        ),
                        inputProps: {
                          style: {
                            textAlign: 'right',
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none',
                            appearance: 'textfield',
                            fontSize: '0.95rem',
                            padding: '6px 8px'
                          }
                        },
                        sx: {
                          '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]': { MozAppearance: 'textfield' }
                        }
                      }}
                      sx={{ width: 140 }}
                    />
                  </td>
                  <td className="px-3 py-1" colSpan={1}>
                    <TextField
                      fullWidth={false}
                      size="small"
                      name="qty2_arrived"
                      type="number"
                      variant="outlined"
                      value={formik.values.qty2_arrived}
                      disabled={!selectedProduct || selectedProduct?.uppp === 1}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        if (inputValue.charAt(0) !== '-') {
                          formik.setFieldValue('qty2_arrived', inputValue);
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>
                              {formik.values.l_uom || formik.values.p_uom}
                            </Typography>
                          </InputAdornment>
                        ),
                        inputProps: {
                          style: {
                            textAlign: 'right',
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none',
                            appearance: 'textfield',
                            fontSize: '0.95rem',
                            padding: '6px 8px'
                          }
                        },
                        sx: {
                          '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]': { MozAppearance: 'textfield' }
                        }
                      }}
                      sx={{ width: 140 }}
                    />
                  </td>
                  <td className="px-3 py-1" colSpan={1}>
                    <TextField
                      fullWidth={false}
                      size="small"
                      name="quantity_arrived"
                      type="number"
                      variant="outlined"
                      disabled
                      value={formik.values.quantity_arrived}
                      // disabled={!selectedProduct}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>
                              {formik.values.l_uom || formik.values.p_uom}
                            </Typography>
                          </InputAdornment>
                        ),
                        inputProps: {
                          style: {
                            textAlign: 'right',
                            MozAppearance: 'textfield',
                            WebkitAppearance: 'none',
                            appearance: 'textfield',
                            fontSize: '0.95rem',
                            padding: '6px 8px'
                          }
                        },
                        sx: {
                          '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                          '& input[type=number]': { MozAppearance: 'textfield' }
                        }
                      }}
                      sx={{ width: 140 }}
                    />
                  </td>
                  <td className="px-3 py-1" />
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                    Site Code<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1 w-1/6">
                    <FormControl fullWidth size="small">
                      <Select
                        id="site_code"
                        name="site_code"
                        value={formik.values.site_code || ''}
                        onOpen={() => {
                          console.log('Site dropdown opened, fetching data...');
                          fetchSites();
                        }}
                        onChange={(event) => {
                          const selectedSite = event.target.value;
                          console.log('Selected site:', selectedSite);
                          formik.setFieldValue('site_code', selectedSite);
                          formik.setFieldValue('location_code', '');
                        }}
                        sx={{ color: '#222222' }}
                      >
                        {siteOptions?.length > 0 ? (
                          siteOptions.map((site) => (
                            <MenuItem key={site.site_code} value={site.site_code}>
                              {site.site_name || site.site_code}
                            </MenuItem>
                          ))
                        ) : (
                          !siteLoading && <MenuItem disabled>No sites available</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">
                    Location Code<span style={{ color: 'red' }}>*</span>
                  </td>
                  <td className="px-3 py-1 w-1/2">
                    <FormControl fullWidth size="small" disabled={!formik.values.site_code || locationLoading}>
                      <Select
                        id="location_code"
                        name="location_code"
                        value={formik.values.location_code || ''}
                        onChange={(event) => {
                          console.log('Selected location:', event.target.value);
                          formik.setFieldValue('location_code', event.target.value);
                        }}
                        sx={{ color: '#222222' }}
                      >
                        {locationOptions?.length > 0
                          ? locationOptions.map((location) => (
                              <MenuItem key={location.location_code} value={location.location_code}>
                                {location.location_code}
                              </MenuItem>
                            ))
                          : !locationLoading && <MenuItem disabled>No locations available</MenuItem>}
                      </Select>
                    </FormControl>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Batch No.</td>
                  <td className="px-3 py-1 w-1/6">
                    <TextField
                      size="small"
                      onChange={formik.handleChange}
                      id="batch_no"
                      name="batch_no"
                      fullWidth
                      value={formik.values.batch_no}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Lot No.</td>
                  <td className="px-3 py-1 w-1/2">
                    <TextField
                      size="small"
                      onChange={formik.handleChange}
                      id="lot_no"
                      name="lot_no"
                      fullWidth
                      value={formik.values.lot_no}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">PO No.</td>
                  <td className="px-3 py-1 w-1/6">
                    <TextField
                      size="small"
                      onChange={formik.handleChange}
                      id="po_no"
                      name="po_no"
                      fullWidth
                      value={formik.values.po_no}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Doc Ref.</td>
                  <td className="px-3 py-1 w-1/2">
                    <TextField
                      size="small"
                      onChange={formik.handleChange}
                      id="doc_ref"
                      name="doc_ref"
                      fullWidth
                      value={formik.values.doc_ref}
                      InputProps={{ style: { color: '#222222' } }}
                      InputLabelProps={{ style: { color: '#444444' } }}
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Manufacturing Date</td>
                  <td className="px-3 py-1 w-1/6">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            InputProps: { style: { color: '#222222' } },
                            InputLabelProps: { style: { color: '#444444' } },
                            sx: { width: 180 } // <-- Increased width
                          }
                        }}
                        value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
                        onChange={(newValue) => {
                          formik.setFieldValue('mfg_date', newValue);
                        }}
                      />
                    </LocalizationProvider>
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Expiry Date</td>
                  <td className="px-3 py-1 w-1/2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            InputProps: { style: { color: '#222222' } },
                            InputLabelProps: { style: { color: '#444444' } }
                          }
                        }}
                        value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                        onChange={(newValue) => {
                          formik.setFieldValue('exp_date', newValue);
                        }}
                      />
                    </LocalizationProvider>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Shelf Life (Date)</td>
                  <td className="px-3 py-1 w-1/6">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            InputProps: { style: { color: '#222222' } },
                            InputLabelProps: { style: { color: '#444444' } }
                          }
                        }}
                        value={formik.values.shelf_life_date ? dayjs(formik.values.shelf_life_date) : null}
                        onChange={(newValue) => {
                          formik.setFieldValue('shelf_life_date', newValue);
                        }}
                      />
                    </LocalizationProvider>
                  </td>
                  <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Shelf Life Days</td>
                  <td className="px-3 py-1 w-1/2">
                    <FormControl fullWidth variant="outlined" size="small">
                      <OutlinedInput
                        id="shelf_life_days"
                        name="shelf_life_days"
                        type="number"
                        value={Number(formik.values.shelf_life_days)}
                        onChange={(event) => {
                          const inputValue = event.target.value;
                          if (inputValue.charAt(0) !== '-') {
                            formik.setFieldValue('shelf_life_days', inputValue);
                          }
                        }}
                        inputProps={{ min: 0, style: { color: '#222222' } }}
                        sx={{ color: '#222222', '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'gray' } }}
                      />
                    </FormControl>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Grid>
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        <Button
          size="small"
          sx={{
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            minWidth: 100,
            fontSize: '0.95rem',
            padding: '4px 16px',
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          type="submit"
          variant="contained"
          startIcon={<SaveOutlined />}
          disabled={!areRequiredFieldsFilled()}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </form>
  );
};

export default AddManualPutawayForm;