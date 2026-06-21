import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Autocomplete, TextField, InputAdornment, IconButton, Radio, Typography, Button } from '@mui/material';


import { TOrderDetail } from './types/jobOutbound_wms.types';
import WmsSerivceInstance from 'service/service.wms';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';

import useAuth from 'hooks/useAuth';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import MyAgGrid from 'components/grid/MyAgGrid';
import BlueButton from 'components/buttons/BlueButton';
import { ColDef } from 'ag-grid-community';
import { useOutboundJobState } from 'hooks/useOutboundJobState';
import { DialogPop } from 'components/popup/DIalogPop';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface OrderDetailsFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData: TOrderDetail | null;
  rowData: any;
  onSuccess: (formData: TOrderDetail) => Promise<void>;
  isSubmitting?: boolean;
}

interface QuantityParams {
  company_code: string;
  prin_code: string | null;
  prod_code: string | null;
  site_code: string | null;
  location_from: string | null;
  location_to: string | null;
  batch: string | null;
  lot_no: string | null;
  production_from: string | null;
  production_to: string | null;
  exp_date_from: string | null;
  exp_date_to: string | null;
}

// Validation Schema
const validationSchema = Yup.object().shape({
  order_no: Yup.string().required('Order Number is required'),
  quantity: Yup.number()
    .max(Yup.ref('act_order_qty'), 'Quantity cannot exceed available quantity')
    .required('Quantity is required')
    .min(1, 'Quantity cannot be zero')
});

