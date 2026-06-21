// components/dialogs/OrderEntryFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { Formik, Form, useFormikContext, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Autocomplete, TextField, Button } from '@mui/material';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import { DialogPop } from 'components/popup/DIalogPop';
import { IToOrderEntry } from './types/jobOutbound_wms.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import WmsSerivceInstance from 'service/service.wms';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

interface OrderEntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData: IToOrderEntry | null;
  rowData: any;
  onSuccess: (formData: IToOrderEntry) => Promise<void>;
  isSubmitting?: boolean;
}

// Form content component
const OrderEntryFormContent: React.FC<{
  onCancel: () => void;
  customerOptions: any[];
  currencyOptions?: TCurrency[];
  isEditing: boolean;
}> = ({ onCancel, customerOptions, currencyOptions, isEditing }) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = useFormikContext<IToOrderEntry>();

  return (
    <Form>
      {/* Order Information Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-800 pb-3">Order Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Details Column */}
          <div className="space-y-4">
            <Autocomplete
              options={customerOptions}
              getOptionLabel={(option) => `${option.cust_code} - ${option.cust_name}`}
              value={customerOptions.find((option) => option.cust_code === values.cust_code) || null}
              onChange={(_, newValue) => {
                setFieldValue('cust_code', newValue?.cust_code || '');
                setFieldValue('cust_name', newValue?.cust_name || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Code"
                  variant="outlined"
                  fullWidth
                  size="small"
                  error={touched.cust_code && Boolean(errors.cust_code)}
                  helperText={touched.cust_code && errors.cust_code}
                />
              )}
            />

            <Field
              as={TextField}
              label="Order Number"
              name="order_no"
              fullWidth
              size="small"
              error={touched.order_no && Boolean(errors.order_no)}
              helperText={touched.order_no && errors.order_no}
            />
          </div>

          {/* Date Column */}
          <div className="space-y-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Order Date"
                value={dayjs(values.order_date)}
                onChange={(newValue) => {
                  const newDate = newValue?.toDate();
                  setFieldValue('order_date', newDate);
                  setFieldValue('order_due_date', newDate);
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: touched.order_date && Boolean(errors.order_date),
                    helperText: touched.order_date && errors.order_date
                  }
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Order Due Date"
                value={dayjs(values.order_due_date)}
                onChange={(newValue) => setFieldValue('order_due_date', newValue?.toDate())}
                minDate={dayjs(values.order_date)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: touched.order_due_date && Boolean(errors.order_due_date),
                    helperText: touched.order_due_date && errors.order_due_date
                  }
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Currency Column */}
          <div className="space-y-4">
            <Autocomplete
              options={currencyOptions || []}
              getOptionLabel={(option) => `${option.curr_code} - ${option.curr_name}`}
              value={currencyOptions?.find((option) => option.curr_code === values.curr_code) || null}
              onChange={(_, newValue) => {
                setFieldValue('curr_code', newValue?.curr_code || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Currency"
                  variant="outlined"
                  fullWidth
                  size="small"
                  error={touched.curr_code && Boolean(errors.curr_code)}
                  helperText={touched.curr_code && errors.curr_code}
                />
              )}
            />

            <Field
              as={TextField}
              label="Exchange Rate"
              name="ex_rate"
              type="number"
              fullWidth
              size="small"
              inputProps={{
                style: { textAlign: 'right' }
              }}
              error={touched.ex_rate && Boolean(errors.ex_rate)}
              helperText={touched.ex_rate && errors.ex_rate}
            />
          </div>
        </div>

        {/* Customer Reference & Timing */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-800 pb-3">Timing & Reference</h2>
          <div className="space-y-4">
            <Field as={TextField} label="Customer Reference" name="cust_reference" fullWidth size="small" />

            <div className="grid grid-cols-4 gap-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Field name="pack_start">
                  {({ field, form }: FieldProps) => {
                    console.log('Pack Start Value:', field.value);
                    const safeValue = field.value ? dayjs(field.value) : null;
                    return (
                      <DateTimePicker
                        label="Pack Start"
                        value={safeValue}
                        onChange={(newValue) => {
                          // Convert newValue (Dayjs object or null) to JavaScript Date
                          const newDate = newValue?.toDate() ?? null;
                          // Update both fields in Formik form state
                          form.setFieldValue('pack_start', newDate);
                          form.setFieldValue('pack_end', newDate);
                        }}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' }
                        }}
                        format="DD/MM/YYYY hh:mm A"
                      />
                    );
                  }}
                </Field>
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Field name="pack_end">
                  {({ field, form }: FieldProps) => {
                    const safeValue: Dayjs | undefined = field.value ? dayjs(field.value) : undefined;

                    const packStart: Dayjs | undefined = values.pack_start ? dayjs(values.pack_start) : undefined;

                    // Determine minTime only if packStart and selected day are the same
                    const minTime = safeValue && packStart && safeValue.isSame(packStart, 'day') ? packStart : dayjs().startOf('day');

                    return (
                      <DateTimePicker
                        label="Pack End"
                        value={safeValue}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        minDate={packStart} // disables dates before pack_start date
                        minTime={minTime} // disables times earlier than pack_start time only on that day
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' }
                        }}
                        format="DD/MM/YYYY hh:mm A"
                      />
                    );
                  }}
                </Field>
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Field name="load_start">
                  {({ field, form }: FieldProps) => {
                    const safeValue = field.value ? dayjs(field.value) : null;
                    return (
                      <DateTimePicker
                        label="Load Start"
                        value={safeValue}
                        onChange={(newValue) => {
                          // Convert newValue (Dayjs object or null) to JavaScript Date
                          const newDate = newValue?.toDate() ?? null;
                          // Update both fields in Formik form state
                          form.setFieldValue('load_start', newDate);
                          form.setFieldValue('load_end', newDate);
                        }}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' }
                        }}
                        format="DD/MM/YYYY hh:mm A"
                      />
                    );
                  }}
                </Field>
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Field name="load_end">
                  {({ field, form }: FieldProps) => {
                    const safeValue: Dayjs | undefined = field.value ? dayjs(field.value) : undefined;

                    const load_start: Dayjs | undefined = values.pack_start ? dayjs(values.load_start) : undefined;

                    // Determine minTime only if packStart and selected day are the same
                    const minTime = safeValue && load_start && safeValue.isSame(load_start, 'day') ? load_start : dayjs().startOf('day');

                    return (
                      <DateTimePicker
                        label="Load End"
                        value={safeValue}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        minDate={load_start} // disables dates before pack_start date
                        minTime={minTime} // disables times earlier than pack_start time only on that day
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' }
                        }}
                        format="DD/MM/YYYY hh:mm A"
                      />
                    );
                  }}
                </Field>
              </LocalizationProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* UOC/Measurement Section */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 pb-3">UOC/Measurement</h2>
          <div className="space-y-4">
            <Field as={TextField} label="UOC" name="uoc" fullWidth size="small" />

            <div className="grid grid-cols-2 gap-4">
              <Field
                as={TextField}
                label="MOC1"
                name="moc1"
                type="number"
                fullWidth
                size="small"
                inputProps={{
                  style: { textAlign: 'right' }
                }}
              />
              <Field
                as={TextField}
                label="MOC2"
                name="moc2"
                type="number"
                fullWidth
                size="small"
                inputProps={{
                  style: { textAlign: 'right' }
                }}
              />
            </div>
          </div>
        </div>

        {/* Export Container Details */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 pb-3">Export Container Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field as={TextField} label="Container Number" name="exp_container_no" fullWidth size="small" />
              <Field as={TextField} label="Container Type" name="exp_container_type" fullWidth size="small" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field as={TextField} label="Container Size" name="exp_container_size" fullWidth size="small" />
              <Field as={TextField} label="Seal Number" name="exp_container_sealno" fullWidth size="small" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-2 space-x-2">
        {/* <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button> */}
        <Button
          variant="contained"
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
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </div>
    </Form>
  );
};

