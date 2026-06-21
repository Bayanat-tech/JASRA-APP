import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface CustomAgGridProps {
  rowData: any[];
  columnDefs: ColDef[];
  onGridReady?: (params: any) => void;
  onSortChanged?: (params: any) => void;
  onFilterChanged?: (params: any) => void;
  onPaginationChanged?: (params: any) => void;
  onSelectionChanged?: (params: any) => void;
  paginationPageSize?: number;
  height?: string;
  headerHeight?: number;
  defaultColDef?: ColDef;
  pinnedBottomRowData?: any[];
  animateRows?: boolean;

  pagination?: boolean;
  paginationPageSizeOptions?: number[];
  paginationPageSizeSelector?: number[];
  editable?: boolean; // New prop
  rowSelection?: 'single' | 'multiple';
  getRowStyle?: (params: any) => any;
  rowHeight?: number;
  onCellValueChanged?: (params: any) => void;
  getRowId?: (params: any) => string; // <-- Add this line
  selectedRows?: any[]; // <-- Add this line
}

const VendorCustomGrid = ({
  rowData,
  columnDefs,
  onGridReady,
  onSortChanged,
  onFilterChanged,
  onPaginationChanged,
  onSelectionChanged,
  paginationPageSize = 100,
  paginationPageSizeSelector,
  height = '470px',
  editable = false,
  rowSelection = 'single',
  getRowStyle,
  rowHeight,
  onCellValueChanged,
  getRowId, // <-- Add this line
  selectedRows, // <-- Add this line,

  ...rest
}: CustomAgGridProps) => {
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      floatingFilter: false,
      editable, // Use the new prop here
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    }),
    [editable] // Add editable to the dependency array
  );

  return (
    <div
      className="ag-theme-alpine custom-ag-theme"
      style={
        {
          height,
          width: '100%',
          border: '1px solid #ddd'
        } as React.CSSProperties
      }
    >
      <style>
        {`
          .ag-column-drop-title {
          font-size: 21px !important;
          }
          .ag-header-cell-text {
          font-size: 13px !important;
           }
          .custom-ag-theme .ag-header-cell {
            font-weight: 600;
            font-size: 11px !important;
          }
        `}
      </style>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={rowSelection}
        pagination={true}
        paginationPageSize={paginationPageSize}
        onGridReady={onGridReady}
        suppressCellFocus={true}
        animateRows={true}
        enableCellTextSelection={true}
        suppressRowClickSelection={true}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSelectionChanged={onSelectionChanged}
        suppressMenuHide={false}
        multiSortKey="ctrl"
        paginationPageSizeSelector={paginationPageSizeSelector}
        getRowStyle={getRowStyle}
        {...(rowHeight ? { rowHeight } : {})}
        onCellValueChanged={onCellValueChanged}
        getRowId={getRowId} // <-- Add this line
        {...(selectedRows ? { selectedRows } : {})} // <-- Add this line
        {...rest}
      />
    </div>
  );
};

export default VendorCustomGrid;
