import { LoadingOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Button,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import DataSelection from 'components/popup/DataSelection';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import packingServiceInstance from 'service/wms/transaction/inbound/service.packingDetailsWms';
import { useSelector } from 'store';
import { TPair } from 'types/common';
import * as yup from 'yup';

const AddOrderEntryForm = ({
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
  //----------------constants-----------------
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [isProductDataSelection, setIsProductDataSelection] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ prod_name: string; uom_count: number; uppp: number }>();

  //----------------useQuery-----------------

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
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  const { data: packingData, isFetched: isPackingDataFetched } = useQuery<TPackingDetails | undefined>({
    queryKey: ['principal_data'],
    queryFn: () => packingServiceInstance.getPacking(prin_code, job_no, packdet_no),
    enabled: isEditMode === true
  });
  //------------------formik-----------------
  const formik = useFormik<TPackingDetails>({
    initialValues: {
      prod_code: '',
      company_code: user?.company_code,
      qty_puom: 0,
      p_uom: 'CTN',
      l_uom: 'PCS',
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
      doc_ref: ''
    },
    validationSchema: yup.object().shape({
      prod_code: yup.string().required('This field is required'),
      qty_puom: yup.number().required('This field is required'),
      qty_luom: yup.number().required('This field is required'),
      mfg_date: yup.date().max(yup.ref('exp_date')).required('This field is required'),
      exp_date: yup.date().min(yup.ref('mfg_date')).required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      values.job_no = job_no;
      values.prin_code = prin_code;

      let response;
      if (isEditMode) {
        if (packdet_no) response = await packingServiceInstance.updatePackingDetail(values, packdet_no, prin_code, job_no);
      } else {
        response = await packingServiceInstance.createPackingDetail(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  const handlePreferenceSelection = (data: TPair<'uom_count' | 'uppp'>) => {
    setSelectedProduct({ prod_name: data.label, uom_count: data.uom_count, uppp: data.uppp });
    formik.setFieldValue('prod_code', data.value);
    setIsProductDataSelection(!isProductDataSelection);
  };
  //------------------useEffect------------
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
      formik.setFieldValue('quantity', Number(formik.values?.qty_puom) * selectedProduct?.uom_count + Number(formik.values.qty_luom));
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
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/*----------------------Section 1-------------------------- */}

      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" className="text-black py-2 font-semibold">
              Product Information
            </Typography>
          </Grid>
          {/*----------------------Product/SKU-------------------------- */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Product/SKU." />
              <span className="text-red-500">*</span>
            </InputLabel>

            <TextField
              size="small"
              id="prod_code"
              fullWidth
              value={selectedProduct?.prod_name}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setIsProductDataSelection(!isProductDataSelection)}>
                    <SearchOutlined />
                  </IconButton>
                )
              }}
            />

            {getIn(formik.touched, 'prod_code') && getIn(formik.errors, 'prod_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'prod_code')}
              </FormHelperText>
            )}
          </Grid>
          {/*----------------------Batch No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Batch No." />
            </InputLabel>
            <TextField size="small" onChange={formik.handleChange} id="batch_no" name="batch_no" fullWidth value={formik.values.batch_no} />
          </Grid>
          {/*----------------------Lot No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Lot No." />
            </InputLabel>
            <TextField size="small" onChange={formik.handleChange} id="lot_no" name="lot_no" fullWidth value={formik.values.lot_no} />
          </Grid>

          {/*----------------------Production From-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Production From" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full "
                value={formik.values.mfg_date ? dayjs(formik.values.mfg_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('mfg_date', newValue.toISOString());
                }}
              />
              {getIn(formik.touched, 'mfg_date') && getIn(formik.errors, 'mfg_date') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'mfg_date')}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </Grid>
          {/*----------------------Production To-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Production To" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full "
                value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('exp_date', newValue.toISOString());
                }}
              />
              {getIn(formik.touched, 'exp_date') && getIn(formik.errors, 'exp_date') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'exp_date')}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </Grid>
          {/*----------------------Expiry From-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Expiry From" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full "
                value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('exp_date', newValue.toISOString());
                }}
              />
              {getIn(formik.touched, 'exp_date') && getIn(formik.errors, 'exp_date') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'exp_date')}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </Grid>
          {/*----------------------Expiry To-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Expiry To" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full "
                value={formik.values.exp_date ? dayjs(formik.values.exp_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('exp_date', newValue.toISOString());
                }}
              />
              {getIn(formik.touched, 'exp_date') && getIn(formik.errors, 'exp_date') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'exp_date')}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </Grid>
          
          {/*----------------------Section 2-------------------------- */}

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Quantity and Unit of Measure
                </Typography>
              </Grid>
              {/*----------------------Quantity 1(Primary)-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Quantity 1(Primary)" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <OutlinedInput
                  disabled={!!selectedProduct?.uom_count ? false : true}
                  endAdornment={<InputAdornment position="end">{formik.values.p_uom}</InputAdornment>}
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.setFieldValue('qty_puom', inputValue);
                    }
                  }}
                  id="qty_puom"
                  name="qty_puom"
                  fullWidth
                  value={formik.values.qty_puom}
                />
                {getIn(formik.touched, 'qty_puom') && getIn(formik.errors, 'qty_puom') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'qty_puom')}
                  </FormHelperText>
                )}
              </Grid>
              {/*----------------------Quantity 2(Lowest)-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Quantity 2 (Lowest)" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <OutlinedInput
                  disabled={!!selectedProduct?.uom_count && selectedProduct?.uom_count > 1 ? false : true}
                  endAdornment={<InputAdornment position="end">{formik.values.l_uom}</InputAdornment>}
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.setFieldValue('qty_luom', inputValue);
                    }
                  }}
                  id="qty_luom"
                  name="qty_luom"
                  fullWidth
                  value={formik.values.qty_luom}
                />
                {getIn(formik.touched, 'qty_luom') && getIn(formik.errors, 'qty_luom') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'qty_luom')}
                  </FormHelperText>
                )}
              </Grid>
              {/*----------------------Quantity-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Quantity" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <OutlinedInput
                  endAdornment={<InputAdornment position="end">{formik.values.l_uom}</InputAdornment>}
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  disabled
                  id="quantity"
                  name="quantity"
                  fullWidth
                  value={formik.values.quantity}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/*----------------------Section 3-------------------------- */}

      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" className="text-black py-2 font-semibold">
              Order and Shipping Details
            </Typography>
          </Grid>
          {/*----------------------PO (Purchase Order) No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="PO (Purchase Order) No." />
            </InputLabel>
            <TextField size="small" onChange={formik.handleChange} id="po_no" name="po_no" fullWidth value={formik.values.po_no} />
          </Grid>
          {/*----------------------Country Of Origin-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Country Of Origin" />
            </InputLabel>

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
              autoHighlight
              getOptionLabel={(option) => option?.country_name}
              isOptionEqualToValue={(option) => option.country_code === formik.values.origin_country}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
          {/*----------------------Manufacture-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Manufacture" />
            </InputLabel>
            <TextField
              size="small"
              onChange={formik.handleChange}
              id="manu_code"
              name="manu_code"
              fullWidth
              value={formik.values.manu_code}
            />
          </Grid>
          {/*----------------------Container No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Container No." />
            </InputLabel>
            <TextField
              size="small"
              onChange={formik.handleChange}
              id="container_no"
              name="container_no"
              fullWidth
              value={formik.values.container_no}
            />
          </Grid>
         
          

          {/*----------------------BL (Bill Of Landing) No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="BL (Bill Of Landing) No." />
            </InputLabel>
            <TextField size="small" onChange={formik.handleChange} id="bl_no" name="bl_no" fullWidth value={formik.values.bl_no} />
          </Grid>
          {/*----------------------Doc Ref No.-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Doc Ref No." />
            </InputLabel>
            <TextField size="small" onChange={formik.handleChange} id="doc_ref" name="doc_ref" fullWidth value={formik.values.doc_ref} />
          </Grid>
        </Grid>
      </Grid>
      {/*----------------------Submit-------------------------- */}
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
      {isProductDataSelection && (
        <DataSelection selectedItem={{ label: 'Product', value: 'product' }} handleSelection={handlePreferenceSelection} filter={filter} />
      )}
    </Grid>
  );
};
export default AddOrderEntryForm;
