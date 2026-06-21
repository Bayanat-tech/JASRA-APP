import { Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';

interface HRAirfareInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

export const HRAirfareInfo: React.FC<HRAirfareInfoProps> = ({ isEditMode /*, employeeData */ }) => {
  return (
    <Grid container xs={12} component={'form'}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid container item xs={12} spacing={{ sm: 9, xs: 2 }}>
          {/* ----------- Ticket No. ----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Ticket No." />
            </InputLabel>
            <TextField
              type="text"
              // value={employeeData?.ticket_no || ''}
              name="ticket_no"
              size="small"
              fullWidth
              disabled={!isEditMode}
            />
          </Grid>

          {/* ----------- Airfare Amount ----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Airfare Amount" />
            </InputLabel>
            <TextField
              type="number"
              // value={employeeData?.airfare_amount || ''}
              name="airfare_amount"
              size="small"
              fullWidth
              disabled={!isEditMode}
            />
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={{ sm: 6, xs: 2 }}>
          {/* ----------- Travel Date ----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Travel Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                // value={employeeData?.travel_date ? dayjs(employeeData.travel_date) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="travel_date"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>

          {/* ----------- Return Date ----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Return Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                // value={employeeData?.return_date ? dayjs(employeeData.return_date) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="return_date"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* ----------- Status ----------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Status" />
          </InputLabel>
          <Select
            name="airfare_status"
            size="small"
            fullWidth
            labelId="airfare-status-label"
            id="airfare_status"
            // value={employeeData?.airfare_status || ''}
            disabled={!isEditMode}
          >
            <MenuItem value={'A'}>
              <FormattedMessage id="Approved" />
            </MenuItem>
            <MenuItem value={'R'}>
              <FormattedMessage id="Rejected" />
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
    </Grid>
  );
};
