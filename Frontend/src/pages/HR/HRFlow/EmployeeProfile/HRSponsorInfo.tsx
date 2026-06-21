import { Grid, InputLabel, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormattedMessage } from 'react-intl';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import dayjs from 'dayjs';

interface HRSponsorInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

export const HRSponsorInfo: React.FC<HRSponsorInfoProps> = ({ employeeData, isEditMode }) => {
  return (
    <Grid container xs={12} component={'form'}>
      <Grid item container xs={12} sm={6} rowGap={2}>
        {/* ------------Sponsor Name------------ */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Sponsor Name" />
          </InputLabel>
          <TextField size="small" fullWidth disabled={!isEditMode} name="sponsor_id" value={employeeData?.SPONSOR_NAME || ''} />
        </Grid>

        {/* ------------Visa Type----------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Visa Type" />
          </InputLabel>

          <TextField size="small" fullWidth disabled={!isEditMode} name="sponsor_id" value={employeeData?.SPONSOR_VISA_TYPE || ''} />
        </Grid>

        {/* ------------Valid From and Valid To ----------------- */}
        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
              {/* <span className="text-red-500">*</span> */}
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                disabled={!isEditMode}
                value={employeeData?.SPONSOR_VISA_FROM_DT ? dayjs(employeeData.SPONSOR_VISA_FROM_DT) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="visa_valid_from"
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid To" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                disabled={!isEditMode}
                value={employeeData?.SPONSOR_VISA_TO_DT ? dayjs(employeeData.SPONSOR_VISA_TO_DT) : null} // for later use
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="visa_valid_to"
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