// Validation Schema
const orderEntryValidationSchema = Yup.object().shape({
  cust_code: Yup.string().required('Customer code is required'),
  order_no: Yup.string().required('Order number is required'),
  // order_date: Yup.date().required('Order date is required'),
  // order_due_date: Yup.date().required('Order due date is required').min(Yup.ref('order_date'), 'Due date cannot be before order date'),
  curr_code: Yup.string().required('Currency is required')
  // ex_rate: Yup.number().required('Exchange rate is required').positive('Exchange rate must be positive'),
  // exp_container_no: Yup.string().required('Container number is required'),
  // exp_container_sealno: Yup.string().required('Seal number is required')
});

const OrderEntryFormDialog: React.FC<OrderEntryFormDialogProps> = ({
  open,
  onClose,
  mode,
  initialData,
  rowData,
  onSuccess,
  isSubmitting = false
}) => {
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  // Default values
  const defaultOrderValues: IToOrderEntry = React.useMemo(
    () => ({
      id: 0,
      company_code: rowData?.company_code || '',
      prin_code: rowData?.prin_code || '',
      job_no: rowData?.job_no || '',
      cust_code: '',
      cust_name: '',
      order_no: '',
      order_date: new Date(),
      order_due_date: new Date(),
      curr_code: 'QAR',
      ex_rate: 1.0,
      uoc: 'EA',
      moc1: '0',
      moc2: '0',
      exp_container_no: '',
      exp_container_size: null,
      exp_container_type: 'DRY',
      exp_container_sealno: '',
      cust_reference: '',
      pack_start: null,
      pack_end: null,
      load_start: null,
      load_end: null,
      po_no: null,
      po_date: null,
      act_code: null,
      volume: null,
      net_weight: null,
      assigned_pda_user: null,
      order_serial: null,
      ref_txn_code: null,
      ref_txn_docno: null,
      ref_txn_slno: null,
      so_txn_code: null,
      delivery_term: null,
      salesman_code: null,
      recollected_flag: '',
      recollected_dt: null,
      recollected_remarks: null,
      stuff_start: null,
      stuff_end: null,
      pick_start: null,
      pick_end: null,
      allow_doc_gen: null,
      pre_so: null,
      assigned_pack_user: null,
      order_location: null,
      route_code: null,
      manifest_no: null,
      vehicle_no: null,
      order_load_seq_nr: null
    }),
    [rowData]
  );

  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const { data: currencyOptions } = useQuery({
    queryKey: ['currency_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'currency', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TCurrency[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  // Fetch customer options when dialog opens
  useEffect(() => {
    const fetchCustomerOptions = async () => {
      if (open) {
        console.log('rowData', rowData);
        try {
          let companyCode, prinCode;

          if (mode === 'edit' && initialData) {
            companyCode = initialData.company_code;
            prinCode = initialData.prin_code;
          } else if (rowData) {
            companyCode = rowData.company_code;
            prinCode = rowData.prin_code;
          }

          if (companyCode && prinCode) {
            console.log('calling getddPrinceCustomer');
            const cust_sql = `

      SELECT *
FROM MS_CUSTOMER
WHERE COMPANY_CODE = '${companyCode}' AND PRIN_CODE = '${prinCode}'
      `;
            // const response = await OutboundJobServiceInstance.getddPrinceCustomer(companyCode, prinCode);
            const response = await WmsSerivceInstance.executeRawSql(cust_sql);
            console.log('customer response', response);

            // Convert all object keys to lowercase
            const lowerCaseResponse = Array.isArray(response)
              ? response.map((item) => Object.fromEntries(Object.entries(item || {}).map(([key, value]) => [key.toLowerCase(), value])))
              : [];
            setCustomerOptions(lowerCaseResponse || []);
          } else {
            setCustomerOptions([]);
          }
        } catch (error) {
          console.error('Failed to fetch customer options:', error);
          setCustomerOptions([]);
        }
      }
    };

    fetchCustomerOptions();
  }, [open, mode, initialData, rowData]);

  // Get initial values based on mode
  const getInitialValues = (): IToOrderEntry => {
    if (mode === 'edit' && initialData) {
      return {
        ...defaultOrderValues,
        ...initialData,
        order_date: initialData.order_date ? new Date(initialData.order_date) : new Date(),
        order_due_date: initialData.order_due_date ? new Date(initialData.order_due_date) : new Date()
      };
    }
    return defaultOrderValues;
  };

  const handleSubmit = async (values: IToOrderEntry, { setSubmitting }: any) => {
    try {
      await onSuccess(values);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogPop
      disableScrollLock={true}
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create Order Entry' : 'Edit Order Entry'}
      width={800}
    >
      <Formik initialValues={getInitialValues()} validationSchema={orderEntryValidationSchema} onSubmit={handleSubmit} enableReinitialize>
        <OrderEntryFormContent
          onCancel={onClose}
          customerOptions={customerOptions}
          currencyOptions={currencyOptions?.tableData || []}
          isEditing={mode === 'edit'}
        />
      </Formik>
    </DialogPop>
  );
};

export default OrderEntryFormDialog;
