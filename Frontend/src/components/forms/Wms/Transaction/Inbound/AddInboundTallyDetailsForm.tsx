//import { LoadingOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons};
import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Button,
  // FormHelperText,
  Grid,
  //IconButton,
  // InputAdornment,
  // InputLabel,
  OutlinedInput,
  FormControl,
  //Tab,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
// import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
// import { ISearch } from 'components/filters/SearchFilter';
//import DataSelection from 'components/popup/DataSelection';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { TTallyDetails } from 'pages/WMS/Transaction/Inbound/types/tallyDetails.types';
// import { TCountry } from 'pages/WMS/types/country-wms.types';
//import { TProduct } from 'pages/WMS/types/product-wms.types';
import { useEffect, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
//import packingServiceInstance from 'service/wms/transaction/inbound/service.packingDetailsWms';
import tallyServiceInstance from 'service/wms/transaction/inbound/service.tallyDetailsWms';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery, useTheme } from '@mui/material';

// import { useSelector } from 'store';
//import { TProduct } from 'pages/WMS/types/product-wms.types';
//import { TPair } from 'types/common';
//import * as yup from 'yup';

const AddInboundTallyDetailsForm = ({
  job_no,
  packdet_no,
  seq_number,
  prin_code,
  onClose,
  isEditMode
}: {
  job_no: string;
  packdet_no: string;
  seq_number?: number;
  prin_code: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
}) => {
  // const filter: ISearch = {
  //   search: [[{ field_name: 'prin_code', field_value: prin_code, operator: 'exactmatch' }]]
  // };

  // const containerFilter: ISearch = {
  //   search: [
  //     [{ field_name: 'prin_code', field_value: prin_code, operator: 'exactmatch' }],
  //     [{ field_name: 'job_no', field_value: job_no, operator: 'exactmatch' }]
  //   ]
  // };
  //----------------constants-----------------
  // const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedContainerNo, setSelectedContainerNo] = useState<string | null>(null);
  //const [isProductDataSelection, setIsProductDataSelection] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ prod_name: string; uom_count: number; uppp: number }>();

  //----------------useQuery-----------------

  // const { data: countryList } = useQuery({
  //   queryKey: ['country_data'],
  //   queryFn: async () => {
  //     const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
  //     if (response) {
  //       return {
  //         tableData: response.tableData as TCountry[],
  //         count: response.count
  //       };
  //     }
  //     return { tableData: [], count: 0 }; // Handle undefined case
  //   }
  // });

  const { data: containerData, isLoading: isContainerLoading } = useQuery({
    queryKey: ['container_no', prin_code, job_no],
    queryFn: async () => {
      const sql_string = `SELECT * FROM TI_CONTAINER WHERE PRIN_CODE = '${prin_code}' AND JOB_NO = '${job_no}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql_string);
      if (response) {
        // Map uppercase field names to lowercase
        const mappedData = response.map((item: any) => ({
          ...item,
          container_no: item.CONTAINER_NO || item.container_no,
          po_no: item.PO_NO || item.po_no,
          prin_code: item.PRIN_CODE || item.prin_code,
          job_no: item.JOB_NO || item.job_no
        }));
        return {
          tableData: mappedData as TPackingDetails[],
          count: response.length
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: !!job_no && !!prin_code
  });

  // const { data: prodData } = useQuery({
  //   queryKey: ['prod_code'],
  //   queryFn: async () => {
  //     const response = await WmsSerivceInstance.getMasters('wms', 'packing_details', undefined, containerFilter);
  //     if (response) {
  //       return {
  //         tableData: response.tableData as TPackingDetails[],
  //         count: response.count
  //       };
  //     }
  //     return { tableData: [], count: 0 }; // Handle undefined case
  //   },
  //   enabled: !!job_no && !!prin_code
  // });

  // const {
  //   data: packingData,
  //   isFetching: isPackingFetchLoading,
  //   refetch: refetchPackingData
  // } = useQuery({
  //   queryKey: ['packing_details', filterData, paginationData],
  //   queryFn: () => WmsSerivceInstance.getMasters('wms', 'packing_details', paginationData, filterData, job_no),
  //   enabled: !!job_no
  // });

  const theme = createTheme({
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif' // Set Roboto as the default font
    }
  });

  // Add this line to detect mobile
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const { data: tallyData, isFetched: isTallyDataFetched } = useQuery<TTallyDetails | undefined>({
    queryKey: ['principal_data'],
    queryFn: () => tallyServiceInstance.getTally(prin_code, job_no, packdet_no, seq_number),
    enabled: isEditMode === true
  });

  // const { data: ProducttallyData } = useQuery({
  //   queryKey: ['TallyProduct_data'],
  //   queryFn: () => tallyServiceInstance.getProductTally(prin_code, job_no)
  //   //enabled: isEditMode === true
  // });
  // console.log(ProducttallyData);

  // Commented out tally_product_data API - using executeRawSql instead
  // const { data: ProducttallyData } = useQuery({
  //   queryKey: ['product_data', selectedContainerNo, tabIndex],
  //   queryFn: async () => {
  //     let containerParam = '';

  //     if (tabIndex === 0) {
  //       // For Pallet Wise tab, use selectedContainerNo if available,
  //       // otherwise use first container from containerData
  //       if (selectedContainerNo) {
  //         containerParam = selectedContainerNo;
  //       } else if (containerData?.tableData && containerData.tableData.length > 0) {
  //         containerParam = containerData.tableData[0].container_no;
  //       }
  //     } else {
  //       // For Product/SKU and Serial wise tabs, use first container from containerData
  //       if (containerData?.tableData && containerData.tableData.length > 0) {
  //         containerParam = containerData.tableData[0].container_no;
  //       }
  //     }

  //     const response = await tallyServiceInstance.getProductTally(prin_code, job_no, containerParam);
  //     return response;
  //   },
  //   enabled: !!prin_code && !!job_no && !isContainerLoading && !!containerData
  // });

  // Using executeRawSql for container no and product data
  const { data: ProducttallyData } = useQuery({
    queryKey: ['product_data_raw_sql', selectedContainerNo, tabIndex, prin_code, job_no],
    queryFn: async () => {
      const sql_string = `
  SELECT * 
  FROM VW_WM_INB_PACKDET_DETS 
  WHERE company_code = '${user?.company_code}'
    AND job_no = '${job_no}' 
    AND prin_code = '${prin_code}'
  ORDER BY updated_at
`;

      const response = await WmsSerivceInstance.executeRawSql(sql_string);
      
      // Map uppercase field names to lowercase
      if (response) {
        return response.map((item: any) => ({
          ...item,
          prod_code: item.PROD_CODE || item.prod_code,
          prod_name: item.PROD_NAME || item.prod_name,
          puom: item.PUOM || item.puom,
          luom: item.LUOM || item.luom,
          uom_count: item.UOM_COUNT || item.uom_count,
          uppp: item.UPPP || item.uppp,
          container_no: item.CONTAINER_NO || item.container_no,
          qty_puom: item.QTY_PUOM || item.qty_puom,
          qty_luom: item.QTY_LUOM || item.qty_luom,
          quantity: item.QUANTITY || item.quantity,
          packdet_no: item.PACKDET_NO || item.packdet_no,
          p_uom: item.P_UOM || item.p_uom,
          l_uom: item.L_UOM || item.l_uom
        }));
      }
      return response;
    },
    enabled: !!prin_code && !!job_no && !isContainerLoading && !!containerData
  });
  //------------------formik-----------------
  const formik = useFormik<TTallyDetails>({
    initialValues: {
      prod_code: '',
      company_code: user?.company_code,
      pda_qty_puom: 0,
      pda_puom: '',
      pda_luom: '',
      pda_qty_luom: 0,
      pda_quantity: 0,
      batch_no: '',
      lot_no: '',
      mfg_date: null as unknown as Date,
      exp_date: null as unknown as Date,
      po_no: '',
      origin_country: '',
      gross_weight: null as unknown as number,
      volume: null as unknown as number,
      shelf_life_days: null as unknown as number,
      shelf_life_date: null as unknown as Date,
      container_no: '',
      pallet_id: '',
      seq_number: null as unknown as number,
      uppp: 1 // Add uppp field with default value
    },
    // validationSchema: yup.object().shape({
    //   prod_code: yup.string().required('This field is required'),
    //   qty_puom: yup.number().required('This field is required'),
    //   qty_luom: yup.number().required('This field is required'),
    //   mfg_date: yup.date().max(yup.ref('exp_date')).required('This field is required'),
    //   exp_date: yup.date().min(yup.ref('mfg_date')).required('This field is required')
    // }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      values.job_no = job_no;
      values.prin_code = prin_code;

      let response;
      if (isEditMode) {
        if (packdet_no) response = await tallyServiceInstance.updateTallyDetail(values, packdet_no, prin_code, job_no, seq_number);
      } else {
        console.log('submit object');
        response = await tallyServiceInstance.createTallyDetail(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  // const handlePreferenceSelection = (data: TPair<'uom_count' | 'uppp'>) => {
  //   setSelectedProduct({ prod_name: data.label, uom_count: data.uom_count, uppp: data.uppp });
  //   formik.setFieldValue('prod_code', data.value);
  //   setIsProductDataSelection(!isProductDataSelection);
  // };
  //------------------useEffect------------
  useEffect(() => {
    if (isEditMode && isTallyDataFetched && tallyData && Object.keys(tallyData).length > 0) {
      const {
        prod_code,
        company_code,
        pda_qty_puom,
        pda_luom,
        pda_puom,
        pda_qty_luom,
        pda_quantity,
        batch_no,
        lot_no,
        mfg_date,
        exp_date,
        po_no,
        origin_country,
        gross_weight,
        volume,
        shelf_life_days,
        shelf_life_date,
        container_no,
        seq_number: tallySeqNumber,
        pallet_id,
        uppp
      } = tallyData;
      formik.setValues({
        prod_code,
        company_code,
        pda_qty_puom,
        pda_qty_luom,
        pda_quantity,
        batch_no,
        lot_no,
        mfg_date,
        exp_date,
        po_no,
        pda_luom,
        pda_puom,
        origin_country,
        gross_weight,
        volume,
        shelf_life_days,
        shelf_life_date,
        container_no,
        seq_number: tallySeqNumber || seq_number,
        pallet_id,
        uppp: uppp || 1
      });
      setSelectedProduct({
        prod_name: tallyData?.prod_name as string,
        uom_count: tallyData.uom_count as number,
        uppp: tallyData.uppp as number
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tallyData]);
  useEffect(() => {
    if (!!selectedProduct) {
      console.log('Check UPPP', selectedProduct?.uppp);
      if (selectedProduct?.uom_count <= 1) {
        formik.setFieldValue('pda_quantity', Number(formik.values?.pda_qty_puom) * (formik.values.uppp || 1));
        return;
      }
      console.log('Check UPPP', selectedProduct?.uppp);
      formik.setFieldValue('pda_quantity', Number(formik.values?.pda_qty_puom) * (formik.values.uppp || 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.pda_qty_luom, formik.values.pda_qty_puom, formik.values.uppp]);
  useEffect(() => {
    if (selectedProduct?.uom_count === 1) {
      formik.setFieldValue('pda_qty_luom', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // Refs for auto-selecting inputs
  const palletIdRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);
  const serialNoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus/select relevant input on tab change
    if (tabIndex === 0 && palletIdRef.current) {
      palletIdRef.current.focus();
      palletIdRef.current.select?.();
    } else if (tabIndex === 1 && productRef.current) {
      productRef.current.focus();
      productRef.current.select?.();
    } else if (tabIndex === 2 && serialNoRef.current) {
      serialNoRef.current.focus();
      serialNoRef.current.select?.();
    }
  }, [tabIndex]);

  // Extracted row renderers for mobile
  const renderPalletWiseMobile = () => (
    <Grid container spacing={2} sx={{ pl: 2 }}>
      {/* Container No - moved to top */}

      {/* Title with margin */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, paddingLeft: 0 }}>
          Pallet Wise Information
        </Typography>
      </Grid>
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Container No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Autocomplete
            id="container_no"
            value={
              !!formik.values.container_no
                ? containerData?.tableData?.find((eachContainer) => eachContainer.container_no === formik.values.container_no)
                : ({ container_no: '' } as TPackingDetails)
            }
            onChange={(event, value: TPackingDetails | null) => {
              formik.setFieldValue('container_no', value?.container_no);
              formik.setFieldValue('po_no', value?.po_no);
              setSelectedContainerNo(value?.container_no || null);
            }}
            size="small"
            options={containerData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option.container_no}
            renderInput={(params) => <TextField {...params} placeholder="Select Container" variant="outlined" label="" />}
          />
        </Grid>
      </Grid>
      {/* Pallet Id */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Pallet Id
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="pallet_id"
            name="pallet_id"
            fullWidth
            value={formik.values.pallet_id}
            placeholder="Enter Pallet ID"
            variant="outlined"
            label=""
            inputRef={palletIdRef}
            InputProps={{
              style: {
                color: '#000000',
                fontSize: '14px',
                backgroundColor: '#FFF9C4',
                fontWeight: '600'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                backgroundColor: '#FFF9C4',
                '&:hover': {
                  backgroundColor: '#FFF59D'
                },
                '&.Mui-focused': {
                  backgroundColor: '#FFF59D'
                }
              }
            }}
          />
        </Grid>
      </Grid>
      {/* Product/SKU */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Product/SKU
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Autocomplete
            id="prod_code"
            value={
              !!formik.values.prod_code
                ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                : ({ prod_code: '' } as TTallyDetails)
            }
            onChange={(event, value: string | TTallyDetails | null) => {
              if (typeof value === 'string' || !value) {
                formik.setFieldValue('prod_code', '');
                return;
              }
              formik.setFieldValue('prod_code', value.prod_code);
              formik.setFieldValue('quantity', value.quantity);
              formik.setFieldValue('pda_qty_puom', value.qty_puom);
              formik.setFieldValue('pda_qty_luom', value.qty_luom);
              formik.setFieldValue('pda_quantity', value.quantity);
              formik.setFieldValue('packdet_no', value.packdet_no);
              formik.setFieldValue('uppp', value.uppp || 1);
              formik.setFieldValue('pda_puom', value.p_uom || '');
              formik.setFieldValue('pda_luom', value.l_uom || '');
              setSelectedProduct({
                prod_name: value.prod_name || '',
                uom_count: value.uom_count || 1,
                uppp: value.uppp || 1
              });
            }}
            size="small"
            options={ProducttallyData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option?.prod_code && option?.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
            }}
            renderInput={(params) => <TextField {...params} placeholder="Select Product/SKU" variant="outlined" label="" />}
          />
        </Grid>
      </Grid>
      {/* Quantity (Primary) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Primary)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small">
            <OutlinedInput
              id="pda_qty_puom"
              name="pda_qty_puom"
              type="number"
              value={formik.values.pda_qty_puom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_puom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Primary)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Quantity (Lowest) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Lowest)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl
            fullWidth
            variant="outlined"
            size="small"
            disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
          >
            <OutlinedInput
              id="pda_qty_luom"
              name="pda_qty_luom"
              type="number"
              value={formik.values.pda_qty_luom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_luom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Lowest)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Total Quantity */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Total Quantity
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small" disabled>
            <OutlinedInput
              type="number"
              value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
              placeholder="Total Quantity"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Batch No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Batch No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="batch_no"
            name="batch_no"
            fullWidth
            value={formik.values.batch_no}
            placeholder="Batch"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Lot No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Lot No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="lot_no"
            name="lot_no"
            fullWidth
            value={formik.values.lot_no}
            placeholder="Lot Number"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Production Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Production Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      {/* Expiry Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Expiry Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Grid>
  );

  // Product/SKU Wise Mobile
  const renderProductWiseMobile = () => (
    <Grid container spacing={2}>
      {/* Title with margin */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, mb: 2 }}>
          Product/SKU Wise Information
        </Typography>
      </Grid>
      {/* Product/SKU */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Product/SKU
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Autocomplete
            id="prod_code"
            value={
              !!formik.values.prod_code
                ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                : ({ prod_code: '' } as TTallyDetails)
            }
            onChange={(event, value: string | TTallyDetails | null) => {
              if (typeof value === 'string' || !value) {
                formik.setFieldValue('prod_code', '');
                return;
              }
              formik.setFieldValue('prod_code', value.prod_code);
              formik.setFieldValue('quantity', value.quantity);
              formik.setFieldValue('pda_qty_puom', value.qty_puom);
              formik.setFieldValue('pda_qty_luom', value.qty_luom);
              formik.setFieldValue('pda_quantity', value.quantity);
              formik.setFieldValue('packdet_no', value.packdet_no);
              formik.setFieldValue('uppp', value.uppp || 1);
              formik.setFieldValue('pda_puom', value.p_uom || '');
              formik.setFieldValue('pda_luom', value.l_uom || '');
              setSelectedProduct({
                prod_name: value.prod_name || '',
                uom_count: value.uom_count || 1,
                uppp: value.uppp || 1
              });
            }}
            size="small"
            options={ProducttallyData ?? []}
            fullWidth
            autoHighlight
            freeSolo
            getOptionLabel={(option: any) => {
              if (typeof option === 'string') return option;
              return option?.prod_code && option?.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Scanning barcode........ or click to select product"
                variant="outlined"
                label=""
                inputRef={productRef}
                InputProps={{
                  ...params.InputProps,
                  style: {
                    color: '#000000',
                    fontSize: '14px',
                    backgroundColor: '#FFF9C4',
                    fontWeight: '600'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '32px',
                    backgroundColor: '#FFF9C4',
                    '&:hover': {
                      backgroundColor: '#FFF59D'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#FFF59D'
                    }
                  }
                }}
              />
            )}
            sx={{
              '& .MuiInputBase-input': {
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600'
              },
              '& .MuiOutlinedInput-root': {
                color: '#000000',
                backgroundColor: '#FFF9C4'
              }
            }}
          />
        </Grid>
      </Grid>
      {/* Quantity (Primary) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Primary)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small">
            <OutlinedInput
              id="pda_qty_puom"
              name="pda_qty_puom"
              type="number"
              value={formik.values.pda_qty_puom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_puom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Primary)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Quantity (Lowest) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Lowest)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl
            fullWidth
            variant="outlined"
            size="small"
            disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
          >
            <OutlinedInput
              id="pda_qty_luom"
              name="pda_qty_luom"
              type="number"
              value={formik.values.pda_qty_luom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_luom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Lowest)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Total Quantity */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Total Quantity
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small" disabled>
            <OutlinedInput
              type="number"
              value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
              placeholder="Total Quantity"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Batch No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Batch No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="batch_no"
            name="batch_no"
            fullWidth
            value={formik.values.batch_no}
            placeholder="Batch"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Lot No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Lot No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="lot_no"
            name="lot_no"
            fullWidth
            value={formik.values.lot_no}
            placeholder="Lot Number"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Production Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Production Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      {/* Expiry Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Expiry Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Grid>
  );

  // Serial Wise Mobile
  const renderSerialWiseMobile = () => (
    <Grid container spacing={2}>
      {/* Title with margin */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, mb: 2 }}>
          Serial Wise Information
        </Typography>
      </Grid>
      {/* Product/SKU */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Product/SKU
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Autocomplete
            id="prod_code"
            value={
              !!formik.values.prod_code
                ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                : ({ prod_code: '' } as TTallyDetails)
            }
            onChange={(event, value: string | TTallyDetails | null) => {
              if (typeof value === 'string' || !value) {
                formik.setFieldValue('prod_code', '');
                return;
              }
              formik.setFieldValue('prod_code', value.prod_code);
              formik.setFieldValue('quantity', value.quantity);
              formik.setFieldValue('pda_qty_puom', value.qty_puom);
              formik.setFieldValue('pda_qty_luom', value.qty_luom);
              formik.setFieldValue('pda_quantity', value.quantity);
              formik.setFieldValue('packdet_no', value.packdet_no);
              formik.setFieldValue('uppp', value.uppp || 1);
              formik.setFieldValue('pda_puom', value.p_uom || '');
              formik.setFieldValue('pda_luom', value.l_uom || '');
              setSelectedProduct({
                prod_name: value.prod_name || '',
                uom_count: value.uom_count || 1,
                uppp: value.uppp || 1
              });
            }}
            size="small"
            options={ProducttallyData ?? []}
            fullWidth
            autoHighlight
            freeSolo
            getOptionLabel={(option: any) => {
              if (typeof option === 'string') return option;
              return option.prod_code && option.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Scanning barcode........ or click to select product"
                variant="outlined"
                label=""
                InputProps={{
                  ...params.InputProps,
                  style: {
                    color: '#000000',
                    fontSize: '14px',
                    backgroundColor: '#FFF9C4',
                    fontWeight: '600'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '32px',
                    backgroundColor: '#FFF9C4',
                    '&:hover': {
                      backgroundColor: '#FFF59D'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#FFF59D'
                    }
                  }
                }}
              />
            )}
            sx={{
              '& .MuiInputBase-input': {
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600'
              },
              '& .MuiOutlinedInput-root': {
                color: '#000000',
                backgroundColor: '#FFF9C4'
              }
            }}
          />
        </Grid>
      </Grid>
      {/* Serial No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Serial No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="seq_number"
            name="seq_number"
            fullWidth
            value={formik.values.seq_number}
            placeholder="Scanning barcode………."
            variant="outlined"
            label=""
            inputRef={serialNoRef}
            InputProps={{
              style: {
                color: '#000000',
                fontSize: '14px',
                backgroundColor: '#FFF9C4', // Yellow background for barcode scanning
                fontWeight: '600' // Bold text
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                backgroundColor: '#FFF9C4',
                '&:hover': {
                  backgroundColor: '#FFF59D'
                },
                '&.Mui-focused': {
                  backgroundColor: '#FFF59D'
                }
              }
            }}
          />
        </Grid>
      </Grid>
      {/* Quantity (Primary) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Primary)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small">
            <OutlinedInput
              id="pda_qty_puom"
              name="pda_qty_puom"
              type="number"
              value={formik.values.pda_qty_puom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_puom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Primary)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Quantity (Lowest) */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Quantity (Lowest)
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl
            fullWidth
            variant="outlined"
            size="small"
            disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
          >
            <OutlinedInput
              id="pda_qty_luom"
              name="pda_qty_luom"
              type="number"
              value={formik.values.pda_qty_luom}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.setFieldValue('pda_qty_luom', inputValue);
                }
              }}
              inputProps={{ min: 0 }}
              placeholder="Quantity (Lowest)"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Total Quantity */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Total Quantity
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth variant="outlined" size="small" disabled>
            <OutlinedInput
              type="number"
              value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
              placeholder="Total Quantity"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Batch No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Batch No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="batch_no"
            name="batch_no"
            fullWidth
            value={formik.values.batch_no}
            placeholder="Batch"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Lot No. */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Lot No.
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="lot_no"
            name="lot_no"
            fullWidth
            value={formik.values.lot_no}
            placeholder="Lot Number"
            variant="outlined"
            label=""
          />
        </Grid>
      </Grid>
      {/* Production Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Production Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      {/* Expiry Date */}
      <Grid container alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={4}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: 13 }}>
            Expiry Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: ''
                }
              }}
              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
              onChange={(newValue) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/*----------------------Section 1-------------------------- */}
      <Grid item xs={12}>
        <Tabs
          value={tabIndex}
          onChange={(event, newValue) => setTabIndex(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 28, // Reduce minHeight for smaller tabs
            '& .MuiTab-root': {
              minHeight: 28, // Reduce minHeight for Tab
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem', // Smaller font size
              px: 1.5, // Slightly less padding
              color: '#082A89',
              borderRadius: '8px 8px 0 0',
              '&.Mui-selected': {
                backgroundColor: '#fff',
                color: '#082A89',
                fontWeight: 600,
                border: '2px solid #082A89',
                borderBottom: 'none'
              }
            }
          }}
        >
          <Tab label="Pallet Wise" sx={{ fontSize: '0.85rem', minHeight: 28 }} />
          <Tab label="Product/SKU Wise" sx={{ fontSize: '0.85rem', minHeight: 28 }} />
          <Tab label="Serial Wise" sx={{ fontSize: '0.85rem', minHeight: 28 }} />
        </Tabs>
      </Grid>

      {/* Pallet Wise Tab */}
      {tabIndex === 0 && (
        <ThemeProvider theme={theme}>
          <Grid sx={{ padding: '16px' }} container spacing={2}>
            <Grid item xs={12}>
              {/* REMOVE this Typography for mobile, keep only for desktop */}
              {!isMobile && (
                <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, py: 1 }}>
                  Pallet Wise Information
                </Typography>
              )}
              {isMobile ? (
                renderPalletWiseMobile()
              ) : (
                // ...existing table-based code for Pallet Wise...
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {/* Row 1: Pallet Id & Container No */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Pallet Id</td>
                        <td className="px-3 py-1 w-1/6">
                          <TextField
                            size="small"
                            onChange={formik.handleChange}
                            id="pallet_id"
                            name="pallet_id"
                            fullWidth
                            value={formik.values.pallet_id}
                            placeholder="Enter Pallet ID"
                            variant="outlined"
                            inputRef={palletIdRef}
                            InputProps={{
                              style: {
                                color: '#000000',
                                fontSize: '14px',
                                backgroundColor: '#FFF9C4',
                                fontWeight: '600'
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '32px',
                                backgroundColor: '#FFF9C4',
                                '&:hover': {
                                  backgroundColor: '#FFF59D'
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#FFF59D'
                                }
                              }
                            }}
                          />
                        </td>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Container No.</td>
                        <td className="px-3 py-1 w-1/2">
                          <Autocomplete
                            id="container_no"
                            value={
                              !!formik.values.container_no
                                ? containerData?.tableData?.find(
                                    (eachContainer) => eachContainer.container_no === formik.values.container_no
                                  )
                                : null
                            }
                            onChange={(event, value: TPackingDetails | null) => {
                              formik.setFieldValue('container_no', value?.container_no);
                              formik.setFieldValue('po_no', value?.po_no);
                              setSelectedContainerNo(value?.container_no || null);
                            }}
                            size="small"
                            options={containerData?.tableData ?? []}
                            fullWidth
                            autoHighlight
                            getOptionLabel={(option) => option.container_no}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select Container"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  style: { color: '#222222', fontSize: '14px' }
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                              />
                            )}
                            sx={{
                              '& .MuiInputBase-input': { color: '#222222', fontSize: '14px' },
                              '& .MuiOutlinedInput-root': { color: '#222222' }
                            }}
                          />
                        </td>
                      </tr>

                      {/* Row 2: Product/SKU */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Product/SKU</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <div className="flex items-center space-x-3">
                            <div className="w-48">
                              <TextField
                                size="small"
                                value={formik.values.prod_code}
                                disabled
                                variant="outlined"
                                InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                                sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                              />
                            </div>
                            <div className="flex-1">
                              <Autocomplete
                                id="prod_code"
                                value={
                                  !!formik.values.prod_code
                                    ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                                    : ({ prod_code: '' } as TTallyDetails)
                                }
                                onChange={(event, value: string | TTallyDetails | null, reason, details) => {
                                  if (typeof value === 'string' || !value) {
                                    formik.setFieldValue('prod_code', '');
                                    return;
                                  }
                                  formik.setFieldValue('prod_code', value.prod_code);
                                  formik.setFieldValue('quantity', value.quantity);
                                  formik.setFieldValue('pda_qty_puom', value.qty_puom);
                                  formik.setFieldValue('pda_qty_luom', value.qty_luom);
                                  formik.setFieldValue('pda_quantity', value.quantity);
                                  formik.setFieldValue('packdet_no', value.packdet_no);
                                  formik.setFieldValue('uppp', value.uppp || 1);
                                  formik.setFieldValue('pda_puom', value.p_uom || '');
                                  formik.setFieldValue('pda_luom', value.l_uom || '');
                                  setSelectedProduct({
                                    prod_name: value.prod_name || '',
                                    uom_count: value.uom_count || 1,
                                    uppp: value.uppp || 1
                                  });
                                }}
                                size="small"
                                options={ProducttallyData ?? []}
                                fullWidth
                                autoHighlight
                                getOptionLabel={(option) => {
                                  if (typeof option === 'string') return option;
                                  return option?.prod_code && option?.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Select Product/SKU"
                                    variant="outlined"
                                    InputProps={{
                                      ...params.InputProps,
                                      style: { color: '#222222', fontSize: '14px' }
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                                  />
                                )}
                                sx={{
                                  '& .MuiInputBase-input': { color: '#222222', fontSize: '14px' },
                                  '& .MuiOutlinedInput-root': { color: '#222222' }
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Row 3: Quantities */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Quantity (Primary)</td>
                        <td className="px-3 py-1 w-1/6">
                          <div className="flex items-center space-x-2">
                            <FormControl fullWidth variant="outlined" size="small">
                              <OutlinedInput
                                id="pda_qty_puom"
                                name="pda_qty_puom"
                                type="number"
                                value={formik.values.pda_qty_puom}
                                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                  const inputValue = event.target.value;
                                  if (inputValue.charAt(0) !== '-') {
                                    formik.setFieldValue('pda_qty_puom', inputValue);
                                  }
                                }}
                                inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                sx={{ color: '#222222', height: '32px' }}
                              />
                            </FormControl>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">{formik.values.pda_puom}</span>
                          </div>
                        </td>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">
                          Quantity (Lowest)
                        </td>
                        <td className="px-3 py-1 w-1/2">
                          <div className="flex items-center space-x-2">
                            <div className="w-24">
                              <FormControl
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
                              >
                                <OutlinedInput
                                  id="pda_qty_luom"
                                  name="pda_qty_luom"
                                  type="number"
                                  value={formik.values.pda_qty_luom}
                                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                    const inputValue = event.target.value;
                                    if (inputValue.charAt(0) !== '-') {
                                      formik.setFieldValue('pda_qty_luom', inputValue);
                                    }
                                  }}
                                  inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                  sx={{ color: '#222222', height: '32px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">
                              {formik.values.pda_luom || formik.values.pda_puom}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 4: Total Quantity */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Total Quantity</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <div className="flex items-center space-x-2">
                            <div className="w-32">
                              <FormControl fullWidth variant="outlined" size="small" disabled>
                                <OutlinedInput
                                  type="number"
                                  value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
                                  sx={{ color: '#222222', height: '32px', fontSize: '14px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium">{formik.values.pda_luom || formik.values.pda_puom}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 5: Batch & Lot */}
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
                            placeholder="Batch"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
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
                            placeholder="Lot Number"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                          />
                        </td>
                      </tr>

                      {/* Row 6: Dates */}
                      <tr>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Production Date</td>
                        <td className="px-3 py-1 w-1/6">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                                }
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
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Grid>
          </Grid>
        </ThemeProvider>
      )}

      {/* Product/SKU Wise Tab */}
      {tabIndex === 1 && (
        <ThemeProvider theme={theme}>
          <Grid sx={{ padding: '16px' }} container spacing={2}>
            <Grid item xs={12}>
              {/* REMOVE this Typography for mobile, keep only for desktop */}
              {!isMobile && (
                <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, py: 1 }}>
                  Product/SKU Wise Information
                </Typography>
              )}
              {isMobile ? (
                renderProductWiseMobile()
              ) : (
                // ...existing table-based code for Product/SKU Wise...
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {/* Row 1: Product/SKU Scanning & Selection */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Product/SKU</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <Autocomplete
                            id="prod_code"
                            value={
                              !!formik.values.prod_code
                                ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                                : ({ prod_code: '' } as TTallyDetails)
                            }
                            onChange={(event, value: string | TTallyDetails | null, reason, details) => {
                              if (typeof value === 'string' || !value) {
                                formik.setFieldValue('prod_code', '');
                                return;
                              }
                              formik.setFieldValue('prod_code', value.prod_code);
                              formik.setFieldValue('quantity', value.quantity);
                              formik.setFieldValue('pda_qty_puom', value.qty_puom);
                              formik.setFieldValue('pda_qty_luom', value.qty_luom);
                              formik.setFieldValue('pda_quantity', value.quantity);
                              formik.setFieldValue('packdet_no', value.packdet_no);
                              formik.setFieldValue('uppp', value.uppp || 1);
                              formik.setFieldValue('pda_puom', value.p_uom || '');
                              formik.setFieldValue('pda_luom', value.l_uom || '');
                              setSelectedProduct({
                                prod_name: value.prod_name || '',
                                uom_count: value.uom_count || 1,
                                uppp: value.uppp || 1
                              });
                            }}
                            size="small"
                            options={ProducttallyData ?? []}
                            fullWidth
                            autoHighlight
                            freeSolo
                            getOptionLabel={(option: any) => {
                              if (typeof option === 'string') return option;
                              return option?.prod_code && option?.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Scanning barcode........ or click to select product"
                                variant="outlined"
                                label=""
                                inputRef={productRef}
                                InputProps={{
                                  ...params.InputProps,
                                  style: {
                                    color: '#000000',
                                    fontSize: '14px',
                                    backgroundColor: '#FFF9C4',
                                    fontWeight: '600'
                                  }
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    height: '32px',
                                    backgroundColor: '#FFF9C4',
                                    '&:hover': {
                                      backgroundColor: '#FFF59D'
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: '#FFF59D'
                                    }
                                  }
                                }}
                              />
                            )}
                            sx={{
                              '& .MuiInputBase-input': {
                                color: '#000000',
                                fontSize: '14px',
                                fontWeight: '600'
                              },
                              '& .MuiOutlinedInput-root': {
                                color: '#000000',
                                backgroundColor: '#FFF9C4'
                              }
                            }}
                          />
                        </td>
                      </tr>

                      {/* Row 3: Quantities */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Quantity (Primary)</td>
                        <td className="px-3 py-1 w-1/6">
                          <div className="flex items-center space-x-2">
                            <FormControl fullWidth variant="outlined" size="small">
                              <OutlinedInput
                                id="pda_qty_puom"
                                name="pda_qty_puom"
                                type="number"
                                value={formik.values.pda_qty_puom}
                                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                  const inputValue = event.target.value;
                                  if (inputValue.charAt(0) !== '-') {
                                    formik.setFieldValue('pda_qty_puom', inputValue);
                                  }
                                }}
                                inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                sx={{ color: '#222222', height: '32px' }}
                              />
                            </FormControl>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">{formik.values.pda_puom}</span>
                          </div>
                        </td>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">
                          Quantity (Lowest)
                        </td>
                        <td className="px-3 py-1 w-1/2">
                          <div className="flex items-center space-x-2">
                            <div className="w-24">
                              <FormControl
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
                              >
                                <OutlinedInput
                                  id="pda_qty_luom"
                                  name="pda_qty_luom"
                                  type="number"
                                  value={formik.values.pda_qty_luom}
                                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                    const inputValue = event.target.value;
                                    if (inputValue.charAt(0) !== '-') {
                                      formik.setFieldValue('pda_qty_luom', inputValue);
                                    }
                                  }}
                                  inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                  sx={{ color: '#222222', height: '32px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">
                              {formik.values.pda_luom || formik.values.pda_puom}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 4: Total Quantity */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Total Quantity</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <div className="flex items-center space-x-2">
                            <div className="w-32">
                              <FormControl fullWidth variant="outlined" size="small" disabled>
                                <OutlinedInput
                                  type="number"
                                  value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
                                  sx={{ color: '#222222', height: '32px', fontSize: '14px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium">{formik.values.pda_luom || formik.values.pda_puom}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 5: Batch & Lot */}
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
                            placeholder="Batch"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
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
                            placeholder="Lot Number"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                          />
                        </td>
                      </tr>

                      {/* Row 6: Dates */}
                      <tr>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Production Date</td>
                        <td className="px-3 py-1 w-1/6">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                                }
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
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Grid>
          </Grid>
        </ThemeProvider>
      )}

      {/* Serial Wise Tab */}
      {tabIndex === 2 && (

        <ThemeProvider theme={theme}>
          <Grid sx={{ padding: '16px' }} container spacing={2}>
            <Grid item xs={12}>
              {/* REMOVE this Typography for mobile, keep only for desktop */}
              {!isMobile && (
                <Typography variant="h6" sx={{ color: '#222222', fontWeight: 500, py: 1 }}>
                  Serial Wise Information
                </Typography>
              )}
              {isMobile ? (
                renderSerialWiseMobile()
              ) : (
                // ...existing table-based code for Serial Wise...
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {/* Row 1: Product/SKU Scanning & Selection */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Product/SKU</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <Autocomplete
                            id="prod_code"
                            value={
                              !!formik.values.prod_code
                                ? ProducttallyData?.find((eachProduct) => eachProduct.prod_code === formik.values.prod_code)
                                : ({ prod_code: '' } as TTallyDetails)
                            }
                            onChange={(event, value: string | TTallyDetails | null, reason, details) => {
                              if (typeof value === 'string' || !value) {
                                formik.setFieldValue('prod_code', '');
                                return;
                              }
                              formik.setFieldValue('prod_code', value.prod_code);
                              formik.setFieldValue('quantity', value.quantity);
                              formik.setFieldValue('pda_qty_puom', value.qty_puom);
                              formik.setFieldValue('pda_qty_luom', value.qty_luom);
                              formik.setFieldValue('pda_quantity', value.quantity);
                              formik.setFieldValue('packdet_no', value.packdet_no);
                              formik.setFieldValue('uppp', value.uppp || 1);
                              formik.setFieldValue('pda_puom', value.p_uom || '');
                              formik.setFieldValue('pda_luom', value.l_uom || '');
                              setSelectedProduct({
                                prod_name: value.prod_name || '',
                                uom_count: value.uom_count || 1,
                                uppp: value.uppp || 1
                              });
                            }}
                            size="small"
                            options={ProducttallyData ?? []}
                            fullWidth
                            autoHighlight
                            freeSolo
                            getOptionLabel={(option: any) => {
                              if (typeof option === 'string') return option;
                              return option.prod_code && option.prod_name ? `${option.prod_code} - ${option.prod_name}` : '';
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Scanning barcode........ or click to select product"
                                variant="outlined"
                                label=""
                                InputProps={{
                                  ...params.InputProps,
                                  style: {
                                    color: '#000000',
                                    fontSize: '14px',
                                    backgroundColor: '#FFF9C4',
                                    fontWeight: '600'
                                  }
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    height: '32px',
                                    backgroundColor: '#FFF9C4',
                                    '&:hover': {
                                      backgroundColor: '#FFF59D'
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: '#FFF59D'
                                    }
                                  }
                                }}
                              />
                            )}
                            sx={{
                              '& .MuiInputBase-input': {
                                color: '#000000',
                                fontSize: '14px',
                                fontWeight: '600'
                              },
                              '& .MuiOutlinedInput-root': {
                                color: '#000000',
                                backgroundColor: '#FFF9C4'
                              }
                            }}
                          />
                        </td>
                      </tr>

                      {/* Row 3: Serial No. */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Serial No.</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <TextField
                            size="small"
                            onChange={formik.handleChange}
                            id="seq_number"
                            name="seq_number"
                            fullWidth
                            value={formik.values.seq_number}
                            placeholder="Scanning barcode………."
                            variant="outlined"
                            label=""
                            inputRef={serialNoRef}
                            InputProps={{
                              style: {
                                color: '#000000',
                                fontSize: '14px',
                                backgroundColor: '#FFF9C4', // Yellow background for barcode scanning
                                fontWeight: '600' // Bold text
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '32px',
                                backgroundColor: '#FFF9C4',
                                '&:hover': {
                                  backgroundColor: '#FFF59D'
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#FFF59D'
                                }
                              }
                            }}
                          />
                        </td>
                      </tr>
                      {/* Row 4: Quantities */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Quantity (Primary)</td>
                        <td className="px-3 py-1 w-1/6">
                          <div className="flex items-center space-x-2">
                            <FormControl fullWidth variant="outlined" size="small">
                              <OutlinedInput
                                id="pda_qty_puom"
                                name="pda_qty_puom"
                                type="number"
                                value={formik.values.pda_qty_puom}
                                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                  const inputValue = event.target.value;
                                  if (inputValue.charAt(0) !== '-') {
                                    formik.setFieldValue('pda_qty_puom', inputValue);
                                  }
                                }}
                                inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                sx={{ color: '#222222', height: '32px' }}
                              />
                            </FormControl>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">{formik.values.pda_puom}</span>
                          </div>
                        </td>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">
                          Quantity (Lowest)
                        </td>
                        <td className="px-3 py-1 w-1/2">
                          <div className="flex items-center space-x-2">
                            <div className="w-24">
                              <FormControl
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
                              >
                                <OutlinedInput
                                  id="pda_qty_luom"
                                  name="pda_qty_luom"
                                  type="number"
                                  value={formik.values.pda_qty_luom}
                                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                    const inputValue = event.target.value;
                                    if (inputValue.charAt(0) !== '-') {
                                      formik.setFieldValue('pda_qty_luom', inputValue);
                                    }
                                  }}
                                  inputProps={{ min: 0, style: { color: '#222222', fontSize: '14px' } }}
                                  sx={{ color: '#222222', height: '32px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium min-w-fit">
                              {formik.values.pda_luom || formik.values.pda_puom}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 4: Total Quantity */}
                      <tr className="border-b">
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Total Quantity</td>
                        <td className="px-3 py-1" colSpan={3}>
                          <div className="flex items-center space-x-2">
                            <div className="w-32">
                              <FormControl fullWidth variant="outlined" size="small" disabled>
                                <OutlinedInput
                                  type="number"
                                  value={Number(formik.values.pda_qty_puom) * (formik.values.uppp || 1)}
                                  sx={{ color: '#222222', height: '32px', fontSize: '14px' }}
                                />
                              </FormControl>
                            </div>
                            <span className="text-gray-600 text-xs font-medium">{formik.values.pda_luom || formik.values.pda_puom}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Row 5: Batch & Lot */}
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
                            placeholder="Batch"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
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
                            placeholder="Lot Number"
                            variant="outlined"
                            InputProps={{ style: { color: '#222222', fontSize: '14px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { height: '32px' } }}
                          />
                        </td>
                      </tr>

                      {/* Row 6: Dates */}
                      <tr>
                        <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Production Date</td>
                        <td className="px-3 py-1 w-1/6">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('mfg_date', newValue.format('YYYY-MM-DD'));
                                }
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
                                  InputProps: { style: { color: '#222222', fontSize: '14px' } },
                                  sx: { '& .MuiOutlinedInput-root': { height: '32px' } }
                                }
                              }}
                              value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                              onChange={(newValue) => {
                                if (newValue?.isValid()) {
                                  formik.setFieldValue('exp_date', newValue.format('YYYY-MM-DD'));
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Grid>
          </Grid>
        </ThemeProvider>
      )}

      {/*----------------------Submit-------------------------- */}
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
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
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
      {/* {isProductDataSelection && (
        <DataSelection selectedItem={{ label: 'Product', value: 'product' }} handleSelection={handlePreferenceSelection} filter={filter} />
      )} */}
    </Grid>
  );
};
export default AddInboundTallyDetailsForm;