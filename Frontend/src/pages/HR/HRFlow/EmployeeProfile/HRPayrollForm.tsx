import React, { useEffect, useState } from 'react';
import { Grid, InputLabel, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { FormattedMessage } from 'react-intl';
import dayjs from 'dayjs';

interface HRPayrollFormProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

interface PayrollFormData {
  INCLUDE_IN_PAYROLL: string;
  CMP_PAYROLL_DAY: Date | null;
  PAYMENT_MODE: string;
  COMPANY_BANK_CODE: string;
  MAIN_BANK: string;
  SALARY_ACCT_NO: string;
  SALARY_BANK_CODE: string;
  CURRENCY_ID: string;
  EXCH_RATE: number | '';
  IBAN_NO: string;
  CURR_CODE: string;
  EX_RATE: string;
}

export const HRPayrollForm: React.FC<HRPayrollFormProps> = ({ initialData, isEditMode, employeeData }) => {
  const [formData, setFormData] = useState<PayrollFormData>({
    INCLUDE_IN_PAYROLL: '',
    CMP_PAYROLL_DAY: new Date(),
    PAYMENT_MODE: '',
    MAIN_BANK: '',
    SALARY_ACCT_NO: '',
    COMPANY_BANK_CODE: '',
    SALARY_BANK_CODE: '',
    CURRENCY_ID: '',
    EXCH_RATE: '',
    IBAN_NO: '',
    CURR_CODE: '',
    EX_RATE: ''
  });

  useEffect(() => {
    if (employeeData) {
      setFormData((prev) => ({
        ...prev,
        INCLUDE_IN_PAYROLL: employeeData.INCLUDE_IN_PAYROLL ?? '',
        CMP_PAYROLL_DAY_: employeeData.CMP_PAYROLL_DAY ? new Date(employeeData.CMP_PAYROLL_DAY) : null,
        PAYMENT_MODE: employeeData.PAYMENT_MODE ?? '',
        COMPANY_BANK_CODE: employeeData.COMPANY_BANK_CODE ?? '',
        MAIN_BANK: employeeData.MAIN_BANK ?? '',
        SALARY_ACCT_NO: employeeData.SALARY_ACCT_NO ?? '',
        IBAN_NO: employeeData.IBAN_NO ?? '',
        SALARY_BANK_CODE: employeeData.SALARY_BANK_CODE,
        CURR_CODE: employeeData.CURR_CODE,
        EX_RATE: employeeData.EX_RATE
      }));
    }
  }, [employeeData]);
  console.log('Payroll formData:', formData);

  const handleChange = (field: keyof PayrollFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'EXCH_RATE' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Grid container component={'form'} spacing={1}>
      <Grid item container xs={12} sm={6} rowGap={1} columnSpacing={1}>
        <Grid item container xs={12} spacing={1}>
          {/* Include In Payment */}
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Include In Payment" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <TextField
              id="employeeDivision"
              size="small"
              fullWidth
              name="INCLUDE_IN_PAYROLL"
              value={formData.INCLUDE_IN_PAYROLL}
              onChange={handleChange('INCLUDE_IN_PAYROLL')}
            />
          </Grid>
          {/* Payroll Start Date */}
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Payroll Start Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formData.CMP_PAYROLL_DAY ? dayjs(formData.CMP_PAYROLL_DAY) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="CMP_PAYROLL_DAY"
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    CMP_PAYROLL_DAY: newValue ? new Date(newValue.toString()) : null
                  }));
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Grid item container xs={12} spacing={1}>
          {/* Mode Of Payment */}
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Mode Of Payment" />
            </InputLabel>
            <TextField
              size="small"
              fullWidth
              id="PAYMENT_MODE"
              value={formData.PAYMENT_MODE}
              name="PAYMENT_MODE"
              onChange={handleChange('PAYMENT_MODE')}
              disabled={!isEditMode}
            />
          </Grid>
          {/* Paying Bank */}
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Paying Bank" />
            </InputLabel>
            <TextField
              size="small"
              fullWidth
              id="  COMPANY_BANK_CODE"
              value={formData.COMPANY_BANK_CODE}
              name="  COMPANY_BANK_CODE"
              onChange={handleChange('COMPANY_BANK_CODE')}
              disabled={!isEditMode}
            />
          </Grid>
        </Grid>
        {/* Bank Account No. */}
        <Grid item xs={12}>
          <InputLabel sx={{ mb: 0.5 }}>
            <FormattedMessage id="Bank Account No." />
          </InputLabel>
          <TextField
            type="text"
            size="small"
            name="SALARY_ACCT_NO"
            value={formData.SALARY_ACCT_NO}
            fullWidth
            onChange={handleChange('SALARY_ACCT_NO')}
          />
        </Grid>
        {/* Bank IBAN No. */}
        <Grid item xs={12}>
          <InputLabel sx={{ mb: 0.5 }}>
            <FormattedMessage id="Bank IBAN No." />
          </InputLabel>
          <TextField type="text" size="small" name="IBAN_NO" value={formData.IBAN_NO} fullWidth onChange={handleChange('IBAN_NO')} />
        </Grid>
        {/* Employee Bank */}
        <Grid item xs={12}>
          <InputLabel sx={{ mb: 0.5 }}>
            <FormattedMessage id="Employee Bank" />
          </InputLabel>
          <TextField
            size="small"
            fullWidth
            id="MAIN_BANK"
            value={formData.MAIN_BANK}
            name="SALARY_BANK_CODE"
            onChange={handleChange('MAIN_BANK')}
            disabled={!isEditMode}
          />
        </Grid>
        {/* Salary A/C Ref. */}
        <Grid item xs={12}>
          <InputLabel sx={{ mb: 0.5 }}>
            <FormattedMessage id="Salary A/C Ref." />
          </InputLabel>
          <TextField size="small" value={formData.SALARY_BANK_CODE} name="SALARY_BANK_CODE" disabled fullWidth />
        </Grid>
        <Grid item container xs={12} spacing={1}>
          {/* Currency */}
          <Grid item xs={7}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Currency" />
            </InputLabel>
            <TextField size="small" value={formData.CURR_CODE} name="CURR_CODE" disabled fullWidth />
          </Grid>
          {/* Exch Rate */}
          <Grid item xs={5}>
            <InputLabel sx={{ mb: 0.5 }}>
              <FormattedMessage id="Exch. Rate" />
            </InputLabel>
            <TextField
              type="number"
              inputProps={{ min: 0, style: { textAlign: 'right' } }}
              value={formData.EX_RATE}
              size="small"
              name="EX_RATE"
              fullWidth
              onChange={handleChange('EX_RATE')}
              disabled
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
