import { FormControl, MenuItem, Select } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { DebouncedInput } from 'themes/overrides/DebounceInput';

const ColumnFilter = ({ column }: { column: any }) => {
  //----------------constants---------------
  const columnFilterValue = column.getFilterValue(); // Get the current filter value for the column
  const { filterVariant, listData }: { filterVariant: string; listData: { label: string; value: string }[] } = column.columnDef.meta ?? {}; // Get filter variant and list data from column definition

  //-------------------handlers----------------
  const renderFilterField = () => {
    switch (filterVariant) {
      case 'range':
        return (
          <div>
            <div className="flex space-x-2">
              <DebouncedInput
                autoFocus
                size="small"
                type="number"
                value={(columnFilterValue as [number, number])?.[0] ?? ''} // Get the minimum value for the range filter
                onChange={(value: number) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])} // Set the minimum value for the range filter
                placeholder={`Min`}
                className="w-24 border shadow rounded"
              />
              <DebouncedInput
                size="small"
                type="number"
                value={(columnFilterValue as [number, number])?.[1] ?? ''} // Get the maximum value for the range filter
                onChange={(value: any) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])} // Set the maximum value for the range filter
                placeholder={`Max`}
                className="w-24 border shadow rounded"
              />
            </div>
            <div className="h-1" />
          </div>
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <Select
              autoFocus
              sx={{ backgroundColor: 'white' }}
              size="small"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={column.value} // Get the selected value for the select filter
              onChange={(e) => column.setFilterValue(e.target.value)} // Set the selected value for the select filter
            >
              {listData.map((item) => {
                return <MenuItem value={item.value}>{item.label}</MenuItem>; // Render select options
              })}
            </Select>
          </FormControl>
        );
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex justify-between gap-2">
              <DatePicker
                autoFocus
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ backgroundColor: 'white' }}
                className="w-full min-w-28"
                value={(columnFilterValue as [string, string])?.[0] ? dayjs((columnFilterValue as [string, string])?.[0]) : null} // Get the start date for the date filter
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) column.setFilterValue((old: [string, string]) => [newValue.toISOString(), old?.[1]]); // Set the start date for the date filter
                }}
              />
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ backgroundColor: 'white' }}
                className="w-full min-w-28"
                value={(columnFilterValue as [string, string])?.[1] ? dayjs((columnFilterValue as [string, string])?.[1]) : null} // Get the end date for the date filter
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) column.setFilterValue((old: [string, string]) => [old?.[0], newValue.toISOString()]); // Set the end date for the date filter
                }}
              />
            </div>
          </LocalizationProvider>
        );
      default:
        return (
          <DebouncedInput
            autoFocus
            size="small"
            className="w-36 border shadow rounded"
            onChange={(value: string) => {
              column.setFilterValue(value); // Set the filter value for the default text input filter
            }}
            placeholder={`Search...`}
            type="text"
            value={(columnFilterValue ?? '') as string} // Get the filter value for the default text input filter
          />
        );
    }
  };
  return renderFilterField(); // Render the appropriate filter field based on the filter variant
};

export default ColumnFilter;
