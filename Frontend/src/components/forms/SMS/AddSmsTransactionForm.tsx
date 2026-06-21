import { Button, Grid, MenuItem, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFormik } from 'formik';

import { IoSendSharp } from 'react-icons/io5';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import dayjs from 'dayjs';
import useAuth from 'hooks/useAuth';

interface AddSmsTransactionFormProps {
  onClose: (refetch?: boolean) => void;
  isEditMode: boolean;
  existingData: any;
  masterData: any;
}

const AddSmsTransactionForm = ({ onClose, isEditMode, existingData, masterData }: AddSmsTransactionFormProps) => {
  const { user } = useAuth();

  const formik = useFormik({
    initialValues: {
      sales_name: user?.loginid || '',
      company_name: '',
      service_offered: '',
      segment: '',
      contact_name: '',
      contact_number: '',
      deal_desc: '',
      deal_ref: '',
      deal_date: dayjs(),
      deal_size: '',
      deal_probability: '',
      deal_status: '',
      weighted_forecast: '',
      lost_reason: '',
      status_update: '',
      project_closing_date: dayjs(),
      next_action: '',
      note: '',
      ...(isEditMode ? existingData : {})
    },
    validationSchema: yup.object().shape({
      company_name: yup.string().required('Company Name is required'),
      service_offered: yup.string().required('Service Offered is required'),
      segment: yup.string().required('Segment is required'),
      contact_name: yup.string().required('Contact Name is required'),
      deal_date: yup.string().required('Deal Date is required'),
      deal_status: yup.string().required('Deal Status is required'),
      deal_probability: yup.string().required('Deal Probability is required')
      // Add other validations as needed
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          deal_date: values.deal_date ? dayjs(values.deal_date).format('YYYY-MM-DD') : null,
          project_closing_date: values.project_closing_date ? dayjs(values.project_closing_date).format('YYYY-MM-DD') : null
        };
        const response = await (isEditMode
          ? SmscompanyServiceInstance.batchUpdateSalesRequest(payload)
          : SmscompanyServiceInstance.batchCreateSalesRequest([payload]));

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Transaction updated successfully!' : 'Transaction added successfully!',
              severity: 'success'
            })
          );
          onClose(true);
        }
      } catch (error) {
        dispatch(
          showAlert({
            open: true,
            message: 'Operation failed',
            severity: 'error'
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleDealStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.value;
    formik.setFieldValue('deal_status', newStatus);
    if (newStatus !== 'Lost') {
      formik.setFieldValue('lost_reason', '');
    }
  };

  const handleDateChange = (field: string) => (date: dayjs.Dayjs | null) => {
    console.log('datePicker', date);
    console.log('formik date:', date ? dayjs(date).format('DD/MM/YYYY') : '');
    //formik.setFieldValue(field, date ? date.format('DD/MM/YYYY') : '');
    formik.setFieldValue(field, date);
  };
  const getDayjsValue = (val: any) => {
    if (!val) return null;
    // if already a dayjs object, just return it
    if (dayjs.isDayjs(val)) return val;
    // otherwise, parse from string and add multiple formats
    const parsed = dayjs(val, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
    return parsed.isValid() ? parsed : null;
  };

  const getErrorMessage = (fieldName: string): string => {
    return formik.touched[fieldName] && formik.errors[fieldName] ? String(formik.errors[fieldName]) : '';
  };

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <TextField fullWidth label="Salesman Name" name="sales_name" value={formik.values.sales_name} disabled />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Company Name*"
          name="company_name"
          value={formik.values.company_name}
          onChange={formik.handleChange}
          error={formik.touched.company_name && Boolean(formik.errors.company_name)}
          helperText={getErrorMessage('company_name')}
        >
          {masterData?.companies
            ?.sort((a: any, b: any) => a.company_name.localeCompare(b.company_name))
            .map((c: any) => (
              <MenuItem key={c.company_name} value={c.company_name}>
                {c.company_name}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Service Offered*"
          name="service_offered"
          value={formik.values.service_offered}
          onChange={formik.handleChange}
          error={formik.touched.service_offered && Boolean(formik.errors.service_offered)}
          helperText={getErrorMessage('service_offered')}
        >
          {masterData?.services
            ?.sort((a: any, b: any) => a.service_name.localeCompare(b.service_name))
            .map((s: any) => (
              <MenuItem key={s.service_name} value={s.service_name}>
                {s.service_name}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Segment*"
          name="segment"
          value={formik.values.segment}
          onChange={formik.handleChange}
          error={formik.touched.segment && Boolean(formik.errors.segment)}
          helperText={getErrorMessage('segment')}
        >
          {masterData?.segments
            ?.sort((a: any, b: any) => a.segment_name.localeCompare(b.segment_name))
            .map((seg: any) => (
              <MenuItem key={seg.segment_name} value={seg.segment_name}>
                {seg.segment_name}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Name*"
          name="contact_name"
          value={formik.values.contact_name}
          onChange={formik.handleChange}
          error={formik.touched.contact_name && Boolean(formik.errors.contact_name)}
          helperText={getErrorMessage('contact_name')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Number*"
          name="contact_number"
          value={formik.values.contact_number}
          onChange={formik.handleChange}
          error={formik.touched.contact_number && Boolean(formik.errors.contact_number)}
          helperText={getErrorMessage('contact_number')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Deal Date*"
            value={getDayjsValue(formik.values.deal_date)}
            onChange={handleDateChange('deal_date')}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.deal_date && Boolean(formik.errors.deal_date),
                helperText: getErrorMessage('deal_date')
              }
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Deal Description" name="deal_desc" value={formik.values.deal_desc} onChange={formik.handleChange} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Deal Reference" name="deal_ref" value={formik.values.deal_ref} onChange={formik.handleChange} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Deal Size" name="deal_size" value={formik.values.deal_size} onChange={formik.handleChange} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Deal Probability"
          name="deal_probability"
          value={formik.values.deal_probability}
          onChange={formik.handleChange}
          error={formik.touched.deal_probability && Boolean(formik.errors.deal_probability)}
          helperText={getErrorMessage('deal_probability')}
        >
          {masterData?.probabilities
            ?.sort((a: any, b: any) => a.deal_probability.localeCompare(b.deal_probability))
            .map((p: any) => (
              <MenuItem key={p.deal_probability} value={p.deal_probability}>
                {p.deal_probability}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Deal Status*"
          name="deal_status"
          value={formik.values.deal_status}
          onChange={handleDealStatusChange}
          error={formik.touched.deal_status && Boolean(formik.errors.deal_status)}
          helperText={getErrorMessage('deal_status')}
        >
          {masterData?.deals
            ?.sort((a: any, b: any) => a.deal_status.localeCompare(b.deal_status))
            .map((d: any) => (
              <MenuItem key={d.deal_status} value={d.deal_status}>
                {d.deal_status}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      {formik.values.deal_status === 'Lost' && (
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Lost Reason"
            name="lost_reason"
            value={formik.values.lost_reason}
            onChange={formik.handleChange}
          >
            {masterData?.reasons?.map((r: any) => (
              <MenuItem key={r.lost_reason} value={r.lost_reason}>
                {r.lost_reason}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Status Update"
          name="status_update"
          value={formik.values.status_update}
          onChange={formik.handleChange}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Project Closing Date"
            value={getDayjsValue(formik.values.project_closing_date)}
            onChange={handleDateChange('project_closing_date')}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true
              }
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Next Action" name="next_action" value={formik.values.next_action} onChange={formik.handleChange} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Note" name="note" value={formik.values.note} onChange={formik.handleChange} />
      </Grid>

      {/* Add buttons */}
      <Grid item xs={12} className="flex justify-start space-x-2">
        <Button variant="outlined" color="primary" endIcon={<IoSendSharp />} type="submit" disabled={formik.isSubmitting}>
          {isEditMode ? 'Update' : 'Submit'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => onClose(false)}>
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddSmsTransactionForm;
