import { LoadingOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import {
  // Alert,
  Autocomplete,
  Button,
  Dialog,
  // DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  // FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  // InputLabel,
  OutlinedInput,
  Snackbar,
  Typography
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import DataSelection from 'components/popup/DataSelection';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TManufacture } from 'pages/WMS/types/manufacture-wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import packingServiceInstance from 'service/wms/transaction/inbound/service.packingDetailsWms';
import { useSelector } from 'store';
// import { TPair } from 'types/common';
import * as yup from 'yup';
import { ErrorOutline } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const AddInboundPackingDetailsForm = ({
  job_no,
  packdet_no,
  prin_code,
  onClose,
  isEditMode
}: {
  job_no: string;
  packdet_no: string;
  prin_code: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
}) => {
  const filter: ISearch = {
    search: [[{ field_name: 'prin_code', field_value: prin_code, operator: 'exactmatch' }]]
  };

  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [isProductDataSelection, setIsProductDataSelection] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ prod_name: string; uom_count: number; uppp: number }>();
  const [productSelectError, setProductSelectError] = useState<string>('');
  const [containerToastOpen, setContainerToastOpen] = useState(false);
console.log('Selected Product:', selectedProduct);
  const { data: countryList } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TCountry[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  const { data: packingData, isFetched: isPackingDataFetched } = useQuery<TPackingDetails | undefined>({
    queryKey: ['principal_data'],
    queryFn: () => packingServiceInstance.getPacking(prin_code, job_no, packdet_no),
    enabled: isEditMode === true
  });

  const { data: containerData } = useQuery({
    queryKey: ['container_no', prin_code, job_no],
    queryFn: async () => {
      const sql = `SELECT * FROM TI_CONTAINER WHERE PRIN_CODE = '${prin_code}' AND JOB_NO = '${job_no}'`;
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
    enabled: !!job_no && !!prin_code
  });

  const { data: manufacturerData } = useQuery({
    queryKey: ['manufacturer_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'manufacturer', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TManufacture[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  const formik = useFormik<TPackingDetails>({
    initialValues: {
      prod_code: '',
      company_code: user?.company_code,
      qty_puom: 0,
      p_uom: '',
      l_uom: '',
      qty_luom: 0,
      quantity: 0,
      batch_no: '',
      lot_no: '',
      mfg_date: null as unknown as Date,
      exp_date: null as unknown as Date,
      po_no: '',
      origin_country: '',
      manu_code: '',
      gross_weight: null as unknown as number,
      volume: null as unknown as number,
      shelf_life_days: null as unknown as number,
      shelf_life_date: null as unknown as Date,
      container_no: '',
      bl_no: '',
      doc_ref: '',
      uppp: null as unknown as number
    },
    validationSchema: yup.object().shape({
      prod_code: yup.string().required('This field is required'),
      qty_puom: yup.number().required('This field is required'),
      qty_luom: yup.number().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!values.container_no) {
        setContainerToastOpen(true);
        setSubmitting(false);
        return;
      }
      setSubmitting(true);
      values.job_no = job_no;
      values.prin_code = prin_code;

      // Format dates for Oracle - using ISO format (YYYY-MM-DD) which Oracle can handle
      const mfgDate = values.mfg_date ? dayjs(values.mfg_date).format('YYYY-MM-DD') : null;
      const expDate = values.exp_date ? dayjs(values.exp_date).format('YYYY-MM-DD') : null;
      const shelfLifeDate = values.shelf_life_date ? dayjs(values.shelf_life_date).format('YYYY-MM-DD') : null;

      const formattedValues = {
        ...values,
        mfg_date: mfgDate,
        exp_date: expDate,
        shelf_life_date: shelfLifeDate
      };

      console.log('Date being sent to backend:', {
        mfg_date: formattedValues.mfg_date,
        exp_date: formattedValues.exp_date,
        shelf_life_date: formattedValues.shelf_life_date
      });

      let response;
      if (isEditMode) {
        if (packdet_no) {
          response = await packingServiceInstance.updatePackingDetail(formattedValues as any, packdet_no, prin_code, job_no);
        }
      } else {
        console.log('this is values', formattedValues);
        response = await packingServiceInstance.createPackingDetail(formattedValues as any);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  console.log('Formik prod_code:', formik.values.prod_code);

  const handlePreferenceSelection = (data: any) => {
    if (!formik.values.container_no) {
      setProductSelectError('Please select Container No. first');
      return;
    }
    console.log('Product Selection Data:', data);
    setProductSelectError('');
    
    // Handle the data structure from DataSelection
    const prodCode = data.prodCode || data.prod_code || data.value || '';
    const prodName = data.prodName || data.prod_name || data.label || '';
    const pUom = data.pUom || data.p_uom || data.PUOM || '';
    const lUom = data.lUom || data.l_uom || data.LUOM || '';
    const uomCount = Number(data.uomCount || data.uom_count || data.UOM_COUNT || 1);
    const uppp = Number(data.uppp || data.UPPP || 1);
    
    console.log('Parsed values:', { prodCode, prodName, pUom, lUom, uomCount, uppp });
    
    // Set all values
    formik.setFieldValue('prod_code', prodCode);
    formik.setFieldValue('p_uom', pUom);
    formik.setFieldValue('l_uom', lUom);
    formik.setFieldValue('uppp', uppp);
    
    // Set selected product with parsed values
    setSelectedProduct({ 
      prod_name: prodName, 
      uom_count: uomCount, 
      uppp: uppp 
    });
    
    console.log('Set Selected Product:', { prod_name: prodName, uom_count: uomCount, uppp: uppp });
    
    setIsProductDataSelection(false);
  };

  // Add handler to clear selected product
  const handleRemoveSelectedProduct = () => {
    setSelectedProduct(undefined);
    formik.setFieldValue('prod_code', '');
    formik.setFieldValue('p_uom', '');
    formik.setFieldValue('l_uom', '');
    formik.setFieldValue('uppp', null);
    // Optionally reset quantities
    formik.setFieldValue('qty_puom', 0);
    formik.setFieldValue('qty_luom', 0);
    formik.setFieldValue('quantity', 0);
  };

  useEffect(() => {
    if (isEditMode && isPackingDataFetched && packingData && Object.keys(packingData).length > 0) {
      const {
        prod_code,
        company_code,
        qty_puom,
        l_uom,
        p_uom,
        qty_luom,
        quantity,
        batch_no,
        lot_no,
        mfg_date,
        exp_date,
        po_no,
        origin_country,
        manu_code,
        gross_weight,
        volume,
        shelf_life_days,
        shelf_life_date,
        container_no,
        bl_no,
        doc_ref
      } = packingData;
      formik.setValues({
        prod_code,
        company_code,
        qty_puom,
        qty_luom,
        quantity,
        batch_no,
        lot_no,
        mfg_date,
        exp_date,
        po_no,
        l_uom,
        p_uom,
        origin_country,
        manu_code,
        gross_weight,
        volume,
        shelf_life_days,
        shelf_life_date,
        container_no,
        bl_no,
        doc_ref
      });
      setSelectedProduct({
        prod_name: packingData?.prod_name as string,
        uom_count: packingData.uom_count as number,
        uppp: packingData.uppp as number
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packingData]);

  useEffect(() => {
    if (!!selectedProduct) {
      if (selectedProduct?.uom_count <= 1) {
        formik.setFieldValue('quantity', Number(formik.values?.qty_puom) + Number(formik.values.qty_luom));
        return;
      }
      formik.setFieldValue('quantity', Number(formik.values?.qty_puom) * selectedProduct?.uppp + Number(formik.values.qty_luom));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.qty_luom, formik.values.qty_puom]);

  useEffect(() => {
    if (selectedProduct?.uom_count === 1) {
      formik.setFieldValue('qty_luom', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);
  return (
    <Dialog open={true} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: '#082A88', color: '#fff', position: 'relative', minHeight: 48, pr: 5 }}>
        <span>
          <FormattedMessage id={isEditMode ? 'Edit Packing Details' : 'Add Packing Details'} />
        </span>
        <IconButton
          aria-label="close"
          onClick={() => onClose()}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fff',
            background: 'rgba(8,42,136,0.12)',
            '&:hover': { background: 'rgba(8,42,136,0.25)' }
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center" sx={{ flexDirection: 'row', py: 1 }}>
                <Grid item xs={12} sm={9} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#222222', fontWeight: 600, fontSize: '1.15rem' }}>
                    Product Information
                  </Typography>
                </Grid>
                {productSelectError && (
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
                      <ErrorOutline sx={{ color: '#d32f2f', mr: 1 }} />
                      {productSelectError}
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
                          id="container_no."
                          value={
                            !!formik.values.container_no
                              ? containerData?.tableData?.find(
                                  (eachContainer) => 
                                    eachContainer.container_no === formik.values.container_no || 
                                    eachContainer.CONTAINER_NO === formik.values.container_no
                                ) || null
                              : null
                          }
                          onChange={(event, value: any) => {
                            const containerNo = value?.container_no || value?.CONTAINER_NO;
                            const poNo = value?.po_no || value?.PO_NO;
                            console.log('Selected Container:', value);
                            formik.setFieldValue('container_no', containerNo);
                            formik.setFieldValue('po_no', poNo);
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
                              InputLabelProps={{
                                style: { color: '#444444', fontSize: '0.95rem' }
                              }}
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
                      <td className="px-3 py-1" colSpan={3} style={{ position: 'relative' }}>
                        <TextField
                          size="small"
                          id="prod_code"
                          fullWidth
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: '#222222'
                            }
                          }}
                          InputProps={{
                            style: { color: '#222222', fontSize: '0.75rem' },
                            endAdornment: (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                  onClick={() => {
                                    if (!formik.values.container_no) {
                                      setProductSelectError('Please select Container No. first');
                                    } else {
                                      setProductSelectError('');
                                      setIsProductDataSelection(!isProductDataSelection);
                                    }
                                  }}
                                  size="small"
                                >
                                  <SearchOutlined style={{ color: '#444444' }} />
                                </IconButton>
                                {selectedProduct && (
                                  <IconButton
                                    onClick={handleRemoveSelectedProduct}
                                    size="small"
                                    sx={{ ml: 0.5 }}
                                    aria-label="Remove selected product"
                                  >
                                    <CloseIcon style={{ color: '#444444' }} />
                                  </IconButton>
                                )}
                              </div>
                            )
                          }}
                          InputLabelProps={{ style: { color: '#444444' } }}
                          value={
                            selectedProduct && formik.values.prod_code
                              ? `${formik.values.prod_code} - ${selectedProduct.prod_name}`
                              : formik.values.prod_code || ''
                          }
                          placeholder="Select product"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                        Quantity (Primary)<span style={{ color: 'red' }}>*</span>
                      </td>
                      <td className="px-3 py-1" colSpan={3}>
                        <TextField
                          fullWidth={false}
                          size="small"
                          name="qty_puom"
                          type="number"
                          variant="outlined"
                          value={formik.values.qty_puom}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            if (inputValue.charAt(0) !== '-') {
                              formik.setFieldValue('qty_puom', inputValue);
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>{formik.values.p_uom}</Typography>
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
                              '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]': {
                                MozAppearance: 'textfield'
                              }
                            }
                          }}
                          sx={{ width: 140 }}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                        Quantity (Lowest)<span style={{ color: 'red' }}>*</span>
                      </td>
                      <td className="px-3 py-1" colSpan={3}>
                        <TextField
                          fullWidth={false}
                          size="small"
                          name="qty_luom"
                          type="number"
                          variant="outlined"
                          value={formik.values.qty_luom}
                          disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            if (inputValue.charAt(0) !== '-') {
                              formik.setFieldValue('qty_luom', inputValue);
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>{formik.values.l_uom || formik.values.p_uom}</Typography>
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
                              '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]': {
                                MozAppearance: 'textfield'
                              }
                            }
                          }}
                          sx={{ width: 140 }}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">
                        Total Quantity<span style={{ color: 'red' }}>*</span>
                      </td>
                      <td className="px-3 py-1" colSpan={3}>
                        <TextField
                          fullWidth={false}
                          size="small"
                          name="quantity"
                          type="number"
                          variant="outlined"
                          disabled
                          value={formik.values.quantity}
                          onChange={(event) => {
                            const inputValue = event.target.value;
                            if (inputValue.charAt(0) !== '-') {
                              formik.setFieldValue('quantity', inputValue);
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography color="textSecondary" sx={{ fontSize: '0.95rem' }}>{formik.values.l_uom || formik.values.p_uom}</Typography>
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
                              '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0
                              },
                              '& input[type=number]': {
                                MozAppearance: 'textfield'
                              }
                            }
                          }}
                          sx={{ width: 140 }}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Batch No.</td>
                      <td className="px-3 py-1 w-[35%]">
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
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Production Date</td>
                      <td className="px-3 py-1 w-1/6" style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  InputProps: { style: { color: '#222222', paddingRight: formik.values.mfg_date ? 32 : undefined } },
                                  InputLabelProps: { style: { color: '#444444' } }
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
                          {formik.values.mfg_date && (
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                              onClick={() => formik.setFieldValue('mfg_date', null)}
                              aria-label="Clear production date"
                            >
                              <CloseIcon fontSize="small" style={{ color: '#444444' }} />
                            </IconButton>
                          )}
                        </div>
                      </td>
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Expiry Date</td>
                      <td className="px-3 py-1 w-1/2" style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  InputProps: { style: { color: '#222222', paddingRight: formik.values.exp_date ? 32 : undefined } },
                                  InputLabelProps: { style: { color: '#444444' } }
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
                          {formik.values.exp_date && (
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                              onClick={() => formik.setFieldValue('exp_date', null)}
                              aria-label="Clear expiry date"
                            >
                              <CloseIcon fontSize="small" style={{ color: '#444444' }} />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r text-xs">Country of Origin</td>
                      <td className="px-3 py-1 w-1/6">
                        <Autocomplete
                          id="country_code"
                          value={
                            !!formik.values.origin_country
                              ? countryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.origin_country)
                              : ({ country_name: '' } as TCountry)
                          }
                          onChange={(event, value: TCountry | null) => {
                            formik.setFieldValue('origin_country', value?.country_code);
                          }}
                          size="small"
                          options={countryList?.tableData ?? []}
                          fullWidth
                          getOptionLabel={(option) => option?.country_name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputProps={{
                                ...params.InputProps,
                                style: { color: '#222222' }
                              }}
                              InputLabelProps={{ style: { color: '#444444' } }}
                            />
                          )}
                          sx={{
                            '& .MuiInputBase-input': { color: '#222222' },
                            '& .MuiOutlinedInput-root': { color: '#222222' },
                            '& .MuiAutocomplete-tag': { color: '#222222' }
                          }}
                        />
                      </td>
                      <td className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 w-1/6 border-r border-l text-xs">Manufacturer</td>
                      <td className="px-3 py-1 w-1/2">
                        <Autocomplete
                          id="manu_code"
                          value={
                            !!formik.values.manu_code
                              ? manufacturerData?.tableData?.find((eachMenu) => eachMenu.manu_code === formik.values.manu_code)
                              : ({ manu_name: '' } as TManufacture)
                          }
                          onChange={(event, value: TManufacture | null) => {
                            formik.setFieldValue('manu_code', value?.manu_code);
                          }}
                          size="small"
                          options={manufacturerData?.tableData ?? []}
                          fullWidth
                          getOptionLabel={(option) => option?.manu_name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputProps={{
                                ...params.InputProps,
                                style: { color: '#222222' }
                              }}
                              InputLabelProps={{ style: { color: '#444444' } }}
                            />
                          )}
                          sx={{
                            '& .MuiInputBase-input': { color: '#222222' },
                            '& .MuiOutlinedInput-root': { color: '#222222' },
                            '& .MuiAutocomplete-tag': { color: '#222222' }
                          }}
                        />
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
                              if (newValue?.isValid()) {
                                formik.setFieldValue('shelf_life_date', newValue.format('YYYY-MM-DD'));
                              }
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
                            value={formik.values.shelf_life_days}
                            onChange={(event) => {
                              const inputValue = event.target.value;
                              if (inputValue.charAt(0) !== '-') {
                                formik.setFieldValue('shelf_life_days', inputValue);
                              }
                            }}
                            inputProps={{ min: 0, style: { color: '#222222' } }}
                            sx={{
                              color: '#222222',
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'gray'
                              }
                            }}
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
              disabled={formik.isSubmitting || !formik.values.quantity}
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
              startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
            >
              <FormattedMessage id="Submit" />
            </Button>
          </Grid>
        </form>
        {isProductDataSelection && (
          <DataSelection
            selectedItem={{ label: 'Product', value: 'product' }}
            handleSelection={handlePreferenceSelection}
            filter={filter}
            prinCode={prin_code}
          />
        )}
        <Snackbar
          open={containerToastOpen}
          autoHideDuration={3000}
          onClose={() => setContainerToastOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          message="Please select Container No. first"
        />
      </DialogContent>
    </Dialog>
  );
};
export default AddInboundPackingDetailsForm;