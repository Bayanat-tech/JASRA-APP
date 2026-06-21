import { PlusOutlined } from '@ant-design/icons';
import { Grid, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { Stack } from '@mui/system';
// import { DatePicker } from '@mui/x-date-pickers';

// third party

// project import
// import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { availableStatus } from 'utils/constants';

type TSearchFilterProps = {
  title?: string;
  onChange: (arg0: { search_text: string; status?: number }) => void;
  isStatusRequired?: boolean;
};

const SearchFilter = (props: TSearchFilterProps) => {
  const { title = 'Search', onChange = (arg0: { search_text: string; status?: number }) => {}, isStatusRequired = false } = props;

  const [searchFilterData, setSearchFilterData] = useState<{ search_text: string; status?: number }>({ search_text: '', status: 1 });

  useEffect(() => {
    let searchTimeOut: NodeJS.Timeout;

    searchTimeOut = setTimeout(() => {
      onChange(searchFilterData);
    }, 1000);

    return () => {
      clearTimeout(searchTimeOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilterData.search_text, searchFilterData.status]);

  const handleSearchTexChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setSearchFilterData((prev) => ({ ...prev, search_text: value }));
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setSearchFilterData((prev) => ({ ...prev, status: Number(event.target.value) }));
  };

  return (
    <Grid container spacing={1.5} alignItems="center" direction="row" className="w-full min-w-max">
      <Grid item xs={12} sm={isStatusRequired ? 6 : 12}>
        <Stack>
          <InputLabel htmlFor="search_text_field" sx={{ marginLeft: 0.4, marginBottom: 0.2 }}>
            {title || 'Search'}
          </InputLabel>
          <OutlinedInput
            placeholder="Enter a search keyword"
            fullWidth
            required
            type="text"
            name="search_text"
            id="search_text_field"
            value={searchFilterData.search_text}
            onChange={handleSearchTexChange}
            endAdornment={
              !!searchFilterData.search_text?.length && (
                <PlusOutlined className="rotate-45" onClick={() => setSearchFilterData((prev) => ({ ...prev, search_text: '' }))} />
              )
            }
          />
        </Stack>
      </Grid>

      {isStatusRequired && (
        <Grid item xs={12} sm={6}>
          <Stack>
            <InputLabel sx={{ marginLeft: 0.4, marginBottom: 0.2 }}>Status</InputLabel>
            <Select
              fullWidth
              value={searchFilterData.status}
              displayEmpty
              name="status"
              renderValue={(selected) => availableStatus.find((status) => status.value === selected)?.label}
              onChange={handleStatusChange}
            >
              {availableStatus.map((status) => (
                <MenuItem value={status.value}>{status.label}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>
      )}
    </Grid>
  );
};

export type TSearchConditionsObject = {
  field_name: string;
  field_value: string | Array<string> | number | boolean | Date;
  operator: string;
  label?: string;
};

export type ISearch = {
  sort?: { field_name?: string; desc: boolean };
  search: Array<Array<TSearchConditionsObject>>;
};

export default SearchFilter;
