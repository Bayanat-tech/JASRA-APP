import { ArrowDownOutlined, ArrowUpOutlined, MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@mui/material';
import { flexRender } from '@tanstack/react-table';
import ColumnFilter from 'components/filters/ColumnFilter';
import { useState } from 'react';
import { snakeCaseToTitleCase } from 'utils/functions';

const FilterCustomDataTable = ({ header }: { header: any }) => {
  const [searchFilter, setSearchfilter] = useState(false); // State to manage the visibility of the search filter

  return (
    <div className="w-max p-1">
      <div className="flex justify-center">
        <div onClick={header.column.getToggleSortingHandler()} className="flex justify-center items-center">
          {/* Display column header */}
          {header.column.columnDef.id !== 'select-col'
            ? snakeCaseToTitleCase(header.column.columnDef.id) // Convert snake_case to Title Case
            : flexRender(header.column.columnDef.header, header.getContext())}

          {/* Display sorting icon */}
          {{
            asc: <ArrowUpOutlined className="pl-2" />, // Ascending sort icon
            desc: <ArrowDownOutlined className="pl-2" /> // Descending sort icon
          }[header.column.getIsSorted() as string] ?? null}
        </div>
        {header.column.getCanFilter() && (
          <IconButton size="small" className="ml-2" onClick={() => setSearchfilter(!searchFilter)}>
            <MoreOutlined style={{ fontSize: '16px', color: 'white' }} />
          </IconButton>
        )}
      </div>
      {header.column.getCanFilter() && searchFilter === true && (
        <div className="flex justify-center">
          <ColumnFilter column={header.column} /> {/* Render column filter */}
        </div>
      )}
    </div>
  );
};

export default FilterCustomDataTable;
