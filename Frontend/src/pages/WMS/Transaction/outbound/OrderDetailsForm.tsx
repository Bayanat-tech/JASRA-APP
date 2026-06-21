import { TextField, Autocomplete, IconButton, InputAdornment, Radio, Typography, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TOrderDetail } from './types/jobOutbound_wms.types';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import WmsSerivceInstance from 'service/service.wms';
import { SearchIcon } from 'lucide-react';
import { DialogPop } from 'components/popup/DIalogPop';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import BlueButton from 'components/buttons/BlueButton';
import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
import { dispatch } from 'store';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

interface OrderDetailsFormProps {
  loginid: string;
  job_no: string;
  prin_code: string;
  company_code: string;
  editData: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OrderDetailsForm = ({ loginid, job_no, prin_code, company_code, editData, onSuccess, onCancel }: OrderDetailsFormProps) => {
  const transformKeysToLowerCase = (obj: any): TOrderDetail => {
    if (!obj) return defaultInitialValues;

    return Object.keys(obj).reduce((acc: any, key) => {
      const lowerCaseKey = key.toLowerCase();
      acc[lowerCaseKey] = obj[key];
      return acc;
    }, {}) as TOrderDetail;
  };

  const defaultInitialValues: TOrderDetail = {
    company_code: 'JASRA',
    prin_code: '10001',
    job_no: '1024115866',
    // company_code: company_code || 'BSG',
    // prin_code: prin_code,
    // job_no: job_no,
    prod_code: '',
    prod_name: '',
    site_code: '',
    p_uom: '',
    qty_puom: null,
    l_uom: '',
    qty_luom: 0,
    lot_no: '',
    loc_code_from: '',
    loc_code_to: '',
    salesman_code: '',
    expiry_from: new Date(),
    expiry_to: new Date(),
    batch_no: '',
    production_from: new Date(),
    production_to: new Date(),
    order_no: '',
    cust_code: '',
      cust_name: '',
    serial_no: 0,
    created_at: undefined,
    created_by: '',
    updated_at: undefined,
    updated_by: '',
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
    priority: null
  };

  const [details, setDetails] = useState<TOrderDetail>(defaultInitialValues);
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [orderEntryOptions, setOrderOptions] = useState<any[]>([]);
  const [custCode, setCustCode] = useState<any>('');
  const [LotNum, setLotnum] = useState<any>('');
  const [locOption, setLocOptions] = useState<any[]>([]);
  const [prodOptions, setProdOptions] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [editFlag, setEditFlag] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const handleProductDialogClose = () => {
    setOpen(false);
  };

  const modalTitle = 'Product Selection';

  const fetch = async () => {
    try {
      setLoading(true);
      const [siteResponse, orderEntryResponse, locationResponse, custResponse, lotResponse] = await Promise.all([
        OutboundJobServiceInstance.getddSiteCode(),
        OrderEntryServiceInstance.getOrderentry(job_no),
        WmsSerivceInstance.getddLocationCode(),
        OutboundJobServiceInstance.getddPrinceCustomer(company_code, prin_code),
        OutboundJobServiceInstance.getddLotNum()
      ]);

      if (siteResponse) setSiteOptions(siteResponse);
      if (orderEntryResponse) setOrderOptions(orderEntryResponse);
      if (locationResponse) setLocOptions(locationResponse);
      if (custResponse) setCustCode(custResponse);
      if (lotResponse) setLotnum(lotResponse);
      console.log('LotNum:', lotResponse);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      if (editData?.serial_no && editData.serial_no > 0) {
        setEditFlag(true);
        const transformedData = transformKeysToLowerCase(editData);
        setDetails(transformedData);
      } else {
        setDetails(defaultInitialValues);
      }
      await fetch();
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [editData]);

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

  const handleProduct = async () => {
    try {
      dispatch(openBackdrop());
      const effectiveCompanyCode = company_code?.trim() || editData?.COMPANY_CODE?.trim() || '';
      const effectivePrinCode = prin_code?.trim() || editData?.PRIN_CODE?.trim() || '';

      const prodResponse = await WmsSerivceInstance.getddPrinceProduct(effectiveCompanyCode, effectivePrinCode);

      if (prodResponse) {
        console.log('Product Response:', prodResponse);
        setProdOptions(prodResponse);
      }

      setOpen(true);
      dispatch(closeBackdrop());
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(closeBackdrop());
    }
  };

  const calculateQuantity = (values: TOrderDetail) => {
    return (values.qty_puom || 0) + (values.qty_luom || 0);
  };

  const validationSchema = Yup.object().shape({
    order_no: Yup.string().required('Order Number is required'),
    cust_code: Yup.string().required('Customer Code is required'),
    prod_code: Yup.string().required('Product Code is required'),
    site_code: Yup.string().required('Site Code is required'),
    loc_code_from: Yup.string().required('Location From is required'),
    loc_code_to: Yup.string().required('Location To is required'),
    qty_puom: Yup.number()
      .required('Primary Quantity is required')
      .typeError('Primary Quantity must be a number')
      .positive('Primary Quantity must be positive')
      .min(0.01, 'Primary Quantity must be at least 0.01'),
    lot_no: Yup.string().required('Lot Number is required')
  });

  const columnDefs: ColDef[] = useMemo(
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
      { headerName: 'Product Code ', field: 'PROD_CODE', width: 100, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'Product Name ', field: 'PROD_NAME', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'P_UOM ', field: 'P_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'L_UOM ', field: 'L_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'UPPP ', field: 'UPPP', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'UPP', field: 'UPP', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } }
    ],
    []
  );

