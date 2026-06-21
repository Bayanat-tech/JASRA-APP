import { Button, FormHelperText, Grid, TextField, Stack } from '@mui/material';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useEffect } from 'react';
import * as yup from 'yup';
import { TSupplier } from 'pages/Purchasefolder/type/supplier-pf-types';
import GmSupplierPfServiceInstance from 'service/Purchaseflow/service.supplier_pf';
// import { useQuery } from '@tanstack/react-query';
// import PfServiceInstance from 'service/service.purhaseflow';
import { useDispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import CustomAlert from 'components/@extended/CustomAlert';
import { IoSendSharp } from 'react-icons/io5';
// import PfSerivceInstance from 'service/service.purhaseflow';
// import { DdMatrialCategory } from 'pages/Purchasefolder/type/ddMaterialCategory_pf.types';

const AddSupplierPfForm = ({
  onClose,
  isEditMode,
  existingData,
  isViewMode,
  onSuccess
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TSupplier;
  isViewMode?: boolean; //
  onSuccess?: () => void;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  // ----------------- Fetch Currency code *************************
  // const { app } = useSelector((state) => state.menuSelectionSlice);

  /* Commented out material category fetch for now
  const { data: materialCategoryList = [] } = useQuery({
    queryKey: ['material_category_data', app],
    queryFn: async () => {
      if (!app) return [] as DdMatrialCategory[];
      try {
        const response: any = await PfSerivceInstance.getMasters(app, 'ddMaterialCateotry');
        console.log('Material Category response:', response);
        if (response) {
          if (Array.isArray(response)) {
            return response as DdMatrialCategory[];
          } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data as DdMatrialCategory[];
          } else if (response.tableData && Array.isArray(response.tableData)) {
            return response.tableData as DdMatrialCategory[];
          } else if (response.success && response.data && Array.isArray(response.data.data)) {
            return response.data.data as DdMatrialCategory[];
          }
        }
        return [] as DdMatrialCategory[];
      } catch (error) {
        console.error('Error fetching material categories:', error);
        return [] as DdMatrialCategory[];
      }
    },
    enabled: !!app
  });
  */

  //------------------formik-----------------
  const dispatch = useDispatch();
  const formik = useFormik<TSupplier>({
    initialValues: {
      company_code: existingData?.company_code || user?.company_code || '',
      prin_code: existingData?.prin_code || '10001',
      supp_code: existingData?.supp_code || '',
      supp_name: existingData?.supp_name || '',
      payment_terms: existingData?.payment_terms || '',
      cr_number: existingData?.cr_number || '',
      mater_category_code: existingData?.mater_category_code || ''
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      supp_name: yup.string().required('Supplier Name is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        values.updated_by = user?.username || 'system';
        let response;
        if (isEditMode) {
          response = await GmSupplierPfServiceInstance.editSupplierMaster(values);
          onSuccess?.();
        } else {
          response = await GmSupplierPfServiceInstance.addSupplierMaster(values);
        }
        if (response) {
          dispatch(
            showAlert({
              severity: 'success',
              message: isEditMode ? 'Supplier updated successfully!' : 'Supplier added successfully!',
              open: true
            })
          );
          onClose?.(true);
        }
      } catch (error: any) {
        console.error('Error submitting supplier form:', error);
        dispatch(
          showAlert({
            severity: 'error',
            message: error?.message || 'Something went wrong!', // Ensure error is typed correctly
            open: true
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isEditMode || isViewMode) {
      const { ...supplierData } = existingData || {};
      formik.setValues(supplierData);
    }
  }, [isEditMode, isViewMode, existingData]);

  /* Material category selection disabled for now
  const selected = materialCategoryList.find((category) => category.supp_mat_cat_code === formik.values.mater_category_code);
  */

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit} className="mt-2 ">
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>

      {/* ************************************ Frist Row ******************************************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={2}>
          <TextField
            // disable input when in view mode or when adding (auto-generated)
            disabled={isViewMode || !isEditMode}
            InputProps={{ readOnly: isViewMode || !isEditMode }}
            label={'Supplier Code*'}
            name="supp_code"
            value={formik.values.supp_code || 'Auto generated'}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.supp_code && formik.errors.supp_code)}
            fullWidth
          />
          {formik.touched.supp_code && formik.errors.supp_code && <FormHelperText error>{formik.errors.supp_code}</FormHelperText>}
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Supplier Name*'}
            name="supp_name"
            value={formik.values.supp_name}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.supp_name && formik.errors.supp_name)}
            fullWidth
          />
          {formik.touched.supp_name && formik.errors.supp_name && <FormHelperText error>{formik.errors.supp_name}</FormHelperText>}
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Mobile No'}
            name="mobile"
            value={formik.values.mobile}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.mobile && formik.errors.mobile)}
            fullWidth
          />
          {formik.touched.mobile && formik.errors.mobile && <FormHelperText error>{formik.errors.mobile}</FormHelperText>}
        </Grid>
      </Grid>

      {/* ****************************** Second Row ************************************************* */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            InputProps={{ readOnly: isViewMode }}
            label="Supplier Tel No."
            name="supp_telno1"
            value={formik.values.supp_telno1}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.supp_telno1 && formik.errors.supp_telno1)}
          />
          {formik.touched.supp_telno1 && formik.errors.supp_telno1 && <FormHelperText error>{formik.errors.supp_telno1}</FormHelperText>}
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            InputProps={{ readOnly: isViewMode }}
            name="supp_faxno1"
            value={formik.values.supp_faxno1}
            onChange={formik.handleChange}
            label="Supplier Fax"
            error={formik.touched.supp_faxno1 && Boolean(formik.errors.supp_faxno1)}
            helperText={formik.touched.supp_faxno1 && formik.errors.supp_faxno1}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            InputProps={{ readOnly: isViewMode }}
            label="Email"
            name="supp_email1"
            value={formik.values.supp_email1}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.supp_email1 && formik.errors.supp_email1)}
          />
          {formik.touched.supp_email1 && formik.errors.supp_email1 && <FormHelperText error>{formik.errors.supp_email1}</FormHelperText>}
        </Grid>

        {/* <Grid item xs={12} sm={2}>
    <FormControl fullWidth error={Boolean(formik.touched.curr_code && formik.errors.curr_code)}>
      {isViewMode ? '' : <InputLabel id="curr-code-label">Country Code*</InputLabel>}
      {isViewMode ? (
        <TextField
          value={currencyOptions.find((opt) => opt.value === formik.values.curr_code)?.label || ''}
          InputProps={{
            readOnly: true,
            disableUnderline: true
          }}
        />
      ) : (
        <Select
          labelId="curr-code-label"
          name="curr_code"
          value={formik.values.curr_code} // Default value is "USD"
          onChange={formik.handleChange}
        >
          {currencyOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {/* Uncomment if you want to hardcode the options
          {/* <MenuItem value="USD">US</MenuItem>
          <MenuItem value="INR">IN</MenuItem>
          <MenuItem value="GBP">GB</MenuItem>
          <MenuItem value="EUR">EU</MenuItem> */}
        {/* </Select>
      )}
      {formik.touched.curr_code && formik.errors.curr_code && (
        <FormHelperText>{formik.errors.curr_code}</FormHelperText>
      )}
    </FormControl>
  </Grid> */}

        {/* <Grid item xs={12} sm={2}>
    <TextField
      InputProps={{ readOnly: isViewMode }}
      label={'Currency Code*'}
      fullWidth
      name="Currency Code"
      value={formik.values.curr_code}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.curr_code && Boolean(formik.errors.curr_code)}
      helperText={formik.touched.curr_code && formik.errors.curr_code}
      disabled={true}
    >
      {currencyOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  </Grid> */}
      </Grid>
      {/* ******************************* third Row ********************************************* */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            InputProps={{
              readOnly: isViewMode,
              sx: {
                height: '100px',
                alignItems: 'flex-start'
              }
            }}
            label="Box Address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.address && formik.errors.address)}
          />
          {formik.touched.address && formik.errors.address && <FormHelperText error>{formik.errors.address}</FormHelperText>}
        </Grid>
      </Grid>
      {/* <Grid item xs={12} sm={2}>
      {/* ************************** Fourth row ***************************************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'CR Number'}
            fullWidth
            name="cr_number"
            value={formik.values.cr_number}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="payment_terms"
            value={formik.values.payment_terms}
            onChange={formik.handleChange}
            fullWidth
            label="Payment Terms"
            error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
            helperText={formik.touched.payment_terms && formik.errors.payment_terms}
          />
        </Grid>
        {/* Material Category dropdown commented out for now
        <Grid item xs={12} sm={4}>
          <Autocomplete
            id="mater_category_code"
            value={selected || null}
            onChange={(event, value: DdMatrialCategory | null) => {
              formik.setFieldValue('mater_category_code', value ? value.supp_mat_cat_code : '');
            }}
            options={materialCategoryList || []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.supp_mat_cat_desp || ''}
            isOptionEqualToValue={(option, value) => option?.supp_mat_cat_code === value?.supp_mat_cat_code}
            renderInput={(params) => (
              <TextField
                label="Material Category"
                {...params}
                inputProps={{
                  ...params.inputProps,
                  readOnly: isViewMode
                }}
                error={formik.touched.mater_category_code && Boolean(formik.errors.mater_category_code)}
                helperText={formik.touched.mater_category_code && formik.errors.mater_category_code}
              />
            )}
            disabled={isViewMode}
          />
        </Grid>
        */}
      </Grid>

      {/* ************************** Third row ***************************************** */}
      {/*<Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="payment_terms"
            value={formik.values.payment_terms}
            onChange={formik.handleChange}
            fullWidth
            label="Payment Terms"
            error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
            helperText={formik.touched.payment_terms && formik.errors.payment_terms}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={
              materialCategoryList?.tableData?.map((item) => ({
                label: item.label,
                value: item.value
              })) ?? []
            }
            getOptionLabel={(option) => option.label || ''}
            onChange={(event, value) => formik.setFieldValue('mater_category_code', value ? value.value : '')}
            onBlur={() => formik.setFieldTouched('mater_category_code', true)}
            value={materialCategoryList?.tableData?.find((cat) => cat.value === formik.values.mater_category_code) || null}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Material Category"
                placeholder="Optional"
                variant="outlined"
                error={formik.touched.mater_category_code && Boolean(formik.errors.mater_category_code)}
                helperText={formik.touched.mater_category_code && formik.errors.mater_category_code}
                sx={{
                  maxWidth: '700px',
                  '& .MuiInputBase-input': { fontSize: '0.8rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: formik.touched.mater_category_code && !formik.values.mater_category_code ? 'red' : 'default'
                    }
                  }
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* ********************************* Eight Row ******************************************** */}

      {/* <Grid container spacing={2} sx={{ mb: '20px' }}> */}
      {/* <Grid item xs={12} sm={3}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="supp_acref"
            value={formik.values.supp_acref}
            onChange={formik.handleChange}
            fullWidth
            label={'Supplier Account Reference*'}
            error={formik.touched.supp_acref && Boolean(formik.errors.supp_acref)}
            helperText={formik.touched.supp_acref && formik.errors.supp_acref}
          />
        </Grid> */}
      {/* <Grid item xs={12} sm={3}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="supp_credit"
            value={formik.values.supp_credit || 0}
            onChange={formik.handleChange}
            type="number"
            error={Boolean(formik.touched.supp_credit && formik.errors.supp_credit)}
            fullWidth
            label={'Credit Score*'}
          />
          {formik.touched.supp_credit && formik.errors.supp_credit && <FormHelperText error>{formik.errors.supp_credit}</FormHelperText>}
        </Grid> */}

      {/* <Grid item xs={12} sm={3}>
      
          <FormControl fullWidth error={Boolean(formik.touched.supp_stat && formik.errors.supp_stat)}>
            <InputLabel id="supp-status-label">Supplier Status*</InputLabel>
            <Select
              labelId="supp-status-label"
              name="supp_stat"
              value={formik.values.supp_stat || 'A'}
              onChange={formik.handleChange}
              label="Supplier Status*"
              inputProps={{
                readOnly: isViewMode // Disable the field if isViewMode is true
              }}
            >
              <MenuItem value="A">Active</MenuItem>
              <MenuItem value="I">Inactive</MenuItem>
            </Select>
            {formik.touched.supp_stat && formik.errors.supp_stat && <FormHelperText>{formik.errors.supp_stat}</FormHelperText>}
          </FormControl>
        </Grid> */}
      {/* </Grid> */}

      {/* ********************************* Nine Row ******************************************** */}

      <Grid item xs={12} className="flex justify-center">
        {isViewMode ? (
          ''
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              sx={{ backgroundColor: '#082a89', color: 'white' }}
              type="submit"
              size="small"
              variant="outlined"
              disabled={formik.isSubmitting}
              endIcon={<IoSendSharp />}
            >
              Submit
            </Button>

            <Button
              sx={{ backgroundColor: '#082a89', color: 'white' }}
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => formik.resetForm()}
              disabled={formik.isSubmitting}
            >
              Clear
            </Button>

            <Button size="small" variant="outlined" color="error" onClick={() => onClose?.()} disabled={formik.isSubmitting}>
              Cancel
            </Button>
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default AddSupplierPfForm;