const OrderDetailsFormDialog: React.FC<OrderDetailsFormDialogProps> = ({
  open,
  onClose,
  mode,
  initialData,
  rowData,
  onSuccess,
  isSubmitting = false
}) => {
  const { user } = useAuth();
  // Default values
  const defaultInitialValues: TOrderDetail = {
    company_code: rowData.company_code || 'BSG',
    prin_code: rowData.prin_code,
    job_no: rowData.job_no,
    prod_code: '',
    prod_name: '',
    site_code: '',
    p_uom: '',
    qty_puom: 0,
    l_uom: '',
    qty_luom: 0,
    lot_no: '',
    loc_code_from: '',
    loc_code_to: '',
    salesman_code: '',
    expiry_from: null,
    expiry_to: null,
    batch_no: '',
    production_from: null,
    production_to: null,
    order_no: '',
    cust_code: '',
    cust_name: '',
    serial_no: 0,
    created_at: undefined,
    created_by: user?.loginid ?? '',
    updated_at: undefined,
    updated_by: user?.loginid ?? '',
    quantity: 0,
    doc_ref: null,
    po_no: null,
    imp_job_no: null,
    manu_code: null,
    container_no: null,
    unit_price: null,
    picked: null,
    confirmed: null,
    confirmed_date: null,
    uppp: null,
    selected: null,
    aisle_from: null,
    aisle_to: null,
    height_from: null,
    height_to: null,
    column_from: null,
    column_to: null,
    gate_no: null,
    sales_rate: null,
    exp_container_no: null,
    exp_container_size: null,
    exp_container_type: null,
    exp_container_sealno: null,
    moc1: null,
    moc2: null,
    order_serial: null,
    origin_country: null,
    bal_pack_qty: null,
    multi_series: null,
    prod_attrib_code: null,
    prod_grade1: null,
    prod_grade2: null,
    tx_identity_number: null,
    ref_txn_code: null,
    ref_txn_slno: null,
    so_txn_code: null,
    inbound_done: null,
    ref_txn_doc: null,
    supp_code: null,
    supp_reference: null,
    orig_prod_code: null,
    hs_code: null,
    act_order_qty: null,
    bal_order_qty: null,
    minperiod_exppick: 0,
    ignore_minexp_period: null,
    stock_owner: null,
    ind_code: null,
    git_no: null,
    priority: null,
    qty_string: null
  };

  const [usiteCode, set_UsiteCode] = useState<string>('');
  const [prodCode, set_UprodCode] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [openProduct, setOpenProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [prodOptions, setProdOptions] = useState<any[]>([]);

  // Use ref to track if this is initial mount
  const isInitialMount = useRef(true);

  // Get the table order data
  const { tableOrderData } = useOutboundJobState(rowData);

  // Transform the data object structure
  const transformedData = useMemo(
    () => ({
      ...tableOrderData,
      data:
        tableOrderData?.tableData?.map((item: any) =>
          Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]))
        ) || []
    }),
    [tableOrderData]
  );

  // Create a separate array for order options
  const orderOptions = useMemo(() => {
    return transformedData.data || [];
  }, [transformedData]);

  // Fetch site and product data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const effectiveCompanyCode = rowData.company_code?.trim() || initialData?.company_code?.trim() || '';
      const effectivePrinCode = rowData.prin_code?.trim() || initialData?.prin_code?.trim() || '';

      const [siteResponse, prodResponse] = await Promise.all([
        OutboundJobServiceInstance.getddSiteCode(),
        WmsSerivceInstance.getddPrinceProductavaliable(effectiveCompanyCode, effectivePrinCode)
      ]);

      if (siteResponse) setSiteOptions(siteResponse);
      if (prodResponse) {
        const productsArray = Array.isArray(prodResponse) ? prodResponse : [prodResponse];
        setProdOptions(productsArray);
      } else {
        setProdOptions([]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Batch NO query - with proper dependencies
  const { data: batchData, refetch: refetchbatchData } = useQuery({
    queryKey: ['batchData', usiteCode, rowData.prin_code, rowData.company_code],
    queryFn: () => {
      const sql_string = `
        SELECT DISTINCT BATCH_NO 
        FROM TT_STKLED 
        WHERE SITE_CODE = '${usiteCode || ''}' 
          AND PRIN_CODE = '${rowData.prin_code}' 
          AND COMPANY_CODE = '${rowData.company_code}'  
          AND QTY_AVL > 0
      `;
      return WmsSerivceInstance.executeRawSql(sql_string);
    },
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item) => {
          if (typeof item === 'object' && item !== null) {
            return item.BATCH_NO != null && item.BATCH_NO !== '';
          }
          return item != null && item !== '';
        })
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]));
          }
          return item;
        });
    },
    enabled: !!usiteCode && !!rowData.prin_code && !!rowData.company_code
  });

  // Location query - with proper dependencies
  const { data: locOption, refetch: refetchLocOption } = useQuery({
    queryKey: ['locOption', usiteCode, prodCode, rowData.prin_code, rowData.company_code],
    queryFn: () => {
      const location_sql_string = `
        SELECT DISTINCT LOCATION_CODE 
        FROM TT_STKLED 
        WHERE SITE_CODE = '${usiteCode || ''}' 
          AND PRIN_CODE = '${rowData.prin_code}' 
          AND COMPANY_CODE = '${rowData.company_code}' 
          AND PROD_CODE = '${prodCode || ''}' 
          AND QTY_AVL > 0
      `;
      return WmsSerivceInstance.executeRawSql(location_sql_string);
    },
    enabled: !!usiteCode && !!prodCode && !!rowData.prin_code && !!rowData.company_code,
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data.filter((item) => item?.LOCATION_CODE != null && item.LOCATION_CODE !== '');
    }
  });

  // Lot Number query - with proper dependencies
  const { data: LotNum, refetch: refetchLotNum } = useQuery({
    queryKey: ['LotNum', usiteCode, rowData.prin_code, rowData.company_code],
    queryFn: () => {
      const lotNumber_sql_string = `
        SELECT DISTINCT LOT_NO 
        FROM TT_STKLED 
        WHERE SITE_CODE = '${usiteCode || ''}' 
          AND PRIN_CODE = '${rowData.prin_code}' 
          AND COMPANY_CODE = '${rowData.company_code}'
      `;
      return WmsSerivceInstance.executeRawSql(lotNumber_sql_string);
    },
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data
        .filter((item) => {
          if (typeof item === 'object' && item !== null) {
            return item.LOT_NO != null && item.LOT_NO !== '';
          }
          return item != null && item !== '';
        })
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return Object.fromEntries(Object.entries(item).map(([key, value]) => [key.toLowerCase(), value]));
          }
          return item;
        });
    },
    enabled: !!usiteCode && !!rowData.prin_code && !!rowData.company_code
  });

  useEffect(() => {
    if (open) {
      fetchInitialData();
      isInitialMount.current = false;
    }
  }, [open]);

  // Reset dependent fields when site changes
  useEffect(() => {
    if (!isInitialMount.current && usiteCode) {
      // Reset location, batch, and lot fields when site changes
      formikRef.current?.setFieldValue('loc_code_from', '');
      formikRef.current?.setFieldValue('loc_code_to', '');
      formikRef.current?.setFieldValue('batch_no', '');
      formikRef.current?.setFieldValue('lot_no', '');

      // Refetch dependent queries
      refetchLocOption();
      refetchLotNum();
      refetchbatchData();
    }
  }, [usiteCode]);

  const mapToQuantityParams = (values: TOrderDetail): QuantityParams => ({
    company_code: values.company_code || 'BSG',
    prin_code: values.prin_code || null,
    prod_code: values.prod_code || null,
    site_code: values.site_code || null,
    location_from: values.loc_code_from || null,
    location_to: values.loc_code_to || null,
    batch: values.batch_no || null,
    lot_no: values.lot_no || null,
    production_from: values.production_from ? dayjs(values.production_from).format('YYYY-MM-DD') : null,
    production_to: values.production_to ? dayjs(values.production_to).format('YYYY-MM-DD') : null,
    exp_date_from: values.expiry_from ? dayjs(values.expiry_from).format('YYYY-MM-DD') : null,
    exp_date_to: values.expiry_to ? dayjs(values.expiry_to).format('YYYY-MM-DD') : null
  });

  // Get initial values based on mode
  const getInitialValues = (): TOrderDetail => {
    if (mode === 'edit' && initialData) {
      const transformedData = Object.keys(initialData).reduce((acc: any, key) => {
        const lowerCaseKey = key.toLowerCase();
        acc[lowerCaseKey] = initialData[key as keyof TOrderDetail];
        return acc;
      }, {}) as TOrderDetail;

      return {
        ...defaultInitialValues,
        ...transformedData
      };
    }
    return defaultInitialValues;
  };

  const getQuantityParams = (values: QuantityParams) => ({
    company_code: rowData.company_code || 'BSG',
    prin_code: rowData.prin_code || null,
    prod_code: values.prod_code ?? null,
    site_code: values.site_code ?? null,
    location_from: values.location_from ?? null,
    location_to: values.location_to ?? null,
    batch: values.batch ?? null,
    lot_no: values.lot_no ?? null,
    production_from: values.production_from ?? null,
    production_to: values.production_to ?? null,
    exp_date_from: values.exp_date_from ?? null,
    exp_date_to: values.exp_date_to ?? null
  });

  const fetchAndSetAvailableQty = async (values: QuantityParams, setFieldValue: (arg0: string, arg1: number) => void) => {
    try {
      const params = getQuantityParams(values);
      const response = await OutboundJobServiceInstance.getTotalAvailableQty(params);
      setFieldValue('act_order_qty', Math.trunc(response ?? 0));
    } catch (error) {
      console.error('Failed to fetch available quantity', error);
      setFieldValue('act_order_qty', 0);
    }
  };

  const handleSubmit = async (values: TOrderDetail, { setSubmitting }: any) => {
    try {
      console.log('Submitting form with values:', values);
      await onSuccess(values);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Use ref to access formik methods outside the form
  const formikRef = useRef<any>(null);

  const RadioCellRenderer = (params: any) => {
    const isSelected = params.node.isSelected();

    const handleRadioChange = () => {
      params.api.forEachNode((node: any) => {
        node.setSelected(false);
      });
      params.node.setSelected(true);
      params.api.refreshCells({ force: true });
    };

    return (
      <Radio
        checked={isSelected}
        onChange={handleRadioChange}
        color="primary"
        size="small"
        value={params.node.id}
        sx={{
          padding: '0',
          '&.Mui-checked': {
            color: 'primary.main'
          }
        }}
      />
    );
  };

  const mycolumnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Select',
        field: 'checkbox',
        width: 10,
        cellRenderer: RadioCellRenderer,
        cellStyle: { display: 'flex', justifyContent: 'center' } as any,
        minWidth: 10,
        maxWidth: 30,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      { headerName: 'Product Name ', field: 'PROD_NAME', width: 400, minWidth: 400, cellStyle: { fontSize: '12px' } },
      { headerName: 'P UOM ', field: 'P_UOM', width: 60, minWidth: 60, cellStyle: { fontSize: '12px' } },
      { headerName: 'L UOM ', field: 'L_UOM', width: 60, minWidth: 60, cellStyle: { fontSize: '12px' } },
      {
        headerName: 'Available Quantity ',
        field: 'QTY_AVL',
        width: 60,
        minWidth: 60,
        cellStyle: { fontSize: '12px', textAlign: 'right' } as any
      }
    ],
    []
  );

  const handleProductDialogClose = () => {
    setOpenProduct(false);
  };

  return (
    <DialogPop
      disableScrollLock={true}
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create Order Detail' : 'Edit Order Detail'}
      width={1000}
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnMount={true}
        enableReinitialize
        validateOnChange={true}
        validateOnBlur={true}
        innerRef={formikRef}
      >
        {(formik) => {
          const { isValid } = formik;
          const { values, errors, touched, isSubmitting, handleChange, setFieldValue } = formik;

          const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
            const value = parseInt(e.target.value) || 0;
            const { values, setFieldValue } = formik;

            setFieldValue(fieldName, value);

            const qtyPuom = fieldName === 'qty_puom' ? value : Number(values.qty_puom) || 0;
            const qtyLuom = fieldName === 'qty_luom' ? value : Number(values.qty_luom) || 0;
            const uppp = Number(values.uppp) || 1;

            const totalQuantity = Math.round(qtyPuom * uppp + qtyLuom);
            setFieldValue('quantity', totalQuantity);
          };

          return (
            <>
              <Form>
                <div className="max-w-7xl mx-2">
                  <div>
                    {/* Order and Product Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Autocomplete<any>
                              options={orderOptions}
                              loading={loading}
                              getOptionLabel={(option: any) => option?.order_no || ''}
                              isOptionEqualToValue={(option, value) => option?.order_no === value?.order_no}
                              value={orderOptions.find((option: any) => option.order_no === values.order_no) || null}
                              onChange={(_, newValue: any) => {
                                setFieldValue('order_no', newValue?.order_no || '');
                                setFieldValue('cust_code', newValue?.cust_code || '');
                                setFieldValue('cust_name', newValue?.cust_name || '');
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select order number"
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  label="Order Number"
                                  error={touched.order_no && Boolean(errors.order_no)}
                                  helperText={touched.order_no && errors.order_no}
                                />
                              )}
                            />
                          </div>

                          <div>
                            <Field
                              as={TextField}
                              fullWidth
                              label="Customer"
                              size="small"
                              name="cust_name"
                              variant="outlined"
                              sx={{ minWidth: 90 }}
                              value={values.cust_name || values.cust_code}
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </div>
                        </div>

                        <div className="lg:col-span-3 gap-4 mt-4 flex items-center">
                          <Field
                            as={TextField}
                            fullWidth
                            size="small"
                            name="prod_name"
                            label="Product"
                            variant="outlined"
                            value={values.prod_name}
                            onChange={handleChange}
                            InputProps={{
                              readOnly: true,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    edge="end"
                                    onClick={async () => {
                                      const prodResponse = await WmsSerivceInstance.getddPrinceProductavaliable(
                                        rowData.company_code,
                                        rowData.prin_code
                                      );
                                      if (prodResponse) {
                                        const productsArray = Array.isArray(prodResponse) ? prodResponse : [prodResponse];
                                        setProdOptions(productsArray);
                                      } else {
                                        setProdOptions([]);
                                      }
                                      setOpenProduct(true);
                                    }}
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />

                          <Field
                            as={TextField}
                            label="Primary Unit of Measurement1"
                            fullWidth
                            value={values.p_uom || ''}
                            size="small"
                            name="p_uom"
                            variant="outlined"
                            
                            InputProps={{
                              readOnly: true,
                            
                              sx: {
                                // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                          />
                          <Field
                            as={TextField}
                            label="Lowest Unit of Measurement"
                            fullWidth
                            value={values.l_uom || ''}
                            size="small"
                            name="l_uom"
                            variant="outlined"
                            
                            InputProps={{
                              readOnly: true,
                            
                              sx: {
                                // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="bg-blue-50 border border-[#082a89] rounded-sm w-full h-full flex flex-col items-center justify-start shadow-sm">
                          <div className="bg-[#082a89] text-white text-xs font-semibold p-1 mb-2 w-full text-center">
                            Available Quantity
                          </div>
                          <div className="text-3xl font-bold text-[#082a89] mt-1"> {Math.trunc(values.act_order_qty ?? 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Location and Batch Details */}
                    <div className="mb-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Autocomplete
                            options={siteOptions || []}
                            loading={loading}
                            getOptionLabel={(option) => option?.SITE_CODE || ''}
                            isOptionEqualToValue={(option, value) => option?.SITE_CODE === value?.SITE_CODE}
                            value={siteOptions.find((option) => option.SITE_CODE === values.site_code) || null}
                            onChange={(_, newValue) => {
                              const updatedValues = {
                                ...values,
                                site_code: newValue?.SITE_CODE || ''
                              };

                              setFieldValue('site_code', newValue?.SITE_CODE || '');
                              set_UsiteCode(newValue?.SITE_CODE || '');

                              // Reset dependent fields
                              setFieldValue('loc_code_from', '');
                              setFieldValue('loc_code_to', '');
                              setFieldValue('batch_no', '');
                              setFieldValue('lot_no', '');
                              setFieldValue('production_from', null);
                              setFieldValue('production_to', null);
                              setFieldValue('expiry_from', null);
                              setFieldValue('expiry_to', null);

                              const params = mapToQuantityParams(updatedValues);
                              fetchAndSetAvailableQty(params, setFieldValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select site"
                                variant="outlined"
                                fullWidth
                                label="Site Code"
                                size="small"
                                error={touched.site_code && Boolean(errors.site_code)}
                                helperText={touched.site_code && errors.site_code}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Autocomplete
                            options={Array.isArray(locOption) ? locOption : []}
                            loading={loading}
                            getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                            isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                            value={locOption?.find((option) => option.LOCATION_CODE === values.loc_code_from) || null}
                            disabled={!values.site_code || !values.prod_code}
                            onChange={(_, newValue) => {
                              const updatedValues = {
                                ...values,
                                loc_code_from: newValue?.LOCATION_CODE || '',
                                loc_code_to: newValue?.LOCATION_CODE || ''
                              };

                              setFieldValue('loc_code_from', newValue?.LOCATION_CODE || '');
                              setFieldValue('loc_code_to', newValue?.LOCATION_CODE || '');

                              const params = mapToQuantityParams(updatedValues);
                              fetchAndSetAvailableQty(params, setFieldValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={!values.site_code ? 'Select site first' : 'Select location'}
                                variant="outlined"
                                fullWidth
                                size="small"
                                label="Location From"
                                error={touched.loc_code_from && Boolean(errors.loc_code_from)}
                                helperText={touched.loc_code_from && errors.loc_code_from}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Autocomplete
                            options={Array.isArray(locOption) ? locOption : []}
                            loading={loading}
                            getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                            disabled={!values.site_code || !values.prod_code}
                            isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.loc_code_to}
                            value={locOption?.find((option) => option.LOCATION_CODE === values.loc_code_to) || null}
                            onChange={(_, newValue) => {
                              const updatedValues = {
                                ...values,
                                loc_code_to: newValue?.LOCATION_CODE || ''
                              };

                              setFieldValue('loc_code_to', newValue?.LOCATION_CODE || '');

                              const params = mapToQuantityParams(updatedValues);
                              fetchAndSetAvailableQty(params, setFieldValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={!values.site_code ? 'Select site first' : 'Select location'}
                                variant="outlined"
                                fullWidth
                                label="Location To"
                                size="small"
                                error={touched.loc_code_to && Boolean(errors.loc_code_to)}
                                helperText={touched.loc_code_to && errors.loc_code_to}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Autocomplete
                            options={Array.isArray(batchData) ? batchData : []}
                            loading={loading}
                            getOptionLabel={(option) => option?.batch_no || ''}
                            isOptionEqualToValue={(option, value) => option?.batch_no === value?.batch_no}
                            value={
                              Array.isArray(batchData) ? batchData.find((option) => option.batch_no === values.batch_no) || null : null
                            }
                            disabled={!values.site_code}
                            noOptionsText="No options"
                            onChange={(_, newValue) => {
                              setFieldValue('batch_no', newValue?.batch_no || '');
                              const updatedValues = { ...values, batch_no: newValue?.batch_no || '' };
                              const params = mapToQuantityParams(updatedValues);
                              fetchAndSetAvailableQty(params, setFieldValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={!values.site_code ? 'Select site first' : 'Select batch'}
                                variant="outlined"
                                fullWidth
                                size="small"
                                label="Batch Number"
                                error={touched.batch_no && Boolean(errors.batch_no)}
                                helperText={touched.batch_no && errors.batch_no}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Autocomplete
                            options={
                              Array.isArray(LotNum)
                                ? LotNum.filter((option) => (option?.lot_no && option.lot_no.trim() !== '') || null)
                                : []
                            }
                            loading={loading}
                            getOptionLabel={(option) => option?.lot_no || ''}
                            disabled={!values.site_code}
                            isOptionEqualToValue={(option, value) => option?.lot_no === value?.lot_no}
                            value={Array.isArray(LotNum) ? LotNum.find((option) => option.lot_no === values.lot_no) || null : null}
                            onChange={(_, newValue) => {
                              const updatedValues = {
                                ...values,
                                lot_no: newValue?.lot_no || ''
                              };

                              setFieldValue('lot_no', newValue?.lot_no || '');

                              const params = mapToQuantityParams(updatedValues);
                              fetchAndSetAvailableQty(params, setFieldValue);
                            }}
                            noOptionsText="No options"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={!values.site_code ? 'Select site first' : 'Select lot number'}
                                variant="outlined"
                                fullWidth
                                label="Lot Number"
                                size="small"
                                error={touched.lot_no && Boolean(errors.lot_no)}
                                helperText={touched.lot_no && errors.lot_no}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* MFG date EXP date */}
                    <div className="mb-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Production From"
                              value={dayjs(values.production_from)}
                              onChange={(newValue) => {
                                const newDate = newValue?.toDate?.() ?? null;
                                setFieldValue('production_from', newDate);
                                setFieldValue('production_to', newDate);

                                const updatedValues = {
                                  ...values,
                                  production_from: newDate
                                };

                                const params = mapToQuantityParams(updatedValues);
                                fetchAndSetAvailableQty(params, setFieldValue);
                              }}
                              disabled={!values.prod_code}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error: false
                                  // error: touched.production_from && Boolean(errors.production_from),
                                  // helperText: touched.production_from && errors.production_from
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </div>

                        <div className="space-y-2">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Production To"
                              disabled={!values.prod_code}
                              value={dayjs(values.production_to)}
                              onChange={(newValue) => {
                                const newDate = newValue?.toDate?.() ?? null;
                                setFieldValue('production_to', newDate);

                                const updatedValues = {
                                  ...values,
                                  production_to: newDate
                                };

                                const params = mapToQuantityParams(updatedValues);
                                fetchAndSetAvailableQty(params, setFieldValue);
                              }}
                              format="DD/MM/YYYY"
                              minDate={dayjs(values.production_from)}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error: false
                                  // error: touched.production_to && Boolean(errors.production_to),
                                  // helperText: touched.production_to && errors.production_to
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </div>

                        <div className="space-y-2">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Expiry From"
                              value={dayjs(values.expiry_from)}
                              disabled={!values.prod_code}
                              onChange={(newValue) => {
                                const newDate = newValue?.toDate?.() ?? null;
                                setFieldValue('expiry_from', newDate);
                                setFieldValue('expiry_to', newDate);

                                const updatedValues = {
                                  ...values,
                                  expiry_from: newDate
                                };

                                const params = mapToQuantityParams(updatedValues);
                                fetchAndSetAvailableQty(params, setFieldValue);
                              }}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error: false
                                  // error: touched.expiry_from && Boolean(errors.expiry_from),
                                  // helperText: touched.expiry_from && errors.expiry_from
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </div>

                        <div className="space-y-2">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Expiry To"
                              value={dayjs(values.expiry_to)}
                              disabled={!values.prod_code}
                              onChange={(newValue) => {
                                const newDate = newValue?.toDate?.() ?? null;
                                setFieldValue('expiry_to', newDate);

                                const updatedValues = {
                                  ...values,
                                  expiry_to: newDate
                                };

                                const params = mapToQuantityParams(updatedValues);
                                fetchAndSetAvailableQty(params, setFieldValue);
                              }}
                              minDate={dayjs(values.expiry_from)}
                              format="DD/MM/YYYY"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error: false
                                  // error: touched.expiry_to && Boolean(errors.expiry_to),
                                  // helperText: touched.expiry_to && errors.expiry_to
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </div>

                        <div className="space-y-2">
                          <Field
                            as={TextField}
                            fullWidth
                            size="small"
                            name="uppp"
                            variant="outlined"
                            value={values.uppp}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography color="textSecondary" variant="body2">
                                    UPPP
                                  </Typography>
                                </InputAdornment>
                              ),
                              inputProps: {
                                style: {
                                  textAlign: 'right',
                                  paddingRight: '8px'
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Information */}
                    <div className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 justify-between">
                        <div className=" p-3 rounded-lg border border-gray-200">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Primary Quantity "
                                name="qty_puom"
                                type="number"
                                variant="outlined"
                                value={values.qty_puom}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQtyChange(e, 'qty_puom')}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.p_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right',
                                      MozAppearance: 'textfield',
                                      WebkitAppearance: 'none',
                                      appearance: 'textfield'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                                error={Boolean(errors.qty_puom)}
                                helperText={errors.qty_puom}
                              />
                            </div>

                            <div className="space-y-2">
                              <Field
                                as={TextField}
                                label="Lowest Quantity"
                                fullWidth
                                value={values.qty_luom || 0}
                                disabled={values.p_uom === values.l_uom}
                                size="small"
                                name="qty_luom"
                                type="number"
                                variant="outlined"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQtyChange(e, 'qty_luom')}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.p_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                              />
                            </div>

                            <div className="space-y-2">
                              <Field
                                as={TextField}
                                fullWidth
                                size="small"
                                name="quantity"
                                label="Total Quantity"
                                variant="outlined"
                                error={Boolean(errors.quantity)}
                                helperText={errors.quantity}
                                value={values.quantity || 0}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.p_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right',
                                      MozAppearance: 'textfield',
                                      WebkitAppearance: 'none',
                                      appearance: 'textfield'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                              />
                            </div>
                          </div>
                        </div>
                        <div className=" p-3 rounded-lg "></div>
                        <div className=" p-3 rounded-lg  "></div>
                        <div className=" p-3 rounded-lg  "></div>
                        <div className=" p-3 rounded-lg border border-gray-200">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Field
                                disabled
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Actual Primary Quantity "
                                type="number"
                                variant="outlined"
                                value={values.qty_puom}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.p_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right',
                                      MozAppearance: 'textfield',
                                      WebkitAppearance: 'none',
                                      appearance: 'textfield'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                              />
                            </div>

                            <div className="space-y-2">
                              <Field
                                disabled
                                as={TextField}
                                label="Actual Lowest Quantity"
                                fullWidth
                                size="small"
                                type="number"
                                variant="outlined"
                                value={values.qty_luom || 0}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.p_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                              />
                            </div>

                            <div className="space-y-2">
                              <Field
                                disabled
                                as={TextField}
                                fullWidth
                                size="small"
                                label="Actual Quantity"
                                variant="outlined"
                                value={values.quantity || 0}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography color="textSecondary">{values.l_uom}</Typography>
                                    </InputAdornment>
                                  ),
                                  inputProps: {
                                    style: {
                                      textAlign: 'right',
                                      MozAppearance: 'textfield',
                                      WebkitAppearance: 'none',
                                      appearance: 'textfield'
                                    }
                                  },
                                  sx: {
                                    // Remove number input arrows in Chrome, Safari, Edge, and Firefox
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
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
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
                        {mode === 'edit' ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Dialog */}
                <DialogPop open={openProduct} onClose={handleProductDialogClose} title={'Product Selection'} width={'60vw'}>
                  <MyAgGrid
                    rowSelection="single"
                    rowData={prodOptions}
                    columnDefs={mycolumnDefs}
                    paginationPageSize={1000}
                    pagination={true}
                    paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
                    height="480px"
                    rowHeight={25}
                    headerHeight={30}
                    onSelectionChanged={(params) => {
                      const selectedNode = params.api.getSelectedNodes()[0];
                      if (selectedNode) {
                        console.log('Selected Node:', selectedNode.data);
                        setSelectedProduct(selectedNode.data);
                      }
                    }}
                  />
                  <div className="flex justify-end mt-4">
                    <BlueButton
                      onClick={() => {
                        if (selectedProduct) {
                          setFieldValue('prod_name', selectedProduct?.PROD_NAME || '');
                          setFieldValue('prod_code', selectedProduct?.PROD_CODE || '');
                          setFieldValue('p_uom', selectedProduct?.P_UOM || '');
                          setFieldValue('l_uom', selectedProduct?.L_UOM || '');
                          set_UprodCode(selectedProduct?.PROD_CODE || '');

                          // Reset site-related fields since product changed
                          setFieldValue('site_code', '');
                          set_UsiteCode('');
                          setFieldValue('loc_code_from', '');
                          setFieldValue('loc_code_to', '');
                          setFieldValue('batch_no', '');
                          setFieldValue('lot_no', '');
                          setFieldValue('act_order_qty', Math.trunc(selectedProduct?.QTY_AVL ?? 0));
                        }
                        handleProductDialogClose();
                      }}
                    >
                      OK
                    </BlueButton>
                  </div>
                </DialogPop>
              </Form>
            </>
          );
        }}
      </Formik>
    </DialogPop>
  );
};

export default OrderDetailsFormDialog;
