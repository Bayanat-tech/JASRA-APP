import { Grid, InputLabel, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import dayjs from 'dayjs';

interface HRInsuranceInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

export const HRInsuranceInfo: React.FC<HRInsuranceInfoProps> = ({ employeeData, isEditMode }) => {
  return (
    <Grid container xs={12} component={'form'}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid container item xs={12} spacing={{ sm: 6, xs: 2 }}>
          {/* ------------Card No.------------ */}
          <Grid item xs={12} sm={8}>
            <InputLabel>
              <FormattedMessage id="Card No." />
            </InputLabel>
            <TextField size="small" name="ins_card_no" value={employeeData?.INS_CARD_NO || ''} fullWidth disabled={!isEditMode} />
          </Grid>

          {/* -------------Type---------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Type" />
            </InputLabel>
            <TextField
              size="small"
              name="ins_card_type"
              value={employeeData?.INS_CARD_TYPE || ''} // set later
              fullWidth
              disabled={!isEditMode}
            />
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* --------------Valid From--------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={employeeData?.INS_CARD_ISSUE_DT ? dayjs(employeeData.INS_CARD_ISSUE_DT) : null} // set later
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="ins_card_issue_dt"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>

          {/* -------------Valid To------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid To" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={employeeData?.INS_CARD_EXP_DT ? dayjs(employeeData.INS_CARD_EXP_DT) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="ins_card_exp_dt"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