  return (
    <div>
      <Formik
        enableReinitialize={true}
        initialValues={details}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            console.log('Form submitted:', values);
            await OutboundJobServiceInstance.upsertOutboundOrderDetailManualHandler(values);

            // Call success callback if provided
            if (onSuccess) {
              onSuccess();
            }

            // Reset form if it's not an edit
            if (!editFlag) {
              resetForm();
            }
          } catch (error) {
            console.error('Error in form submission:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, isSubmitting, touched, errors, handleChange, setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              {/* Order Number and Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Autocomplete
                    options={orderEntryOptions || []}
                    loading={loading}
                    getOptionLabel={(option) => option?.order_no || ''}
                    isOptionEqualToValue={(option, value) => option?.order_no === value?.order_no}
                    value={orderEntryOptions.find((option) => option.order_no === values.order_no) || null}
                    onChange={(_, newValue) => {
                      setFieldValue('order_no', newValue?.order_no || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Order Number"
                        variant="outlined"
                        fullWidth
                        error={touched.order_no && Boolean(errors.order_no)}
                        helperText={touched.order_no && errors.order_no}
                      />
                    )}
                  />

                  <Autocomplete
                    options={Array.isArray(custCode) ? custCode : []}
                    value={Array.isArray(custCode) ? custCode.find((option) => option?.cust_code === values.cust_code) : null}
                    loading={loading}
                    getOptionLabel={(option) => option?.cust_name || ''}
                    isOptionEqualToValue={(option, value) => option?.cust_code === value?.cust_code}
                    onChange={(_, newValue) => {
                      setFieldValue('cust_code', newValue?.cust_code || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer Code"
                        variant="outlined"
                        fullWidth
                        error={touched.cust_code && Boolean(errors.cust_code)}
                        helperText={touched.cust_code && errors.cust_code}
                      />
                    )}
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    fullWidth
                    name="prod_code"
                    label="Product"
                    variant="outlined"
                    value={values.prod_code}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => {
                              handleProduct();
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
              </div>

              {/* Site and Locations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <Autocomplete
                      options={siteOptions || []}
                      loading={loading}
                      getOptionLabel={(option) => option?.SITE_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.SITE_CODE === value?.site_code}
                      value={siteOptions.find((option) => option.SITE_CODE === values.site_code) || null}
                      onChange={async (_, newValue) => {
                        const selectedSiteCode = newValue?.SITE_CODE || '';
                        setFieldValue('site_code', selectedSiteCode);

                        try {
                          setLoading(true);
                          const locationResponse = await WmsSerivceInstance.getddLocationCode();

                          if (locationResponse) {
                            setLocOptions(locationResponse);
                          }
                        } catch (error) {
                          console.error('Error fetching locations:', error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Site Code"
                          variant="outlined"
                          fullWidth
                          error={touched.site_code && Boolean(errors.site_code)}
                          helperText={touched.site_code && errors.site_code}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Autocomplete
                      options={Array.isArray(locOption) ? locOption : []}
                      loading={loading}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                      value={locOption.find((option) => option.LOCATION_CODE === values.loc_code_from) || null}
                      onChange={(_, newValue) => {
                        setFieldValue('loc_code_from', newValue?.LOCATION_CODE || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Location From"
                          variant="outlined"
                          fullWidth
                          error={touched.loc_code_from && Boolean(errors.loc_code_from)}
                          helperText={touched.loc_code_from && errors.loc_code_from}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Autocomplete
                      options={Array.isArray(locOption) ? locOption : []}
                      loading={loading}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.loc_code_to}
                      value={locOption.find((option) => option.LOCATION_CODE === values.loc_code_to) || null}
                      onChange={(_, newValue) => {
                        setFieldValue('loc_code_to', newValue?.LOCATION_CODE || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Location To"
                          variant="outlined"
                          fullWidth
                          error={touched.loc_code_to && Boolean(errors.loc_code_to)}
                          helperText={touched.loc_code_to && errors.loc_code_to}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Quantity and UOM */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field
                        as={TextField}
                        fullWidth
                        name="qty_puom"
                        label="Primary Quantity"
                        type="number"
                        variant="outlined"
                        value={values.qty_puom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          setFieldValue(
                            'quantity',
                            calculateQuantity({
                              ...values,
                              qty_puom: Number(e.target.value)
                            })
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Field
                        as={TextField}
                        fullWidth
                        name="p_uom"
                        label="Primary UOM"
                        variant="outlined"
                        value={values.p_uom}
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field
                        as={TextField}
                        fullWidth
                        name="qty_luom"
                        label="Lowest Quantity"
                        type="number"
                        variant="outlined"
                        value={values.qty_luom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          setFieldValue(
                            'quantity',
                            calculateQuantity({
                              ...values,
                              qty_luom: Number(e.target.value)
                            })
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Field
                        as={TextField}
                        fullWidth
                        name="l_uom"
                        label="Lowest UOM"
                        variant="outlined"
                        value={values.l_uom}
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </div>
                  </div>

                  <Field
                    as={TextField}
                    fullWidth
                    name="quantity"
                    variant="outlined"
                    value={editFlag ? values.quantity : calculateQuantity(values)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography color="textSecondary">Quantity</Typography>
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

              {/* Other Fields */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Autocomplete
                    options={Array.isArray(LotNum) ? LotNum : []}
                    loading={loading}
                    getOptionLabel={(option) => option?.lot_no || ''}
                    isOptionEqualToValue={(option, value) => option?.lot_no === value?.lot_no}
                    value={values.lot_no ? { lot_no: values.lot_no } : null}
                    onChange={(_, newValue) => {
                      setFieldValue('lot_no', newValue?.lot_no || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lot Number"
                        variant="outlined"
                        fullWidth
                        error={touched.lot_no && Boolean(errors.lot_no)}
                        helperText={touched.lot_no && errors.lot_no}
                      />
                    )}
                  />
                </div>

                <div>
                  <Field
                    as={TextField}
                    fullWidth
                    name="batch_no"
                    label="Batch Number"
                    variant="outlined"
                    value={values.batch_no}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    fullWidth
                    name="salesman_code"
                    label="Salesman Code"
                    variant="outlined"
                    value={values.salesman_code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-4">
                {/* <BlueButton type="button" onClick={onCancel}>
                  Cancel
                </BlueButton> */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
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
                  Submit
                </Button>
              </div>
            </div>

            <DialogPop open={open} onClose={handleProductDialogClose} title={modalTitle} width={1000}>
              <CustomAgGrid
                rowSelection="single"
                rowData={prodOptions}
                columnDefs={columnDefs}
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
                      setFieldValue('prod_code', selectedProduct.PROD_CODE);
                      setFieldValue('prod_name', selectedProduct.PROD_NAME);
                      setFieldValue('p_uom', selectedProduct.P_UOM);
                      setFieldValue('l_uom', selectedProduct.L_UOM);
                    }
                    handleProductDialogClose();
                  }}
                >
                  OK
                </BlueButton>
              </div>
            </DialogPop>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OrderDetailsForm;
