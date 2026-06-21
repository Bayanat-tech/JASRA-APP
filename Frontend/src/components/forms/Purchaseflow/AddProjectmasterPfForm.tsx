import { Autocomplete, Button, ButtonGroup, FormHelperText, Grid, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';

import useAuth from 'hooks/useAuth';

import { TProjectmaster } from 'pages/Purchasefolder/type/projectmaster-pf-types';
import { TDivisionmaster } from 'pages/Purchasefolder/type/division-pf-types';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import PfSerivceInstance from 'service/service.purhaseflow';
// import * as yup from 'yup';
import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'store';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomAlert from 'components/@extended/CustomAlert';
import { showAlert } from 'store/CustomAlert/alertSlice';

const AddProjectmasterPfForm = ({
  onClose,
  isEditMode,
  existingData,
  isViewMode
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TProjectmaster;
  isViewMode?: boolean;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { data: divisionList = [] } = useQuery({
    queryKey: ['division_data'],
    queryFn: async () => {
      try {
        const response: any = await PfSerivceInstance.getMasters(app, 'division', undefined, undefined);
        if (response) {
          if (Array.isArray(response)) {
            return response as TDivisionmaster[];
          } else if (response.data && Array.isArray(response.data)) {
            return response.data as TDivisionmaster[];
          } else if (response.tableData && Array.isArray(response.tableData)) {
            return response.tableData as TDivisionmaster[];
          } else if (response.success && response.data && Array.isArray(response.data)) {
            return response.data as TDivisionmaster[];
          }
        }
      } catch (error) {
        // Handle error case
        console.error('Failed to fetch division data', error);
        return [] as TDivisionmaster[];
      }
    }
  });

  //------------------formik-----------------
  const dispatch = useDispatch();
  const handleAlert = async () => {
    let popupMessage: string | null = null;
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success';

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user.loginid, user.company_code);
      console.log('messagebox', messageBoxData);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        popupMessage = box.MESSAGE_BOX ?? 'Records saved successfully!';
        severity = (box.MESSAGE_TYPE?.toLowerCase() as typeof severity) ?? 'success';
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }
      console.log('popupMessage', popupMessage);
      console.log('severity', severity);

      dispatch(
        showAlert({
          severity,
          message: popupMessage ?? '',
          open: true
        })
      );
      return severity;
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: false
        })
      );
    }
  };
  const formik = useFormik<TProjectmaster>({
    initialValues: {
      project_code: existingData.project_code || '',
      project_name: existingData.project_name || '',
      company_code: user?.company_code,
      div_code: existingData.div_code || '',
      facility_mgr_name: existingData.facility_mgr_name || '',
      facility_mgr_email: existingData.facility_mgr_email || '',
      facility_mgr_phone: existingData.facility_mgr_phone || '',
      store_name: existingData.store_name || 'P',
      contact_person: existingData.contact_person || '',
      contact_number: existingData.contact_number || '',
      total_project_cost: existingData.total_project_cost || 0,
      project_date_from: existingData.project_date_from,
      project_date_to: existingData.project_date_to,
      updated_by: user?.updated_by
    },
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        let response;
        console.log('project master form', isEditMode);
        if (isEditMode) {
          response = await GmPfServiceInstance.editProjectmaster(values);
        } else {
          response = await GmPfServiceInstance.addProjectmaster(values);
        }
        const returnValue = await handleAlert();
        console.log('inside handleConfirm3');

        if (returnValue === 'success') {
          onClose();
        }

        if (response) {
          dispatch(
            showAlert({
              severity: 'success',
              message: isEditMode ? 'Project updated successfully!' : 'Project added successfully!',
              open: true
            })
          );
          onClose(true);
        }
      } catch (error: any) {
        dispatch(
          showAlert({
            severity: 'error',
            message: error?.message || 'An unexpected error occurred.',
            open: true
          })
        );
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Find the selected division object
  const selectedDivision = divisionList.find((division) => division.div_code === formik.values.div_code);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit} sx={{ mt: '2px' }}>
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Project Code*"
            value={formik.values.project_code}
            name="project_code"
            disabled={isEditMode === true}
            onChange={formik.handleChange}
            error={Boolean(getIn(formik.touched, 'project_code') && getIn(formik.errors, 'project_code'))}
            fullWidth
          />
          {getIn(formik.touched, 'project_code') && getIn(formik.errors, 'project_code') && (
            <FormHelperText error>{getIn(formik.errors, 'project_code')}</FormHelperText>
          )}
        </Grid>

        <Grid item xs={12} sm={4}>
          <Autocomplete
            id="div_code"
            value={selectedDivision || null}
            onChange={(event, value: TDivisionmaster | null) => {
              formik.setFieldValue('div_code', value?.div_code || '');
            }}
            options={divisionList}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.div_name || ''}
            isOptionEqualToValue={(option, value) => option.div_code === value.div_code}
            renderInput={(params) => (
              <TextField
                label="Division*"
                {...params}
                inputProps={{
                  ...params.inputProps,
                  readOnly: isViewMode
                }}
                error={formik.touched.div_code && Boolean(formik.errors.div_code)}
                helperText={formik.touched.div_code && formik.errors.div_code}
              />
            )}
            disabled={isViewMode}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Contact Number"
            name="contact_number"
            value={formik.values.contact_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            InputProps={{
              readOnly: isViewMode
            }}
            fullWidth
          />
          {formik.touched.contact_number && formik.errors.contact_number && (
            <FormHelperText error>{formik.errors.contact_number}</FormHelperText>
          )}
        </Grid>
      </Grid>

      {/* **************** Second Row **************** */}
      <Grid container sx={{ mb: '20px' }}>
        <TextField
          InputProps={{ readOnly: isViewMode }}
          label="Project Description*"
          value={formik.values.project_name}
          name="project_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'project_name') && getIn(formik.errors, 'project_name'))}
        />
        {getIn(formik.touched, 'project_name') && getIn(formik.errors, 'project_name') && (
          <FormHelperText error>{getIn(formik.errors, 'project_name')}</FormHelperText>
        )}
      </Grid>

      {/* **************** Third Row **************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={'Project Date From*'}
              format="DD/MM/YYYY"
              className="w-full"
              value={formik.values.project_date_from ? dayjs(formik.values.project_date_from) : null}
              onChange={(newValue: Dayjs | null) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('project_date_from', newValue.toISOString());
                }
              }}
              slotProps={{
                textField: {
                  inputProps: { readOnly: isViewMode },
                  error: Boolean(formik.touched.project_date_from && formik.errors.project_date_from),
                  helperText: formik.touched.project_date_from && formik.errors.project_date_from
                },
                ...(isViewMode && {
                  openPickerButton: { sx: { display: 'none' } }
                })
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={'Project Date To*'}
              format="DD/MM/YYYY"
              className="w-full"
              value={formik.values.project_date_to ? dayjs(formik.values.project_date_to) : null}
              onChange={(newValue: Dayjs | null) => {
                if (newValue?.isValid()) {
                  formik.setFieldValue('project_date_to', newValue.toISOString());
                } else {
                  formik.setFieldError('project_date_to', 'Invalid date');
                }
              }}
              slots={isViewMode ? {} : undefined}
              slotProps={{
                textField: {
                  inputProps: { readOnly: isViewMode },
                  error: formik.touched.project_date_to && Boolean(formik.errors.project_date_to),
                  helperText: formik.touched.project_date_to && formik.errors.project_date_to
                },
                ...(isViewMode && {
                  openPickerButton: { sx: { display: 'none' } }
                })
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Total Project Cost*'}
            fullWidth
            name="total_project_cost"
            type="number"
            value={formik.values.total_project_cost}
            onChange={(event) => formik.setFieldValue('total_project_cost', event.target.value)}
            onBlur={formik.handleBlur}
            inputProps={{
              step: '0.01',
              min: 0,
              max: 99999999.99,
              style: { textAlign: 'right' }
            }}
            error={formik.touched.total_project_cost && Boolean(formik.errors.total_project_cost)}
            helperText={formik.touched.total_project_cost && formik.errors.total_project_cost}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Store Name*"
            fullWidth
            name="store_name"
            value={formik.values.store_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ maxLength: 100 }}
            error={formik.touched.store_name && Boolean(formik.errors.store_name)}
            helperText={formik.touched.store_name && formik.errors.store_name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Contact Person*"
            fullWidth
            name="contact_person"
            value={formik.values.contact_person}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ maxLength: 100 }}
            error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
            helperText={formik.touched.contact_person && formik.errors.contact_person}
          />
        </Grid>
      </Grid>

      {/* **************** Fourth Row **************** */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Facility Manager Name*"
            fullWidth
            name="facility_mgr_name"
            value={formik.values.facility_mgr_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ maxLength: 100 }}
            error={formik.touched.facility_mgr_name && Boolean(formik.errors.facility_mgr_name)}
            helperText={formik.touched.facility_mgr_name && formik.errors.facility_mgr_name}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Facility Manager Email*"
            fullWidth
            name="facility_mgr_email"
            type="email"
            value={formik.values.facility_mgr_email}
            onChange={formik.handleChange}
            error={formik.touched.facility_mgr_email && Boolean(formik.errors.facility_mgr_email)}
            helperText={formik.touched.facility_mgr_email && formik.errors.facility_mgr_email}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label="Facility Manager Phone*"
            fullWidth
            name="facility_mgr_phone"
            type="tel"
            value={formik.values.facility_mgr_phone}
            onChange={formik.handleChange}
            error={formik.touched.facility_mgr_phone && Boolean(formik.errors.facility_mgr_phone)}
            helperText={formik.touched.facility_mgr_phone && formik.errors.facility_mgr_phone}
          />
        </Grid>
      </Grid>

      {/* **************** Submit Button **************** */}
      <Grid item xs={12} className="flex justify-start">
        {!isViewMode && (
          <ButtonGroup>
            <Button
              sx={{ backgroundColor: '#082a89', color: 'white' }}
              type="submit"
              size="small"
              variant="outlined"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
            >
              Submit
            </Button>
          </ButtonGroup>
        )}
      </Grid>
    </Grid>
  );
};
export default AddProjectmasterPfForm;